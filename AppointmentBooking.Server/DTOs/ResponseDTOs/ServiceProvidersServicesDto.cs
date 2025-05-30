namespace AppointmentBooking.Server.DTOs.ResponseDTOs;

public record ServiceProvidersServicesDto(
    int Id,
    string serviceProviderOwnerId,
    string Name,
    string? Description,
    int DurationMinutes,
    decimal Price,
    bool IsAvailable
    );
