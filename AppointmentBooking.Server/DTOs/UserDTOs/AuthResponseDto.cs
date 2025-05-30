namespace AppointmentBooking.Server.DTOs.UserDTOs;

public record AuthResponseDto
(
    string Token,
    DateTime Expiration,
    UserDto User
);
