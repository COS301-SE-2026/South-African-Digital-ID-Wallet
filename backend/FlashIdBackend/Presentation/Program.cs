using System.Text;
using System.Threading.RateLimiting;
using Application;
using Infrastructure;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Presentation.ExceptionHandling;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Services;
using Infrastructure.Repositories;
using System.Security.Claims;
using Microsoft.Azure.Cosmos;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "FrontendCorsPolicy";

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
}

builder.Services.AddInfrastructure();

builder.Services.AddApplication();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Title = "FlashID API",
        Version = "v1",
        Description = "South African Digital ID Wallet backend API.",
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);

    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

builder.Services.AddScoped<IDeleteAccountService, DeleteAccountService>();
builder.Services.AddScoped<IDeleteAccountRepository, DeleteAccountRepository>();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            ),
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.ContainsKey("access_token"))
                {
                    context.Token = context.Request.Cookies["access_token"];
                }
                return Task.CompletedTask;
            },
            OnTokenValidated = async context =>
            {
                var userId = context.Principal?.FindFirstValue("userId");
                var tokenVersion = context.Principal?.FindFirstValue("tv");
                if (userId is null || tokenVersion is null || !Guid.TryParse(userId, out var id))
                {
                    context.Fail("Missing identity claims.");
                    return;
                }
                var repository = context.HttpContext.RequestServices.GetRequiredService<IAuthRepository>();
                var user = await repository.GetUserByIdAsync(id);
                if (user is null || user.TokenVersion.ToString() != tokenVersion)
                {
                    context.Fail("Token has been revoked.");
                }
            },
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddHealthChecks();

static string UserPartitionKey(HttpContext httpContext) =>
    httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
    ?? httpContext.Connection.RemoteIpAddress?.ToString()
    ?? "unknown";

static void AddUserPartitionedPolicy(RateLimiterOptions options, string policyName, int permitLimit, TimeSpan window) =>
    options.AddPolicy(policyName, httpContent =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: UserPartitionKey(httpContent),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = window,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            }
        )
    );

// 5 registration attempts per minute per client — prevents brute-forcing activation codes
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("register", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });

    options.AddFixedWindowLimiter("resend-otp", opt =>
    {
        opt.PermitLimit = 3;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });

    AddUserPartitionedPolicy(options, "resend-device-verification", permitLimit: 3, window: TimeSpan.FromMinutes(1));


    AddUserPartitionedPolicy(options, "verify-password", permitLimit: 5, window: TimeSpan.FromMinutes(1));
    AddUserPartitionedPolicy(options, "email-change-request", permitLimit: 5, window: TimeSpan.FromMinutes(1));
    AddUserPartitionedPolicy(options, "email-change-resend-otp", permitLimit: 3, window: TimeSpan.FromMinutes(1));
    AddUserPartitionedPolicy(options, "email-change-confirm", permitLimit: 5, window: TimeSpan.FromMinutes(1));
    AddUserPartitionedPolicy(options, "issue-credential", permitLimit: 5, window: TimeSpan.FromMinutes(1));
    AddUserPartitionedPolicy(options, "citizen-status-lookup", permitLimit: 20, window: TimeSpan.FromMinutes(1));

    options.RejectionStatusCode = 429;
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsEnvironment("Testing"))
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        if (/*app.Environment.IsDevelopment() && */!await db.DomainUsers.AnyAsync())
        {
            Console.WriteLine("[SEED] Database is empty, seeding sample data ...");
            //await DbSeeder.SeedAsync(db);
            Console.WriteLine("[SEED] Database seeded successfully!");
        }
    }

    using (var scope = app.Services.CreateScope())
    {
        var cosmosClient = scope.ServiceProvider.GetRequiredService<CosmosClient>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var dbName = configuration["Cosmos:DatabaseName"];
        var containerName = configuration["Cosmos:ContainerName"];

        var dbResponse = await cosmosClient.CreateDatabaseIfNotExistsAsync(dbName);

        await dbResponse.Database.CreateContainerIfNotExistsAsync(new ContainerProperties(containerName, "/id")
        {
            DefaultTimeToLive = -1
        });
    }
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors(FrontendCorsPolicy);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapHealthChecks("/health");
app.MapControllers();

await app.RunAsync();

public partial class Program { }
