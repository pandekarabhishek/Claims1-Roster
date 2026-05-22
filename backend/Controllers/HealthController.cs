using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamPulse.API.Data;
using TeamPulse.API.DTOs;

namespace TeamPulse.API.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;

    public HealthController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        string dbStatus;
        try
        {
            await _db.Database.ExecuteSqlRawAsync("SELECT 1");
            dbStatus = "connected";
        }
        catch
        {
            dbStatus = "error";
        }

        return Ok(new HealthResponse(
            Status:      "ok",
            Version:     "1.0.0",
            Environment: Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            DbStatus:    dbStatus,
            Timestamp:   DateTime.UtcNow
        ));
    }
}
