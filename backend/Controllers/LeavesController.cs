using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamPulse.API.Data;
using TeamPulse.API.DTOs;
using TeamPulse.API.Models;

namespace TeamPulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LeavesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<LeavesController> _logger;

    public LeavesController(AppDbContext db, ILogger<LeavesController> logger)
    {
        _db = db;
        _logger = logger;
    }

    // ── GET /api/leaves ──────────────────────────────
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LeaveResponse>>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var leaves = await _db.Leaves
            .OrderByDescending(l => l.FromDate)
            .Select(l => ToResponse(l))
            .ToListAsync();

        return Ok(new ApiResponse<IEnumerable<LeaveResponse>>(true, leaves));
    }

    // ── GET /api/leaves/{id} ─────────────────────────
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<LeaveResponse>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var leave = await _db.Leaves.FindAsync(id);
        if (leave is null)
            return NotFound(new ApiResponse<LeaveResponse>(false, null, "Leave entry not found"));

        return Ok(new ApiResponse<LeaveResponse>(true, ToResponse(leave)));
    }

    // ── GET /api/leaves/emp/{name} ───────────────────
    [HttpGet("emp/{name}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LeaveResponse>>), 200)]
    public async Task<IActionResult> GetByEmp(string name)
    {
        var leaves = await _db.Leaves
            .Where(l => l.Emp == Uri.UnescapeDataString(name))
            .OrderByDescending(l => l.FromDate)
            .Select(l => ToResponse(l))
            .ToListAsync();

        return Ok(new ApiResponse<IEnumerable<LeaveResponse>>(true, leaves));
    }

    // ── POST /api/leaves ─────────────────────────────
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LeaveResponse>), 201)]
    [ProducesResponseType(typeof(ApiResponse<LeaveResponse>), 400)]
    public async Task<IActionResult> Create([FromBody] CreateLeaveRequest req)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage));
            return BadRequest(new ApiResponse<LeaveResponse>(false, null, errors));
        }

        if (req.FromDate > req.ToDate)
            return BadRequest(new ApiResponse<LeaveResponse>(false, null,
                "FromDate must be before or equal to ToDate"));

        var leave = new Leave
        {
            Emp      = req.Emp.Trim(),
            Type     = req.Type,
            FromDate = req.FromDate,
            ToDate   = req.ToDate,
            Note     = req.Note?.Trim() ?? string.Empty,
        };

        _db.Leaves.Add(leave);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Leave created: {Id} for {Emp} ({Type} {From}–{To})",
            leave.Id, leave.Emp, leave.Type, leave.FromDate, leave.ToDate);

        return CreatedAtAction(
            nameof(GetById),
            new { id = leave.Id },
            new ApiResponse<LeaveResponse>(true, ToResponse(leave))
        );
    }

    // ── DELETE /api/leaves/{id} ──────────────────────
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var leave = await _db.Leaves.FindAsync(id);
        if (leave is null)
            return NotFound(new ApiResponse<object>(false, null, "Leave entry not found"));

        _db.Leaves.Remove(leave);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Leave deleted: {Id} ({Emp})", leave.Id, leave.Emp);

        return Ok(new ApiResponse<object>(true, new { message = "Leave entry deleted" }));
    }

    // ── Helper ───────────────────────────────────────
    private static LeaveResponse ToResponse(Leave l) => new(
        l.Id, l.Emp, l.Type,
        l.FromDate, l.ToDate,
        l.Note, l.DayCount, l.CreatedAt
    );
}
