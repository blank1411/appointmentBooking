namespace AppointmentBooking.Server.DTOs.UpdateDTOs;

public record UpdateUserDto(
    string Id,
    string Email,
    string FirstName,
    string LastName,
    string Username,
    string City
);
