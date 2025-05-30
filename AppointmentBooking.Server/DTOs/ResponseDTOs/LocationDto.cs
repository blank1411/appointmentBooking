namespace AppointmentBooking.Server.DTOs.ResponseDTOs;

public record LocationDto 
(
    int Id,
    string Address,
    string City,
    string ZipCode
);
