using AppointmentBooking.Server.DTOs.CreateDTOs;
using FluentValidation;

namespace AppointmentBooking.Server.Validators;

public class LocationValidator : AbstractValidator<CreateLocationDto>
{
    public LocationValidator()
    {
        RuleFor(x => x.Address)
            .NotEmpty()
            .WithMessage("Address is required.")
            .MaximumLength(200)
            .WithMessage("Address cannot exceed 200 characters.");

        RuleFor(x => x.City)
            .NotEmpty()
            .WithMessage("City is required.")
            .MaximumLength(100)
            .WithMessage("City cannot exceed 100 characters.");

        RuleFor(x => x.ZipCode)
            .NotEmpty()
            .WithMessage("ZipCode is required.")
            .Matches(@"^\d{4,10}(-\d{3,5})?$")
            .WithMessage("Invalid ZipCode format.");
    }
}
