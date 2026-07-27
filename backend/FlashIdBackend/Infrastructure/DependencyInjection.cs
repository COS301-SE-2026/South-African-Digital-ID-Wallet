using System.Net.Http.Headers;
using System.Text;
using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Gateways.GovernmentRegistry;
using Infrastructure.Providers;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Azure.Storage.Blobs;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Services;

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

        services.AddTransient<IEmailSenderProvider, EmailSenderProvider>();

        services.AddScoped<ICredentialRepository, CredentialRepository>();
        services.AddSingleton<IQrSigningProvider, Ed25519SigningProvider>();
        services.AddScoped<IQrDisclosureTokenRepository, QrDisclosureTokenRepository>();
        services.AddSingleton(n =>
        {
            var configuration = n.GetRequiredService<IConfiguration>();
            var connectionString = configuration["BlobStorage:ConnectionString"] ?? throw new InvalidOperationException("BlobStorage:ConnectionString not configured.");
            return new BlobServiceClient(connectionString);
        });
        services.AddSingleton<IPhotoStorageProvider, AzureBlobPhotoStorageProvider>();
        services.AddScoped<IDisclosedFieldsValueResolver, DisclosedFieldValueResolver>();

        services.AddScoped<IOfficialRepository, OfficialRepository>();

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
        return services;
    }
}