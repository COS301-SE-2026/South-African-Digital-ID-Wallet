using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Application.Mappers;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services)
    {
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        services.AddScoped<IInstitutionService, InstitutionService>();
        services.AddScoped<ICitizenService, CitizenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<MockGovernmentRegistryService>();
        services.AddScoped<IOnboardingService, OnboardingService>();

        services.AddSingleton<CitizenMapper>();
        services.AddSingleton<AuthMapper>();
        services.AddSingleton<InstitutionMapper>();
        services.AddSingleton<OnboardingMapper>();

        return services;
    }
}
