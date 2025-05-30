using AppointmentBooking.Server.DTOs.UpdateDTOs;
using FluentValidation;

namespace AppointmentBooking.Server.Validators;

public class UpdateLocationValidator : AbstractValidator<UpdateLocationDto>
{
    public UpdateLocationValidator()
    {
        RuleFor(x => x.Address)
            .Must(x => x == null || x.Length > 3)
            .WithMessage("Enter a valid adress.")
            .MaximumLength(100)
            .WithMessage("Address cannot exceed 100 characters.");
        RuleFor(x => x.City)
            .Must(x => x == null || x.Length > 1)
            .WithMessage("Enter a valid city.")
            .MaximumLength(40)
            .WithMessage("City cannot exceed 40 characters.")
            .Matches(@"^[a-zA-Z\s]+$")
            .WithMessage("City can only contain letters and spaces.");
        RuleFor(x => x.ZipCode)
            .Must(x => x == null || x.Length > 0)
            .WithMessage("Enter a valid zip code.")
            .Matches(@"^\d{4,10}(-\d{3,5})?$")
            .WithMessage("Invalid zip code format.");
    }
}
