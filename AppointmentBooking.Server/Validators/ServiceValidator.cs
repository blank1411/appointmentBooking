using AppointmentBooking.Server.DTOs.CreateDTOs;
using FluentValidation;

namespace AppointmentBooking.Server.Validators;

public class ServiceValidator : AbstractValidator<CreateServiceDto>
{
    public ServiceValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Service name is required.")
            .MaximumLength(100)
            .WithMessage("Service name must not exceed 100 characters.");
        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Service description is required.")
            .MaximumLength(500)
            .WithMessage("Service description must not exceed 500 characters.");
        RuleFor(x => x.DurationMinutes)
            .GreaterThan(0)
            .WithMessage("Service duration must be greater than 0 minutes.");
        RuleFor(x => x.Price).GreaterThan(0).WithMessage("Service price must be greater than 0.");
    }
}
