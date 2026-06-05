using Application.Common.Interfaces;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Domain.Entities;
using Infrastructure.Providers;
using Infrastructure.Repositories;
using Infrastructure.Services;
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
        services.AddScoped<IInstitutionService, InstitutionService>();
        services.AddScoped<ICitizenRepository, CitizenRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IMockGovernmentRegistryRepository, MockGovernmentRegistryRepository>();
        services.AddScoped<IOnboardingRepository, OnboardingRepository>();


        return services;
    }
}
