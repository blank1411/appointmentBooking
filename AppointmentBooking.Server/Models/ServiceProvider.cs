namespace AppointmentBooking.Server.Models;

public class ServiceProvider
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? PhoneNumber { get; set; }
    public required int LocationId { get; set; }
    public required Location Location { get; set; }
    public required string OwnerId { get; set; }
    public required ApplicationUser Owner { get; set; }
    public ICollection<ServiceProviderService> Services { get; set; } = [];
    public ICollection<Appointment> Appointments { get; set; } = [];
    public ICollection<BusinessHours> BusinessHours { get; set; } = [];
}
