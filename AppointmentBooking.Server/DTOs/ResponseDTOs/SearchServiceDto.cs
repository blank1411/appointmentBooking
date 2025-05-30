namespace AppointmentBooking.Server.DTOs.ResponseDTOs;

public record SearchServiceDto(
    int Id,
    string Name,
    int DurationMinutes,
    decimal Price,
    bool IsAvailable,
    string ServiceProviderName,
    int ServiceProviderId
);
