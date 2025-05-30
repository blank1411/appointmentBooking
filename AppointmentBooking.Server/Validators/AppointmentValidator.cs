using AppointmentBooking.Server.DTOs.CreateDTOs;
using FluentValidation;

namespace AppointmentBooking.Server.Validators;

public class AppointmentValidator : AbstractValidator<CreateAppointmentDto>
{
    public AppointmentValidator()
    {
        RuleFor(x => x.StartTime)
            .NotEmpty()
            .WithMessage("Start time is required.")
            .Must(BeAValidDate)
            .WithMessage("Start time must be a valid date.");
        RuleFor(x => x.ServiceProviderId)
            .NotEmpty()
            .WithMessage("Service provider is required.")
            .GreaterThan(0)
            .WithMessage("Must be a valid service provider.");
        RuleFor(x => x.ServiceId)
            .NotEmpty()
            .WithMessage("Service is required.")
            .GreaterThan(0)
            .WithMessage("Must be a valid service.");
    }

    private bool BeAValidDate(DateTime date)
    {
        return date > DateTime.Now;
    }
}
