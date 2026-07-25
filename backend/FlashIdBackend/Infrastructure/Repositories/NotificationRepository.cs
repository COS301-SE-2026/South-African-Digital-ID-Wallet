using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Features.Notifications.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Citizen?> GetCitizenByUserIdAsync(Guid userId)
    {
        return await _context.Citizens
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task<List<NotificationDto>> GetNotificationsByCitizenIdAsync(Guid citizenId)
    {
        return await _context.Notifications
            .AsNoTracking()
            .Where(n => n.CitizenId == citizenId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Description = n.Description,
                Tone = n.Tone
            })
            .ToListAsync();
    }
}