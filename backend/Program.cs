using Microsoft.EntityFrameworkCore;
using Serilog;
using TeamPulse.API.Data;

// ── Serilog setup ──────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console());

// ── Services ───────────────────────────────────────────

// PostgreSQL via EF Core
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npg => npg.EnableRetryOnFailure(3)
    )
);

// CORS — allow frontend origins
var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(o => o.AddPolicy("FrontendPolicy", p =>
{
    p.WithOrigins(allowedOrigins)
     .AllowAnyHeader()
     .AllowAnyMethod();

    if (builder.Environment.IsDevelopment())
        p.SetIsOriginAllowed(_ => true);   // allow localhost in dev
}));

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "TeamPulse API", Version = "v1" });
});

// ── Build ──────────────────────────────────────────────
var app = builder.Build();

// ── Auto-migrate on startup ────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        db.Database.Migrate();
        Log.Information("Database migration applied successfully");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Database migration failed");
    }
}

// ── Middleware pipeline ────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "TeamPulse API v1"));
}

app.UseSerilogRequestLogging();
app.UseCors("FrontendPolicy");
app.UseAuthorization();
app.MapControllers();

Log.Information("TeamPulse API starting on {Env}", app.Environment.EnvironmentName);
app.Run();
