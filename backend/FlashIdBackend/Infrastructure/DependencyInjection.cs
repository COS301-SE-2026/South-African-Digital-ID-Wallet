using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Providers;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
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
        services.AddScoped<IMockGovernmentRegistryRepository, MockGovernmentRegistryRepository>();
        services.AddScoped<IOnboardingRepository, OnboardingRepository>();

        services.AddScoped<ICitizenRepository, CitizenRepository>();
        services.AddScoped<ICredentialRepository, CredentialRepository>();
        services.AddScoped<IInstitutionRepository, InstitutionRepository>();

        services.AddTransient<IEmailSenderProvider, EmailSenderProvider>();

        return services;
    }
}