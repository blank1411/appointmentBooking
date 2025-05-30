namespace AppointmentBooking.Server.Models;

public class Service
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string NormalizedName { get; set; } = string.Empty;
    public ICollection<ServiceProviderService> ServiceProviders { get; set; } = [];
    public ICollection<Appointment> Appointments { get; set; } = [];
}
