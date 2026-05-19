using Application.Common.Interfaces;
using Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services
    )
    {
        services.AddScoped<IInstitutionService, InstitutionService>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}