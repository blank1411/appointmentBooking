using AppointmentBooking.Server.DTOs.UpdateDTOs;
using FluentValidation;

namespace AppointmentBooking.Server.Validators;

public class UpdateServiceProviderValidator : AbstractValidator<UpdateServiceProviderDto>
{
    public UpdateServiceProviderValidator()
    {
        RuleFor(x => x.Name) // Replace 'SomeProperty' with the actual property name
            .Must(x => x == null || x.Length > 0)
            .WithMessage(
                "The property can be null, but if provided, it must have a length greater than 0."
            );
        RuleFor(x => x.Description) // Replace 'SomeProperty' with the actual property name
            .Must(x => x == null || x.Length > 0)
            .WithMessage(
                "The property can be null, but if provided, it must have a length greater than 0."
            );
        RuleFor(x => x.PhoneNumber) // Replace 'SomeProperty' with the actual property name
            .Must(x => x == null || x.Length > 0)
            .WithMessage(
                "The property can be null, but if provided, it must have a length greater than 0."
            );
    }
}
