namespace AppointmentBooking.Server.DTOs.ResponseDTOs;


public record ServiceDto
(
    int Id,
    string Name,
    string? Description,
    int DurationMinutes,
    decimal Price
);
