namespace AppointmentBooking.Server.DTOs.UpdateDTOs;

public class UpdateLocationDto
{
    public required int LocationId { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? ZipCode { get; set; }
}
