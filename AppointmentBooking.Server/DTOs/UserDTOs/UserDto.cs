namespace AppointmentBooking.Server.DTOs.UserDTOs;

public record UserDto (
    string Id,
    string Email,
    string FirstName,
    string LastName,
    string Username,
    string City
);
