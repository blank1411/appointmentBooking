namespace AppointmentBooking.Server.Models;

public class Location
{
    public int Id { get; set; }
    public required string Address { get; set; }
    public required string City { get; set; }
    public required string ZipCode { get; set; }
    public ICollection<ServiceProvider> ServiceProviders { get; set; } = [];
}
