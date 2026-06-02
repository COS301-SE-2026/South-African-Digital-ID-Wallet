using Application.Common.Interfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Application services — contain business logic

        services.AddScoped<ICitizenService, CitizenService>();


        // Mapperly mappers — source-generated, no runtime reflection
        services.AddSingleton<CitizenMapper>();


        return services;
    }
}