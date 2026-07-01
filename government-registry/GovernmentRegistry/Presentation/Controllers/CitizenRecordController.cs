using Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/citizens")]
public class CitizenRecordController:ControllerBase
{
    private readonly ICitizenRecordService _citizenRecordService;

    public CitizenRecordController(ICitizenRecordService citizenRecordService)
    {
        _citizenRecordService = citizenRecordService;
    }

    [HttpGet("{saId}")]
    public async Task<IActionResult> GetCitizenById(string saId)
    {
        var citizenRecord = await _citizenRecordService.GetCitizenRecord(saId);
        
        if(citizenRecord is null)
            return NotFound(new {message = "Citizen record not found"});
        
        return Ok(citizenRecord);
    }
    
    
}