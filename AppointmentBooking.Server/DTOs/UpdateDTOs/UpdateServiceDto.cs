namespace AppointmentBooking.Server.DTOs.UpdateDTOs;

public record UpdateServiceDto(
    string? Name,
    string? Description,
    decimal? Price,
    int? DurationMinutes
);
