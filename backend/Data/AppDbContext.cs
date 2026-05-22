using Microsoft.EntityFrameworkCore;
using TeamPulse.API.Models;

namespace TeamPulse.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Leave> Leaves => Set<Leave>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Leave>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                  .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("NOW()");

            entity.HasIndex(e => e.Emp);
            entity.HasIndex(e => e.FromDate);

            // Restrict type values at DB level
            entity.HasCheckConstraint(
                "CK_Leaves_Type",
                "\"Type\" IN ('planned','sick','wfh','holiday','personal')"
            );
        });

        // Seed data
        modelBuilder.Entity<Leave>().HasData(
            new Leave { Id = Guid.Parse("11111111-0000-0000-0000-000000000001"), Emp = "Aishwarya Nalawade",   Type = "planned", FromDate = new DateOnly(2026,4,1),  ToDate = new DateOnly(2026,4,9),  Note = "" },
            new Leave { Id = Guid.Parse("11111111-0000-0000-0000-000000000002"), Emp = "Chaitali Lande",       Type = "planned", FromDate = new DateOnly(2026,4,24), ToDate = new DateOnly(2026,4,29), Note = "Travel" },
            new Leave { Id = Guid.Parse("11111111-0000-0000-0000-000000000003"), Emp = "Dinesh Wagh",          Type = "planned", FromDate = new DateOnly(2026,4,6),  ToDate = new DateOnly(2026,4,6),  Note = "" },
            new Leave { Id = Guid.Parse("11111111-0000-0000-0000-000000000004"), Emp = "Shubham Modi",         Type = "sick",    FromDate = new DateOnly(2026,4,1),  ToDate = new DateOnly(2026,4,2),  Note = "" },
            new Leave { Id = Guid.Parse("11111111-0000-0000-0000-000000000005"), Emp = "Sivaraman Ponnusamy",  Type = "planned", FromDate = new DateOnly(2026,4,1),  ToDate = new DateOnly(2026,4,3),  Note = "Conference" },
            new Leave { Id = Guid.Parse("11111111-0000-0000-0000-000000000006"), Emp = "Unnati Rathod",        Type = "planned", FromDate = new DateOnly(2026,4,2),  ToDate = new DateOnly(2026,4,8),  Note = "" },
            new Leave { Id = Guid.Parse("11111111-0000-0000-0000-000000000007"), Emp = "Vignesh Moorthy V.",   Type = "wfh",     FromDate = new DateOnly(2026,4,20), ToDate = new DateOnly(2026,4,24), Note = "Remote week" },
            new Leave { Id = Guid.Parse("11111111-0000-0000-0000-000000000008"), Emp = "Sumit Marsattiwar",    Type = "planned", FromDate = new DateOnly(2026,5,25), ToDate = new DateOnly(2026,5,29), Note = "" },
            new Leave { Id = Guid.Parse("11111111-0000-0000-0000-000000000009"), Emp = "Felvin Varghese",      Type = "wfh",     FromDate = new DateOnly(2026,5,4),  ToDate = new DateOnly(2026,5,6),  Note = "WFH week" },
            new Leave { Id = Guid.Parse("11111111-0000-0000-0000-000000000010"), Emp = "Karuna Patil",         Type = "sick",    FromDate = new DateOnly(2026,4,14), ToDate = new DateOnly(2026,4,15), Note = "" },
            new Leave { Id = Guid.Parse("11111111-0000-0000-0000-000000000011"), Emp = "Rahul Burgute",        Type = "holiday", FromDate = new DateOnly(2026,4,10), ToDate = new DateOnly(2026,4,10), Note = "Ram Navami" }
        );
    }
}
