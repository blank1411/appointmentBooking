namespace AppointmentBooking.Server.DTOs.CreateDTOs;

public record CreateAppointmentDto
(
    DateTime StartTime,
    int ServiceProviderId,
    int ServiceId,
    string Notes
);
