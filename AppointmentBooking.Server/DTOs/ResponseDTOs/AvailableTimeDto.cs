namespace AppointmentBooking.Server.DTOs.ResponseDTOs;

public record AvailableTimeDto(DateTime StartTime, DateTime EndTime, string DisplayTime);
