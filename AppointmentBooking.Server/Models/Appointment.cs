namespace AppointmentBooking.Server.Models;

public class Appointment
{
    public int Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public AppointmentStatus Status { get; set; }
    public string? Notes { get; set; }
    public required int ServiceProviderId { get; set; }
    public required ServiceProvider ServiceProvider { get; set; }
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public required int ServiceId { get; set; }
    public required Service Service { get; set; }
}
