using Application.Common.Interfaces;
using Application.Common.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICitizenRecordService, CitizenRecordService>();
        services.AddScoped<ICredentialsService, CredentialsService>();
        return services;
    }
}
