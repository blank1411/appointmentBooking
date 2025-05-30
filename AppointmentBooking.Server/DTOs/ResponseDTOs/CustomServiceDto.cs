using Microsoft.Identity.Client;

namespace AppointmentBooking.Server.DTOs.ResponseDTOs;

public record CustomServiceDto
(
    int Id,
    string Name,
    string? Description,
    int DurationMinutes,
    decimal Price,
    bool IsAvailable
);
