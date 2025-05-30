using AppointmentBooking.Server.Data;
using AppointmentBooking.Server.DTOs.ResponseDTOs;
using AppointmentBooking.Server.Interfaces;
using AppointmentBooking.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace AppointmentBooking.Server.Services;

public class AppointmentService : IAppointmentService
{
    private readonly ApplicationDbContext _context;

    public AppointmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DateTime>> GetAvailableDatesAsync(
        int serviceProviderId,
        int serviceId,
        DateTime startDate,
        int daysToShow
    )
    {
        var availableDates = new List<DateTime>();
        var endDate = startDate.AddDays(daysToShow);

        // Get business hours for this service provider
        var businessHours = await _context
            .BusinessHours.Where(bh => bh.ServiceProviderId == serviceProviderId && bh.IsOpen)
            .ToListAsync();

        if (!businessHours.Any())
        {
            return availableDates;
        }

        for (
            var currentDate = startDate;
            currentDate <= endDate;
            currentDate = currentDate.AddDays(1)
        )
        {
            // Skip past dates
            if (currentDate < DateTime.Now.Date)
            {
                continue;
            }

            var dayOfWeek = currentDate.DayOfWeek;
            var businessHoursForDay = businessHours.FirstOrDefault(bh => bh.DayOfWeek == dayOfWeek);

            if (businessHoursForDay != null)
            {
                // Check if there are any available slots for this day
                var availableTimes = await GetAvailableTimesAsync(
                    serviceProviderId,
                    serviceId,
                    currentDate
                );
                if (availableTimes.Any())
                {
                    availableDates.Add(currentDate);
                }
            }
        }

        return availableDates;
    }

    public async Task<List<AvailableTimeDto>> GetAvailableTimesAsync(
        int serviceProviderId,
        int serviceId,
        DateTime date
    )
    {
        // Get service duration
        var serviceProviderService = await _context.ServiceProviderServices.FirstOrDefaultAsync(
            sps =>
                sps.ServiceProviderId == serviceProviderId
                && sps.ServiceId == serviceId
                && sps.IsAvailable
        );

        if (serviceProviderService == null)
        {
            return new List<AvailableTimeDto>();
        }

        var durationMinutes = serviceProviderService.DurationMinutes;

        // Get business hours for this day
        var dayOfWeek = date.DayOfWeek;
        var businessHours = await _context.BusinessHours.FirstOrDefaultAsync(bh =>
            bh.ServiceProviderId == serviceProviderId && bh.DayOfWeek == dayOfWeek && bh.IsOpen
        );

        if (businessHours == null)
        {
            return new List<AvailableTimeDto>();
        }

        // Get all existing appointments for this day and service provider
        var existingAppointments = await _context
            .Appointments.Where(a =>
                a.ServiceProviderId == serviceProviderId
                && a.ServiceId == serviceId
                && a.StartTime.Date == date.Date
                && a.Status != AppointmentStatus.Cancelled
            )
            .Select(a => new { a.StartTime, a.EndTime })
            .ToListAsync();

        // Generate all possible time slots
        var availableTimes = new List<AvailableTimeDto>();
        var currentTime = date.Date.Add(businessHours.OpenTime.ToTimeSpan());
        var closeTime = date.Date.Add(businessHours.CloseTime.ToTimeSpan());

        while (currentTime.AddMinutes(durationMinutes) <= closeTime)
        {
            var endTime = currentTime.AddMinutes(durationMinutes);

            // Check if the time slot overlaps with any existing appointments
            bool isSlotAvailable = !existingAppointments.Any(appointment =>
                currentTime < appointment.EndTime && endTime > appointment.StartTime
            );

            // Don't show past time slots (only for today)
            bool isPastTime = date.Date == DateTime.Now.Date && currentTime < DateTime.Now;

            if (isSlotAvailable && !isPastTime)
            {
                availableTimes.Add(
                    new AvailableTimeDto(
                        currentTime,
                        endTime,
                        $"{currentTime:h:mm tt} - {endTime:h:mm tt}"
                    )
                );
            }
            currentTime = currentTime.AddMinutes(durationMinutes);
        }

        return availableTimes;
    }

    public async Task<bool> IsTimeAvailableAsync(
        int serviceProviderId,
        int serviceId,
        DateTime startTime,
        DateTime endTime
    )
    {
        // Check if the service provider service exists and is available
        var serviceProviderService = await _context.ServiceProviderServices.FirstOrDefaultAsync(
            sps =>
                sps.ServiceProviderId == serviceProviderId
                && sps.ServiceId == serviceId
                && sps.IsAvailable
        );
        if (serviceProviderService == null)
        {
            return false; // Service not available
        }

        // Check business hours
        var dayOfWeek = startTime.DayOfWeek;
        var businessHours = await _context.BusinessHours.FirstOrDefaultAsync(bh =>
            bh.ServiceProviderId == serviceProviderId && bh.DayOfWeek == dayOfWeek && bh.IsOpen
        );

        if (businessHours == null)
        {
            return false; // No business hours for this day
        }

        // Check if the requested time is within business hours
        var businessStart = startTime.Date.Add(businessHours.OpenTime.ToTimeSpan());
        var businessEnd = startTime.Date.Add(businessHours.CloseTime.ToTimeSpan());

        if (startTime < businessStart || endTime > businessEnd)
        {
            return false; // Requested time is outside business hours
        }

        // Check if slot conflicts with existing appointments
        var hasConflict = await _context.Appointments.AnyAsync(a =>
            a.ServiceProviderId == serviceProviderId
            && a.Status != AppointmentStatus.Cancelled
            && startTime < a.EndTime
            && endTime > a.StartTime
        );

        return !hasConflict; // Return true if no conflicts found
    }

    // Potentially only used on client side for evaluation
    private bool DoesTimeSlotOverlap(
        DateTime newStart,
        DateTime newEnd,
        DateTime existingStart,
        DateTime existingEnd
    )
    {
        /* Two time slots overlap if:
           New slot starts before existing ends AND
           New slot ends after existing starts */
        return newStart < existingEnd && newEnd > existingStart;
    }
}

