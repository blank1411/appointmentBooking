namespace AppointmentBooking.Server.DTOs.ResponseDTOs;

public record AppointmentDto
(
    int Id,
    DateTime StartTime,
    DateTime EndTime,
    string UserId,
    int ServiceProviderId,
    int ServiceId,
    string Status,
    string? Notes,
    string ServiceName,
    string ServiceProviderName
);
