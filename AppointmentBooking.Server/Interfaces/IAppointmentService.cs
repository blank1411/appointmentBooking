using AppointmentBooking.Server.DTOs.ResponseDTOs;

namespace AppointmentBooking.Server.Interfaces;

public interface IAppointmentService
{
    Task<List<DateTime>> GetAvailableDatesAsync(int serviceProviderId, int serviceId, DateTime startDate, int daysToShow);
    Task<List<AvailableTimeDto>> GetAvailableTimesAsync(int serviceProviderId, int serviceId, DateTime date);
    Task<bool> IsTimeAvailableAsync(int serviceProviderId, int serviceId, DateTime startTime, DateTime endTime);
}
