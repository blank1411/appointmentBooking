using AppointmentBooking.Server.Models;

namespace AppointmentBooking.Server.DTOs.UpdateDTOs;

public record UpdateAppointmentStatusDto(int appointmentId, AppointmentStatus Status);
