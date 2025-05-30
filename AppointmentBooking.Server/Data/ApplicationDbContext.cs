using AppointmentBooking.Server.Helper_functions;
using AppointmentBooking.Server.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AppointmentBooking.Server.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Service> Services { get; set; }
    public DbSet<Models.ServiceProvider> ServiceProviders { get; set; }
    public DbSet<Location> Locations { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<ServiceProviderService> ServiceProviderServices { get; set; }
    public DbSet<BusinessHours> BusinessHours { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder
            .Entity<ServiceProviderService>()
            .HasKey(sps => new { sps.ServiceProviderId, sps.ServiceId });

        modelBuilder
            .Entity<ServiceProviderService>()
            .HasOne(sps => sps.ServiceProvider)
            .WithMany(sp => sp.Services)
            .HasForeignKey(sps => sps.ServiceProviderId);

        modelBuilder
            .Entity<ServiceProviderService>()
            .HasOne(sps => sps.Service)
            .WithMany(s => s.ServiceProviders)
            .HasForeignKey(sps => sps.ServiceId);

        modelBuilder
            .Entity<ServiceProviderService>()
            .Property(sps => sps.Price)
            .HasColumnType("decimal(18,2)");

        modelBuilder
            .Entity<Appointment>()
            .HasOne(a => a.ServiceProvider)
            .WithMany(sp => sp.Appointments)
            .HasForeignKey(a => a.ServiceProviderId)
            .OnDelete(DeleteBehavior.NoAction); 

        modelBuilder
            .Entity<Appointment>()
            .HasOne(a => a.Service)
            .WithMany(s => s.Appointments)
            .HasForeignKey(a => a.ServiceId)
            .OnDelete(DeleteBehavior.NoAction); 

        modelBuilder
            .Entity<Appointment>()
            .HasOne(a => a.User)
            .WithMany(u => u.Appointments)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder
            .Entity<Models.ServiceProvider>()
            .HasOne(sp => sp.Owner)
            .WithMany(u => u.ServiceProviders)
            .HasForeignKey(sp => sp.OwnerId)
            .OnDelete(DeleteBehavior.NoAction); 

        modelBuilder
            .Entity<BusinessHours>()
            .HasOne(bh => bh.ServiceProvider)
            .WithMany(sp => sp.BusinessHours)
            .HasForeignKey(bh => bh.ServiceProviderId)
            .OnDelete(DeleteBehavior.NoAction); // Prevent cascade delete for BusinessHours
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<Service>())
        {
            if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
            {
                entry.Entity.NormalizedName = entry.Entity.Name.RemoveDiacritics();
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
