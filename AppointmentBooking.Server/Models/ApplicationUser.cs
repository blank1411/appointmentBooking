namespace AppointmentBooking.Server.Models;
using Microsoft.AspNetCore.Identity;

public class ApplicationUser : IdentityUser
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string City { get; set; } = string.Empty;
    public ICollection<Appointment> Appointments { get; set; } = [];
    public ICollection<ServiceProvider> ServiceProviders { get; set; } = [];
}
