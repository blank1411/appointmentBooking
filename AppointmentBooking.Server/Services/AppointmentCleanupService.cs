using AppointmentBooking.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace AppointmentBooking.Server.Services;

public class AppointmentCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AppointmentCleanupService> _logger;
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromMinutes(30);

    public AppointmentCleanupService(
        IServiceScopeFactory scopeFactory,
        ILogger<AppointmentCleanupService> logger
    )
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Appointment Cleanup Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var now = DateTime.UtcNow;

                var expiredAppointments = await context
                    .Appointments.Where(a => a.EndTime < now)
                    .ToListAsync(stoppingToken);

                if (expiredAppointments.Any())
                {
                    context.Appointments.RemoveRange(expiredAppointments);
                    await context.SaveChangesAsync(stoppingToken);

                    _logger.LogInformation(
                        $"Removed {expiredAppointments.Count} expired appointments."
                    );
                }
                else
                {
                    _logger.LogInformation("No expired appointments to delete.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while cleaning up expired appointments.");
            }
            await Task.Delay(_cleanupInterval, stoppingToken);
        }
        _logger.LogInformation("Appointment Cleanup Service is stopping.");
    }
}
