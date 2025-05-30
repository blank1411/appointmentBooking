namespace AppointmentBooking.Server.Models;

public class ServiceProviderService
{
    public int ServiceProviderId { get; set; }
    public int ServiceId { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public bool IsAvailable { get; set; } = true;
    public required ServiceProvider ServiceProvider { get; set; }
    public required Service Service { get; set; }
}
