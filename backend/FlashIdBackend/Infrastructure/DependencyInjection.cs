using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Providers;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Infrastructure.Services.GovernmentRegistry;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

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
        services.AddScoped<IInstitutionRepository, InstitutionRepository>();

        services.AddTransient<IEmailSenderProvider, EmailSenderProvider>();


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
            client.BaseAddress = new Uri(configuration["SmsPortalProvider:BaseUrl"]);
        });

        return services;
    }
}