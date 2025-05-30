namespace AppointmentBooking.Server.DTOs.ResponseDTOs;

public record ServiceProviderByUserDto(
    int Id,
    string Name,
    string? Description,
    string? PhoneNumber,
    int LocationId,
    LocationDto Location
);

