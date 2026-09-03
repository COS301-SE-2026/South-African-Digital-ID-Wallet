using System.Net.Http.Headers;
using System.Text;
using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Infrastructure.Gateways.GovernmentRegistry;
using Infrastructure.Providers;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Azure.Storage.Blobs;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Services;
using Microsoft.Azure.Cosmos;
using User = Domain.Entities.User;
using Infrastructure.Repositories.Decorators;
using Infrastructure.BackgroundJobs;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services)
    {
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        services.AddScoped<IPasswordHashingProvider, PasswordHashingProvider>();
        services.AddScoped<IJwtTokenProvider, JwtTokenProvider>();

        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<IOnboardingRepository, OnboardingRepository>();

        services.AddScoped<ICitizenRepository, CitizenRepository>();
        services.AddScoped<ICredentialRepository, CredentialRepository>();
        services.AddScoped<IInstitutionRepository, InstitutionRepository>();
        services.AddScoped<ITrustedDeviceRepository, TrustedDeviceRepository>();
        services.AddScoped<IActivityOverviewRepository, ActivityOverviewRepository>();
        services.AddScoped<IDashboardAccountCardRepository, DashboardAccountCardRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddSingleton<IDeviceTokenProvider, DeviceTokenProvider>();

        services.AddTransient<IEmailSenderProvider, EmailSenderProvider>();

        services.AddScoped<ICredentialRepository, CredentialRepository>();
        services.AddSingleton<IQrSigningProvider, Ed25519SigningProvider>();
        services.AddSingleton(n =>
        {
            var configuration = n.GetRequiredService<IConfiguration>();
            var connectionString = configuration["Cosmos:ConnectionString"] ?? throw new InvalidOperationException("Cosmos:ConnectionString is not configured.");
            return new CosmosClient(connectionString, new CosmosClientOptions
            {
                SerializerOptions = new CosmosSerializationOptions
                { PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase },
            });
        });
        services.AddScoped<IQrDisclosureTokenRepository, CosmosQrDisclosureTokenRepository>();
        services.AddSingleton(n =>
        {
            var configuration = n.GetRequiredService<IConfiguration>();
            var connectionString = configuration["BlobStorage:ConnectionString"] ?? throw new InvalidOperationException("BlobStorage:ConnectionString not configured.");
            return new BlobServiceClient(connectionString);
        });
        services.AddSingleton<IPhotoStorageProvider, AzureBlobPhotoStorageProvider>();
        services.AddScoped<IDisclosedFieldsValueResolver, DisclosedFieldValueResolver>();

        services.AddScoped<IOfficialRepository, OfficialRepository>();
        services.AddScoped<IOfficialActivityRepository, OfficialActivityRepository>();

        services.AddScoped<IManageUserAccountRepository, ManageUserAccountRepository>();
        services.AddScoped<IUpdatePasswordRepository, UpdatePasswordRepository>();
        services.AddScoped<IDeleteAccountRepository, DeleteAccountRepository>();

        services.AddHttpClient<IGovernmentRegistryGateway, GovernmentRegistryGateway>((serviceProvider, client) =>
        {
            var configuration = serviceProvider.GetRequiredService<IConfiguration>();
            client.BaseAddress = new Uri(configuration["GovernmentRegistry:BaseUrl"]!);
            client.DefaultRequestHeaders.Add(
                "X-API-KEY",
                configuration["GovernmentRegistry:ApiKeyGov"]);
        });

        services.AddHttpClient<ISmsProvider, SmsPortalProvider>((serviceProvider, client) =>
        {
            var configuration = serviceProvider.GetRequiredService<IConfiguration>();
            var baseUrl = configuration["SmsPortalProvider:BaseUrl"];
            var apiKey = configuration["SmsPortalProvider:ApiKey"];
            var apiSecret = configuration["SmsPortalProvider:ApiSecret"];
            if (string.IsNullOrWhiteSpace(baseUrl) ||
                string.IsNullOrWhiteSpace(apiKey) ||
                string.IsNullOrWhiteSpace(apiSecret))
            {
                throw new InvalidOperationException("SMSPortal configuration is missing.");
            }
            var apiCredential = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{apiKey}:{apiSecret}"));
            client.BaseAddress = new Uri(baseUrl);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", apiCredential);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        });

        services.AddScoped<ISmsProvider, AzureCommunicationSmsProvider>();
        services.AddScoped<IVerificationRepository, VerificationRepository>();
        services.AddScoped<ICredentialsActivationRepository, CredentialsActivationRepository>();

        services.AddScoped<CredentialExpiryRepository>();
        services.AddScoped<ICredentialExpiryRepository>(sp => new RetryingCredentialExpiryRepositoryDecorator(sp.GetRequiredService<CredentialExpiryRepository>()));
        services.AddHostedService<CredentialExpiryBackgroundService>();

        services.AddScoped<CredentialUpdateRepository>();
        services.AddScoped<ICredentialUpdateRepository>(sp => new RetryingCredentialUpdateRepositoryDecorator(sp.GetRequiredService<CredentialUpdateRepository>()));
        services.AddHostedService<CredentialUpdateBackgroundService>();

        services.AddScoped<IAdminDashboardRepository, AdminDashboardRepository>();
        services.AddSingleton<IFaceLivenessServiceProvider, AzureFaceLivenessServiceProvider>();
        services.AddScoped<IPhysicalIdentityVerificationRepository, PhysicalIdentityVerificationRepository>();
        return services;
    }
}