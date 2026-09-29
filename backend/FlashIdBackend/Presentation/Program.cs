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
using Presentation.HealthChecks;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "FrontendCorsPolicy";

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
}

builder.Services.AddInfrastructure(builder.Configuration);
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

// Azure App Service terminates TLS and forwards requests, so the real client IP is in X-Forwarded-For.
// ForwardLimit = 1 only trusts the last hop (added by the Azure front end), so clients cannot spoof it.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});
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

builder.Services.AddHealthChecks()
    .AddCheck<CredentialSigningKeyHealthCheck>("credential-signing-key", tags: ["readiness"]);

// Integration tests hit the same endpoints many times a minute, so limits are off in Testing.
var rateLimitsEnabled = !builder.Environment.IsEnvironment("Testing");

static string IpPartitionKey(HttpContext httpContext) =>
    httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

// Falls back to the IP when there is no signed-in user, so anonymous callers still get their own bucket.
static string UserPartitionKey(HttpContext httpContext) =>
    httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
    ?? IpPartitionKey(httpContext);

RateLimitPartition<string> FixedWindowPartition(string partitionKey, int permitLimit, TimeSpan window) =>
    rateLimitsEnabled
        ? RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: partitionKey,
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = window,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            })
        : RateLimitPartition.GetNoLimiter(partitionKey);

// For anonymous endpoints: each client IP gets its own bucket.
void AddIpPartitionedPolicy(RateLimiterOptions options, string policyName, int permitLimit, TimeSpan window) =>
    options.AddPolicy(policyName, httpContext =>
        FixedWindowPartition(IpPartitionKey(httpContext), permitLimit, window));

// For signed-in endpoints: each user gets their own bucket.
void AddUserPartitionedPolicy(RateLimiterOptions options, string policyName, int permitLimit, TimeSpan window) =>
    options.AddPolicy(policyName, httpContext =>
        FixedWindowPartition(UserPartitionKey(httpContext), permitLimit, window));

builder.Services.AddRateLimiter(options =>
{
    var oneMinute = TimeSpan.FromMinutes(1);

    // Anonymous endpoints: limits stop brute-forcing passwords, OTPs and activation codes.
    AddIpPartitionedPolicy(options, "register", permitLimit: 5, window: oneMinute);
    AddIpPartitionedPolicy(options, "resend-otp", permitLimit: 3, window: oneMinute);
    AddIpPartitionedPolicy(options, "verify-email", permitLimit: 5, window: oneMinute);
    AddIpPartitionedPolicy(options, "login", permitLimit: 10, window: oneMinute);
    AddIpPartitionedPolicy(options, "verify-device", permitLimit: 5, window: oneMinute);
    AddIpPartitionedPolicy(options, "password-reset", permitLimit: 5, window: oneMinute);

    // Signed-in endpoints.
    AddUserPartitionedPolicy(options, "resend-device-verification", permitLimit: 3, window: oneMinute);
    AddUserPartitionedPolicy(options, "verify-password", permitLimit: 5, window: oneMinute);
    AddUserPartitionedPolicy(options, "update-password", permitLimit: 5, window: oneMinute);
    AddUserPartitionedPolicy(options, "email-change-request", permitLimit: 5, window: oneMinute);
    AddUserPartitionedPolicy(options, "email-change-resend-otp", permitLimit: 3, window: oneMinute);
    AddUserPartitionedPolicy(options, "email-change-confirm", permitLimit: 5, window: oneMinute);
    AddUserPartitionedPolicy(options, "activate-token", permitLimit: 5, window: oneMinute);
    AddUserPartitionedPolicy(options, "issue-credential", permitLimit: 5, window: oneMinute);
    AddUserPartitionedPolicy(options, "citizen-status-lookup", permitLimit: 20, window: oneMinute);
    AddUserPartitionedPolicy(options, "onboarding-verify", permitLimit: 20, window: oneMinute);
    AddUserPartitionedPolicy(options, "verify-badge", permitLimit: 20, window: oneMinute);
    AddUserPartitionedPolicy(options, "resolve-credential", permitLimit: 30, window: oneMinute);
    AddUserPartitionedPolicy(options, "emergency-resolve", permitLimit: 10, window: oneMinute);
    AddUserPartitionedPolicy(options, "emergency-offline-access", permitLimit: 20, window: oneMinute);

    // Backstop for every request, including endpoints without a named policy.
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        FixedWindowPartition(UserPartitionKey(httpContext), permitLimit: 300, window: oneMinute));

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
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

app.UseForwardedHeaders();
app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors(FrontendCorsPolicy);
app.UseAuthentication();
// move to after authentication so user-partitioned policies can see who is signed in.
app.UseRateLimiter();
app.UseMiddleware<Presentation.Middleware.CsrfProtectionMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.MapHealthChecks("/health", new HealthCheckOptions { Predicate = check => !check.Tags.Contains("readiness") });

app.MapHealthChecks("/health/ready");

app.MapControllers();

await app.RunAsync();

public partial class Program { }
