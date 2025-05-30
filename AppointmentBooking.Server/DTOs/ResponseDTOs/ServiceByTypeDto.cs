namespace AppointmentBooking.Server.DTOs.ResponseDTOs;

public record ServiceByTypeDto
(
    int serviceId,
    int serviceProviderId,
    string Name,
    string? Description,
    int DurationMinutes,
    decimal Price,
    bool IsAvailable
);