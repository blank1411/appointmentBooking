namespace AppointmentBooking.Server.DTOs.UserDTOs;

public record UserRegistrationDto
(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string City
);
