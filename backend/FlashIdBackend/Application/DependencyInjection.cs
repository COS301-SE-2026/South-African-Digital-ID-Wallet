using Application.Common.Interfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICitizenService, CitizenService>();
        services.AddScoped<IOnboardingService, OnboardingService>();


        services.AddSingleton<CitizenMapper>();

        return services;
    }
}