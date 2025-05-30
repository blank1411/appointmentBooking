namespace AppointmentBooking.Server.DTOs.ResponseDTOs;

public record BusinessHoursDto(
    DayOfWeek DayOfWeek,
    TimeOnly OpenTime,
    TimeOnly CloseTime,
    bool IsOpen = true
);
