using AppointmentBooking.Server.DTOs.ResponseDTOs;

namespace AppointmentBooking.Server.DTOs.CreateDTOs;

public record CreateServiceProviderDto(
    string Name,
    string Description,
    string PhoneNumber,
    CreateLocationDto Location,
    List<BusinessHoursDto> BusinessHours
);
