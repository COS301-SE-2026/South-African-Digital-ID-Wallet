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
        services.AddScoped<IDashboardAccountCardService, DashboardAccountCardService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IActivityOverviewService, ActivityOverviewService>();
        services.AddScoped<ITrustedDeviceService, TrustedDeviceService>();
        services.AddScoped<IOfficialBadgeService, OfficialBadgeService>();
        services.AddSingleton<CitizenMapper>();
        services.AddSingleton<CredentialMapper>();
        services.AddSingleton<InstitutionMapper>();
        services.AddScoped<IManageUserAccountService, ManageUserAccountService>();
        services.AddSingleton<AuthMapper>();
        services.AddSingleton<TrustedDeviceMapper>();
        services.AddSingleton<ActivityOverviewMapper>();
        services.AddSingleton<DashboardAccountCardMapper>();
        services.AddSingleton<NotificationMapper>();
        services.AddScoped<ICitizenVerificationService, CitizenVerificationService>();
        services.AddScoped<ICredentialActivationService, CredentialActivationService>();
        services.AddSingleton<ManageUserAccountMapper>();
        services.AddScoped<IUpdatePasswordService, UpdatePasswordService>();
        services.AddScoped<IDeleteAccountService, DeleteAccountService>();
        services.AddScoped<ICredentialExpiryService, CredentialExpiryService>();
        services.AddSingleton<CredentialExpiryMapper>();
        services.AddScoped<IIssueCredentialService, IssueCredentialService>();
        services.AddScoped<IAdminDashboardService, AdminDashboardService>();
        return services;
    }
}