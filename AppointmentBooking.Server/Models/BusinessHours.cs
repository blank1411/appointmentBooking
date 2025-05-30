namespace AppointmentBooking.Server.Models;

public class BusinessHours
{
    public int Id { get; set; }
    public int ServiceProviderId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeOnly OpenTime { get; set; }
    public TimeOnly CloseTime { get; set; }
    public bool IsOpen { get; set; } = true;
    public required ServiceProvider ServiceProvider { get; set; } = null!;
}
