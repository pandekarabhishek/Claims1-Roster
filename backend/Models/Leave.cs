using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeamPulse.API.Models;

[Table("Leaves")]
public class Leave
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(150)]
    public string Emp { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Type { get; set; } = string.Empty;   // planned | sick | wfh | holiday | personal

    [Required]
    [Column(TypeName = "date")]
    public DateOnly FromDate { get; set; }

    [Required]
    [Column(TypeName = "date")]
    public DateOnly ToDate { get; set; }

    [MaxLength(500)]
    public string Note { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(150)]
    public string CreatedBy { get; set; } = string.Empty;

    // Computed — not stored in DB
    [NotMapped]
    public int DayCount =>
        (ToDate.DayNumber - FromDate.DayNumber) + 1;
}
