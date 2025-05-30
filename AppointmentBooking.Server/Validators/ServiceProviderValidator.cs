using AppointmentBooking.Server.DTOs.CreateDTOs;
using FluentValidation;

namespace AppointmentBooking.Server.Validators;

public class ServiceProviderValidator : AbstractValidator<CreateServiceProviderDto>
{
    public ServiceProviderValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MaximumLength(100)
            .WithMessage("Name cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Description is required.")
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .WithMessage("Phone number is required.")
            .Matches(@"^\+?[0-9]\d{1,14}$")
            .WithMessage("Invalid phone number format.");

        RuleFor(x => x.Location).NotNull().WithMessage("Location is required.");
    }
}
