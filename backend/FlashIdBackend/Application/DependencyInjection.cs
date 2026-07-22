using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICitizenService, CitizenService>();
        services.AddScoped<ICredentialService, CredentialService>();
        services.AddScoped<IOnboardingService, OnboardingService>();
        services.AddScoped<IInstitutionService, InstitutionService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IQrService, QrService>();
        services.AddSingleton<CitizenMapper>();
        services.AddSingleton<CredentialMapper>();
        services.AddSingleton<InstitutionMapper>();
        services.AddSingleton<AuthMapper>();
        services.AddSingleton<TrustedDeviceMapper>();
        services.AddSingleton<ActivityOverviewMapper>();
        services.AddSingleton<DashboardAccountCardMapper>();
        services.AddSingleton<NotificationMapper>();
        return services;
    }
}