using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.GovAdminAuditLog.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/admin/audit-log")]
[Authorize(Roles = "GovernmentAdministrator")]
public class GovAdminAuditLogController : ControllerBase
{
    private readonly IGovAdminAuditLogService _service;

    public GovAdminAuditLogController(IGovAdminAuditLogService service)
    {
        _service = service;
    }

    [HttpGet]
    [ProducesResponseType(typeof(GovAdminAuditLogResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] string? search,
        [FromQuery] string? action,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        var result = await _service.GetAuditLogsAsync(search, action, dateFrom, dateTo, page, pageSize);
        return Ok(result);
    }
}