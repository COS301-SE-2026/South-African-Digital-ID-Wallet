using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Services;
using Azure.Storage.Blobs;
using Domain.Entities;
using Infrastructure;
using Infrastructure.Repositories;
using Infrastructure.Providers;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Presentation.Controllers;
using Microsoft.AspNetCore.Mvc;
using Infrastructure.Data;
using Application;
using Microsoft.ApplicationInsights.Extensibility;

namespace tests;

public class DependencyInjectionTests
{
    [Fact]
    public void AddInfrastructure_ReturnsSameServiceCollectionInstance()
    {
        var services = new ServiceCollection();
        var result = services.AddInfrastructure();

        Assert.Same(services, result);
    }

    public static IEnumerable<object[]> ExpectedRegistrations()
    {
        yield return new object[] { typeof(IPasswordHasher<User>), typeof(PasswordHasher<User>), ServiceLifetime.Scoped };
        yield return new object[] { typeof(IPasswordHashingProvider), typeof(PasswordHashingProvider), ServiceLifetime.Scoped };
        yield return new object[] { typeof(IJwtTokenProvider), typeof(JwtTokenProvider), ServiceLifetime.Scoped };
        yield return new object[] { typeof(IAuthRepository), typeof(AuthRepository), ServiceLifetime.Scoped };
        yield return new object[] { typeof(IOnboardingRepository), typeof(OnboardingRepository), ServiceLifetime.Scoped };
        yield return new object[] { typeof(ICitizenRepository), typeof(CitizenRepository), ServiceLifetime.Scoped };
        yield return new object[] { typeof(ICredentialRepository), typeof(CredentialRepository), ServiceLifetime.Scoped };
        yield return new object[] { typeof(IInstitutionRepository), typeof(InstitutionRepository), ServiceLifetime.Scoped };
        yield return new object[] { typeof(ITrustedDeviceRepository), typeof(TrustedDeviceRepository), ServiceLifetime.Scoped };
        yield return new object[] { typeof(IActivityOverviewRepository), typeof(ActivityOverviewRepository), ServiceLifetime.Scoped };
        yield return new object[] { typeof(IDashboardAccountCardRepository), typeof(DashboardAccountCardRepository), ServiceLifetime.Scoped };
        yield return new object[] { typeof(INotificationRepository), typeof(NotificationRepository), ServiceLifetime.Scoped };
        yield return new object[] { typeof(IEmailSenderProvider), typeof(EmailSenderProvider), ServiceLifetime.Transient };
        yield return new object[] { typeof(IQrSigningProvider), typeof(Ed25519SigningProvider), ServiceLifetime.Singleton };
        yield return new object[] { typeof(IQrDisclosureTokenRepository), typeof(CosmosQrDisclosureTokenRepository), ServiceLifetime.Scoped };
        yield return new object[] { typeof(IPhotoStorageProvider), typeof(AzureBlobPhotoStorageProvider), ServiceLifetime.Singleton };
        yield return new object[] { typeof(IDisclosedFieldsValueResolver), typeof(DisclosedFieldValueResolver), ServiceLifetime.Scoped };
        yield return new object[] { typeof(IOfficialRepository), typeof(OfficialRepository), ServiceLifetime.Scoped };
        yield return new object[] { typeof(IVerificationRepository), typeof(VerificationRepository), ServiceLifetime.Scoped };
        yield return new object[] { typeof(ICredentialsActivationRepository), typeof(CredentialsActivationRepository), ServiceLifetime.Scoped };
    }

    [Theory]
    [MemberData(nameof(ExpectedRegistrations))]
    public void AddInfrastructure_RegistersExpectedServiceWithLifetime(Type serviceType, Type implementationType, ServiceLifetime lifetime)
    {
        var services = new ServiceCollection();
        services.AddInfrastructure();

        Assert.Contains(services, sd =>
            sd.ServiceType == serviceType &&
            sd.ImplementationType == implementationType &&
            sd.Lifetime == lifetime
        );
    }

    [Fact]
    public void AddInfrastructure_RegistersBlobServiceClient()
    {
        var services = new ServiceCollection();
        services.AddInfrastructure();

        Assert.Contains(services, sd =>
            sd.ServiceType == typeof(BlobServiceClient) &&
            sd.Lifetime == ServiceLifetime.Singleton &&
            sd.ImplementationFactory != null
        );
    }

    [Fact]
    public void AddInfrastructure_RegistersTypedHttpClient_ForGovernmentRegistryGateway()
    {
        var services = new ServiceCollection();
        services.AddInfrastructure();

        Assert.Contains(services, sd => sd.ServiceType == typeof(IGovernmentRegistryGateway));
    }

    [Fact]
    public void AddApplicationAndInfrastructure_RegistersEveryControllerConstructorDependency()
    {
        var services = new ServiceCollection();
        services.AddApplication();
        services.AddInfrastructure();

        var applicationAssembly = typeof(IAdminDashboardService).Assembly;
        var registered = services.Select(sd => sd.ServiceType).ToHashSet();

        var controllerTypes = typeof(AdminDashboardController).Assembly
            .GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && typeof(ControllerBase).IsAssignableFrom(t))
            .ToList();

        Assert.NotEmpty(controllerTypes);

        var missing = controllerTypes
            .SelectMany(cont => cont
                .GetConstructors()
                .SelectMany(ctor => ctor.GetParameters())
                .Where(p => p.ParameterType.Assembly == applicationAssembly)
                .Where(p => !registered.Contains(p.ParameterType))
                .Select(p => $"{cont.Name} -> {p.ParameterType.Name}"))
            .Distinct()
            .ToList();

        Assert.Empty(missing);
    }
}