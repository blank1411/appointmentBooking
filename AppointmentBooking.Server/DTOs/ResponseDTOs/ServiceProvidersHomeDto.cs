namespace AppointmentBooking.Server.DTOs.ResponseDTOs;

public record ServiceProvidersHomeDto(
    int Id,
    string Name,
    string? Description,
    string? PhoneNumber,
    LocationDto Location
);
