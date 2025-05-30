namespace AppointmentBooking.Server.DTOs.CreateDTOs;

public record CreateServiceDto
(
    string Name,
    string Description,
    decimal Price,
    int DurationMinutes
);
