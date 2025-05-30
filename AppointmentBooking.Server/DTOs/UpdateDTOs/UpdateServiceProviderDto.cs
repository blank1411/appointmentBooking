using AppointmentBooking.Server.DTOs.ResponseDTOs;

namespace AppointmentBooking.Server.DTOs.UpdateDTOs;

public record UpdateServiceProviderDto(string? Name, string? Description, string? PhoneNumber);
