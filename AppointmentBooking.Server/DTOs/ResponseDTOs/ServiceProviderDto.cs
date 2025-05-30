namespace AppointmentBooking.Server.DTOs.ResponseDTOs;

public record ServiceProviderDto(
    int Id,
    string Name,
    string? Description,
    string? PhoneNumber,
    int LocationId,
    LocationDto Location,
    List<CustomServiceDto> Services,
    List<BusinessHoursDto> BusinessHours
);

