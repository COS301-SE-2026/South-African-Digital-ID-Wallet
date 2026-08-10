using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class TrustedDeviceRepository : ITrustedDeviceRepository
{
    private readonly AppDbContext _context;

    public TrustedDeviceRepository(AppDbContext context)
    {
        _context = context;
    }

    // public async Task<Citizen?> GetCitizenByUserIdAsync(Guid userId)
    // {
    //     return await _context.Citizens
    //         .FirstOrDefaultAsync(c => c.UserId == userId);
    // }

    public async Task<List<TrustedDevice>> GetTrustedDevicesByUserIdAsync(Guid userId)
    {
        return await _context.TrustedDevices
            .AsNoTracking()
            .Where(td => td.UserId == userId)
            .OrderByDescending(td => td.LastActive)
            .ToListAsync();
    }

    public async Task<bool> UnlinkDeviceAsync(Guid userId, Guid deviceId)
    {
        var device = await _context.TrustedDevices
            .FirstOrDefaultAsync(d =>
                d.Id == deviceId &&
                d.UserId == userId);

        if (device == null)
            return false;

        _context.TrustedDevices.Remove(device);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<TrustedDevice?> GetByTokenHashAsync(Guid userId, string deviceTokenHash, CancellationToken cancellationToken)
    {
        return await _context.TrustedDevices.FirstOrDefaultAsync(device =>
            device.DeviceTokenHash == deviceTokenHash &&
            device.UserId == userId && device.IsTrusted, cancellationToken);
    }

    public async Task AddTrustedDeviceAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken)
    {
        await _context.TrustedDevices.AddAsync(trustedDevice, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateTrustedDeviceAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken)
    {
        _context.TrustedDevices.Update(trustedDevice);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AddDeviceVerificationAsync(DeviceVerification deviceVerification,
        CancellationToken cancellationToken)
    {
        await _context.DeviceVerifications.AddAsync(deviceVerification, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateDeviceVerificationAsync(DeviceVerification deviceVerification,
        CancellationToken cancellationToken)
    {
        _context.DeviceVerifications.Update(deviceVerification);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<DeviceVerification?> GetDeviceVerificationAsync(Guid deviceVerificationId,
        CancellationToken cancellationToken)
    {
        return await _context.DeviceVerifications.FirstOrDefaultAsync(d => d.Id == deviceVerificationId, cancellationToken);
    }


}