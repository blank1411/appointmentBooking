using System.Security.Claims;
using System.Text;
using AppointmentBooking.Server.Data;
using AppointmentBooking.Server.DTOs.CreateDTOs;
using AppointmentBooking.Server.DTOs.ResponseDTOs;
using AppointmentBooking.Server.DTOs.UpdateDTOs;
using AppointmentBooking.Server.DTOs.UserDTOs;
using AppointmentBooking.Server.Helper_functions;
using AppointmentBooking.Server.Interfaces;
using AppointmentBooking.Server.Models;
using AppointmentBooking.Server.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MyServiceProvider = AppointmentBooking.Server.Models.ServiceProvider;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter 'Bearer' followed by your JWT token.",
        }
    );

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    },
                },
                Array.Empty<string>()
            },
        }
    );
});
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AppointmentBookingDatabase"))
);

// Add authorization
builder.Services.AddAuthorization();

// Add JWT services
builder.Services.AddScoped<JwtService>();

// Add Appointment service
builder.Services.AddScoped<IAppointmentService, AppointmentService>();

// Add identity
builder
    .Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Configure identity options
builder.Services.Configure<IdentityOptions>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
});

// Configure JWT bearer authentication
builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.ASCII.GetBytes(
                    builder.Configuration["JwtSettings:Key"]
                        ?? throw new InvalidOperationException("JWT Key is not configured")
                )
            ),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero, // Reduce clock skew for stricter validation
        };
    });

// Add Appointment cleanup service
builder.Services.AddHostedService<AppointmentCleanupService>();

// Add Fluent validation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
    );
});

var app = builder.Build();
app.UseCors("AllowAll");

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();

// Enable authentication and authorization
app.UseAuthentication();
app.UseAuthorization();

// Auth Endpoints
app.MapPost(
        "/api/auth/register",
        async (
            UserManager<ApplicationUser> userManager,
            JwtService jwtService,
            UserRegistrationDto model,
            IValidator<UserRegistrationDto> validator
        ) =>
        {
            // Manually trigger FluentValidation
            var validationResult = await validator.ValidateAsync(model);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return Results.BadRequest(errors);
            }

            var existingUser = await userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                return Results.BadRequest("User already exists.");
            }

            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                City = model.City
            };

            var result = await userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                return Results.BadRequest(result.Errors);
            }

            var token = jwtService.GenerateToken(user);
            return Results.Ok(
                new AuthResponseDto(
                    Token: token,
                    Expiration: DateTime.UtcNow.AddDays(7),
                    User: new UserDto(
                        Id: user.Id,
                        Email: user.Email,
                        FirstName: user.FirstName,
                        LastName: user.LastName,
                        Username: user.UserName,
                        City: user.City
                    )
                )
            );
        }
    )
    .WithName("RegisterUser")
    .Produces<AuthResponseDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapPost(
        "/api/auth/login",
        async (
            UserManager<ApplicationUser> userManager,
            JwtService jwtService,
            UserLoginDto model
        ) =>
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Results.BadRequest("User not found.");
            }
            if (!await userManager.CheckPasswordAsync(user, model.Password))
            {
                return Results.BadRequest("Invalid password.");
            }

            // Null check for required fields
            if (user.Email == null || user.UserName == null)
            {
                return Results.Problem(
                    "User account is missing required information",
                    statusCode: 500
                );
            }
            var token = jwtService.GenerateToken(user);
            return Results.Ok(
                new AuthResponseDto(
                    Token: token,
                    Expiration: DateTime.UtcNow.AddDays(7),
                    User: new UserDto(
                        Id: user.Id,
                        Email: user.Email,
                        FirstName: user.FirstName,
                        LastName: user.LastName,
                        Username: user.UserName,
                        City: user.City
                    )
                )
            );
        }
    )
    .WithName("LoginUser")
    .Produces<AuthResponseDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapPut(
        "/api/auth/update-profile",
        async (UserManager<ApplicationUser> userManager, HttpContext http, UpdateUserDto model) =>
        {
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Results.Unauthorized();
            }
            var user = await userManager.FindByIdAsync(userIdClaim.Value);
            if (user == null)
            {
                return Results.NotFound("User not found.");
            }
            // Update user properties
            if (!string.IsNullOrWhiteSpace(model.FirstName))
            {
                user.FirstName = model.FirstName.Trim();
            }
            if (!string.IsNullOrWhiteSpace(model.LastName))
            {
                user.LastName = model.LastName.Trim();
            }
            if (!string.IsNullOrWhiteSpace(model.City))
            {
                user.City = model.City.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.Email) && model.Email != user.Email)
            {
                var emailExists = await userManager.FindByEmailAsync(model.Email);
                if (emailExists != null)
                {
                    return Results.BadRequest("Email already in use.");
                }
                user.Email = model.Email.Trim();
                user.UserName = model.Email.Trim(); // Update username to match email
            }

            if (!string.IsNullOrWhiteSpace(model.Username) && model.Username != user.UserName)
            {
                var usernameExists = await userManager.FindByNameAsync(model.Username);
                if (usernameExists != null)
                {
                    return Results.BadRequest("Username already in use.");
                }
                user.UserName = model.Username.Trim();
            }

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return Results.BadRequest(result.Errors);
            }
            return Results.Ok(
                new UserDto(
                    Id: user.Id,
                    Email: user.Email!,
                    FirstName: user.FirstName,
                    LastName: user.LastName,
                    Username: user.UserName!,
                    City: user.City
                )
            );
        }
    )
    .WithName("UpdateUserProfile")
    .Accepts<UpdateUserDto>("application/json")
    .RequireAuthorization()
    .Produces<UserDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapPut(
        "/api/changepassword",
        async (UserManager<ApplicationUser> userManager, HttpContext http, ChangePasswordDto dto) =>
        {
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Results.Unauthorized();
            }
            var user = await userManager.FindByIdAsync(userIdClaim.Value);
            if (user == null)
            {
                return Results.NotFound("User not found.");
            }
            var result = await userManager.ChangePasswordAsync(
                user,
                dto.CurrentPassword,
                dto.NewPassword
            );
            if (!result.Succeeded)
            {
                return Results.BadRequest(result.Errors);
            }
            return Results.Ok("Password changed successfully.");
        }
    )
    .WithName("ChangeUserPassword")
    .Accepts<ChangePasswordDto>("application/json")
    .RequireAuthorization()
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

// Service Provider Endpoints
app.MapPost(
        "/api/serviceproviders",
        async (
            ApplicationDbContext context,
            CreateServiceProviderDto createServiceProvider,
            HttpContext http,
            UserManager<ApplicationUser> userManager
        ) =>
        {
            // Get the user ID from the JWT token
            var ownerIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier);
            if (ownerIdClaim == null)
            {
                return Results.Unauthorized();
            }
            var ownerId = ownerIdClaim.Value;
            var owner = await userManager.FindByIdAsync(ownerId);
            if (owner == null)
            {
                return Results.NotFound("Owner not found.");
            }

            // Validate business hours
            if (
                createServiceProvider.BusinessHours == null
                || !createServiceProvider.BusinessHours.Any()
            )
            {
                return Results.BadRequest("Business hours are required.");
            }

            // Validate that business hours don't have invalid time ranges
            foreach (var hours in createServiceProvider.BusinessHours.Where(bh => bh.IsOpen))
            {
                if (hours.OpenTime >= hours.CloseTime)
                {
                    return Results.BadRequest(
                        $"Invalid business hours for {hours.DayOfWeek}: Open time must be before close time."
                    );
                }
            }

            // Check if location already exists
            var location = await context.Locations.FirstOrDefaultAsync(l =>
                l.Address == createServiceProvider.Location.Address
                && l.City == createServiceProvider.Location.City
                && l.ZipCode == createServiceProvider.Location.ZipCode
            );

            // If location doesn't exist, create a new one
            if (location == null)
            {
                location = new Location
                {
                    Address = createServiceProvider.Location.Address,
                    City = createServiceProvider.Location.City,
                    ZipCode = createServiceProvider.Location.ZipCode,
                };
                context.Locations.Add(location);
                await context.SaveChangesAsync();
            }

            // Check if a service provider with the same name already exists
            var existingServiceProvider = await context.ServiceProviders.FirstOrDefaultAsync(sp =>
                sp.Name == createServiceProvider.Name
            );
            if (existingServiceProvider != null)
            {
                return Results.Conflict("Service provider with this name already exists.");
            }

            // Create the new service provider
            var serviceProvider = new MyServiceProvider // Note: You might need to change this to just ServiceProvider
            {
                Name = createServiceProvider.Name,
                Description = createServiceProvider.Description,
                LocationId = location.Id,
                Location = location,
                OwnerId = ownerId,
                PhoneNumber = createServiceProvider.PhoneNumber,
                Services = new List<ServiceProviderService>(),
                Owner = owner,
                Appointments = new List<Appointment>(),
                BusinessHours = new List<BusinessHours>(),
            };

            context.ServiceProviders.Add(serviceProvider);
            await context.SaveChangesAsync();

            // Create business hours for the service provider
            foreach (var hoursDto in createServiceProvider.BusinessHours)
            {
                var businessHours = new BusinessHours
                {
                    ServiceProviderId = serviceProvider.Id,
                    DayOfWeek = hoursDto.DayOfWeek,
                    OpenTime = hoursDto.OpenTime,
                    CloseTime = hoursDto.CloseTime,
                    IsOpen = hoursDto.IsOpen,
                    ServiceProvider = serviceProvider,
                };

                context.BusinessHours.Add(businessHours);
            }

            await context.SaveChangesAsync();

            return Results.Created(
                $"/api/serviceproviders/{serviceProvider.Id}",
                new ServiceProviderDto(
                    Id: serviceProvider.Id,
                    Name: serviceProvider.Name,
                    Description: serviceProvider.Description,
                    PhoneNumber: serviceProvider.PhoneNumber,
                    LocationId: serviceProvider.LocationId,
                    Location: new LocationDto(
                        Id: location.Id,
                        Address: location.Address,
                        City: location.City,
                        ZipCode: location.ZipCode
                    ),
                    Services: new List<CustomServiceDto>(),
                    BusinessHours: createServiceProvider.BusinessHours
                )
            );
        }
    )
    .WithName("CreateServiceProvider")
    .RequireAuthorization()
    .Produces<ServiceProviderDto>(StatusCodes.Status201Created)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status409Conflict)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapGet(
        "/api/serivceproviders",
        async (ApplicationDbContext context) =>
        {
            var allServiceProviders = await context
                .ServiceProviders.Include(sp => sp.Location)
                .Include(sp => sp.Services)
                .ThenInclude(sps => sps.Service)
                .Select(sp => new ServiceProvidersHomeDto(
                    sp.Id,
                    sp.Name,
                    sp.Description,
                    sp.PhoneNumber,
                    new LocationDto(
                        sp.Location.Id,
                        sp.Location.Address,
                        sp.Location.City,
                        sp.Location.ZipCode
                    )
                ))
                .ToListAsync();

            if (allServiceProviders == null || allServiceProviders.Count == 0)
            {
                return Results.NotFound("No service providers found.");
            }

            return Results.Ok(allServiceProviders);
        }
    )
    .WithName("GetAllServiceProviders")
    .Produces<ServiceProviderDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapGet(
        "/api/serviceproviders/{id}",
        async (ApplicationDbContext context, int id) =>
        {
            var serviceProvider = await context
                .ServiceProviders.Include(sp => sp.Location)
                .Include(sp => sp.Services)
                .ThenInclude(sps => sps.Service)
                .FirstOrDefaultAsync(sp => sp.Id == id);

            if (serviceProvider == null)
            {
                return Results.NotFound("Service provider not found.");
            }

            var customServices = serviceProvider
                .Services.Select(sps => new CustomServiceDto(
                    Id: sps.Service.Id,
                    Name: sps.Service.Name,
                    Description: sps.Description,
                    DurationMinutes: sps.DurationMinutes,
                    Price: sps.Price,
                    IsAvailable: sps.IsAvailable
                ))
                .ToList();

            return Results.Ok(
                new ServiceProviderDto(
                    Id: serviceProvider.Id,
                    Name: serviceProvider.Name,
                    Description: serviceProvider.Description,
                    PhoneNumber: serviceProvider.PhoneNumber,
                    LocationId: serviceProvider.LocationId,
                    Location: new LocationDto(
                        Id: serviceProvider.Location.Id,
                        Address: serviceProvider.Location.Address,
                        City: serviceProvider.Location.City,
                        ZipCode: serviceProvider.Location.ZipCode
                    ),
                    Services: customServices,
                    BusinessHours: serviceProvider
                        .BusinessHours.Select(bh => new BusinessHoursDto(
                            bh.DayOfWeek,
                            bh.OpenTime,
                            bh.CloseTime,
                            bh.IsOpen
                        ))
                        .ToList()
                )
            );
        }
    )
    .WithName("GetServiceProviderById")
    .Produces<ServiceProviderDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapGet(
        "/api/serviceproviders/user",
        async (ApplicationDbContext context, HttpContext http) =>
        {
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Results.Unauthorized();
            }
            var userId = userIdClaim.Value;
            var serviceProviders = await context
                .ServiceProviders.Include(sp => sp.Location)
                .Where(sp => sp.OwnerId == userId)
                .Select(sp => new ServiceProviderByUserDto(
                    sp.Id,
                    sp.Name,
                    sp.Description,
                    sp.PhoneNumber,
                    sp.LocationId,
                    new LocationDto(
                        sp.Location.Id,
                        sp.Location.Address,
                        sp.Location.City,
                        sp.Location.ZipCode
                    )
                ))
                .ToListAsync();
            if (serviceProviders == null || serviceProviders.Count == 0)
            {
                return Results.NotFound("No service providers found for this user.");
            }
            return Results.Ok(serviceProviders);
        }
    )
    .WithName("GetServiceProvidersByUser")
    .Produces<ServiceProviderDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapGet(
        "/api/serviceproviders/user/city",
        async (ApplicationDbContext context, HttpContext http) =>
        {
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Results.Unauthorized();
            }
            var userId = userIdClaim.Value;
            var user = context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null)
            {
                return Results.NotFound("User not found.");
            }

            // Find all the service providers in the users city
            var serviceProviders = await context
                .ServiceProviders.Where(sp => sp.Location.City.ToLower() == user.City.ToLower())
                .Select(sp => new ServiceProvidersHomeDto(
                    sp.Id,
                    sp.Name,
                    sp.Description,
                    sp.PhoneNumber,
                    new LocationDto(
                        sp.Location.Id,
                        sp.Location.Address,
                        sp.Location.City,
                        sp.Location.ZipCode
                    )
                ))
                .ToListAsync();

            if (serviceProviders == null || serviceProviders.Count == 0)
            {
                return Results.NotFound("No service providers found in this city.");
            }
            return Results.Ok(serviceProviders);
        }
    )
    .WithName("GetServiceProvidersByCity")
    .Produces<ServiceProvidersHomeDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .RequireAuthorization()
    .WithOpenApi();

app.MapDelete(
        "/api/serviceproviders/{id}",
        async (ApplicationDbContext context, int id, HttpContext http) =>
        {
            // Get the user ID from the JWT token
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Results.Unauthorized();
            }

            var userId = userIdClaim.Value;

            // Find the service provider
            var serviceProvider = await context.ServiceProviders.FindAsync(id);
            if (serviceProvider == null)
            {
                return Results.NotFound("Service provider not found.");
            }

            // Check if the current user is the owner of the service provider
            if (serviceProvider.OwnerId != userId)
            {
                return Results.Forbid();
            }

            // Delete the service provider
            context.ServiceProviders.Remove(serviceProvider);
            await context.SaveChangesAsync();
            return Results.NoContent();
        }
    )
    .WithName("DeleteServiceProvider")
    .RequireAuthorization()
    .Produces(StatusCodes.Status204NoContent)
    .Produces(StatusCodes.Status403Forbidden)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapPut(
        "/api/serviceproviders/{id}",
        async (
            ApplicationDbContext context,
            UpdateServiceProviderDto dto,
            HttpContext http,
            int id
        ) =>
        {
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Results.Unauthorized();
            }

            var userId = userIdClaim.Value;

            var serviceProvider = await context.ServiceProviders.FindAsync(id);
            if (serviceProvider == null)
            {
                return Results.NotFound("Service provider not found.");
            }

            if (userId != serviceProvider.OwnerId)
            {
                return Results.Forbid();
            }

            bool isUpdated = false;

            if (!string.IsNullOrWhiteSpace(dto.Name) && dto.Name != serviceProvider.Name)
            {
                serviceProvider.Name = dto.Name.Trim();
                isUpdated = true;
            }

            if (
                !string.IsNullOrWhiteSpace(dto.Description)
                && dto.Description != serviceProvider.Description
            )
            {
                serviceProvider.Description = dto.Description.Trim();
                isUpdated = true;
            }

            if (
                !string.IsNullOrWhiteSpace(dto.PhoneNumber)
                && dto.PhoneNumber != serviceProvider.PhoneNumber
            )
            {
                serviceProvider.PhoneNumber = dto.PhoneNumber.Trim();
                isUpdated = true;
            }

            if (!isUpdated)
            {
                return Results.BadRequest("No changes detected.");
            }

            await context.SaveChangesAsync();
            return Results.Ok();
        }
    )
    .WithName("UpdateServiceProvider")
    .Accepts<UpdateServiceProviderDto>("application/json")
    .RequireAuthorization()
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapPut(
        "/api/locations",
        async (ApplicationDbContext context, UpdateLocationDto dto) =>
        {
            var location = await context.Locations.FindAsync(dto.LocationId);
            if (location == null)
            {
                return Results.NotFound("Location not found.");
            }
            bool isUpdated = false;

            if (!string.IsNullOrWhiteSpace(dto.Address) && dto.Address != location.Address)
            {
                location.Address = dto.Address.Trim();
                isUpdated = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.City) && dto.City != location.City)
            {
                location.City = dto.City.Trim();
                isUpdated = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.ZipCode) && dto.ZipCode != location.ZipCode)
            {
                location.ZipCode = dto.ZipCode.Trim();
                isUpdated = true;
            }

            if (!isUpdated)
            {
                return Results.BadRequest("No changes detected.");
            }
            await context.SaveChangesAsync();
            return Results.Ok();
        }
    )
    .WithName("UpdateLocation")
    .Accepts<UpdateLocationDto>("application/json")
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

// Service Endpoints
app.MapPost(
        "/api/serviceproviders/{serviceProviderId}/services",
        async (
            ApplicationDbContext context,
            CreateServiceDto dto,
            HttpContext http,
            int serviceProviderId
        ) =>
        {
            // Retrieve the authenticated user's ID from the JWT token.
            var ownerId = http.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (ownerId == null)
            {
                return Results.Unauthorized();
            }

            // Ensure that the ServiceProvider exists and belongs to the current user.
            // Include existing services for later checking.
            var serviceProvider = await context
                .ServiceProviders.Include(sp => sp.Services)
                .FirstOrDefaultAsync(sp => sp.Id == serviceProviderId && sp.OwnerId == ownerId);

            if (serviceProvider == null)
            {
                return Results.NotFound(
                    "Service provider not found or you do not have permission to add services."
                );
            }

            // Check if the service already exists
            var service = await context.Services.FirstOrDefaultAsync(s =>
                s.Name.ToLower() == dto.Name.ToLower()
            );

            if (service == null)
            {
                // Create a new service if it doesn't exist
                service = new Service
                {
                    Name = dto.Name.Trim(),
                    Appointments = new List<Appointment>(),
                };
                context.Services.Add(service);
                await context.SaveChangesAsync();
            }

            var serviceProviderService = new ServiceProviderService
            {
                ServiceProviderId = serviceProvider.Id,
                ServiceId = service.Id,
                Description = dto.Description.Trim(),
                DurationMinutes = dto.DurationMinutes,
                Price = dto.Price,
                IsAvailable = true,
                Service = service,
                ServiceProvider = serviceProvider,
            };

            context.ServiceProviderServices.Add(serviceProviderService);
            await context.SaveChangesAsync();

            var customServiceDto = new CustomServiceDto(
                Id: service.Id,
                Name: service.Name,
                Description: dto.Description,
                DurationMinutes: dto.DurationMinutes,
                Price: dto.Price,
                IsAvailable: true
            );

            return Results.Created(
                $"/api/serviceproviders/{serviceProvider.Id}/services/{service.Id}",
                customServiceDto
            );
        }
    )
    .WithName("CreateService")
    .Accepts<CreateServiceDto>("application/json")
    .Produces(StatusCodes.Status201Created)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

// Update the API to handle composite keys for services properly by ensuring the correct differentiation
app.MapGet(
        "/api/serviceproviders/{serviceProviderId}/services/{serviceId}",
        async (ApplicationDbContext context, int serviceProviderId, int serviceId) =>
        {
            // Fetch the specific service based on the composite key of serviceProviderId and serviceId
            var serviceProviderService = await context
                .ServiceProviderServices.Include(sps => sps.Service)
                .Include(sps => sps.ServiceProvider)
                .FirstOrDefaultAsync(sps =>
                    sps.ServiceProviderId == serviceProviderId && sps.ServiceId == serviceId
                );

            if (serviceProviderService == null)
            {
                return Results.NotFound("Service not found for the specified service provider.");
            }

            var customServiceDto = new CustomServiceDto(
                Id: serviceProviderService.ServiceId,
                Name: serviceProviderService.Service.Name,
                Description: serviceProviderService.Description,
                DurationMinutes: serviceProviderService.DurationMinutes,
                Price: serviceProviderService.Price,
                IsAvailable: serviceProviderService.IsAvailable
            );

            return Results.Ok(customServiceDto);
        }
    )
    .WithName("GetServiceByCompositeKey")
    .Produces<CustomServiceDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapGet(
        "/api/serviceproviders/{serviceProviderId}/services",
        async (ApplicationDbContext context, int serviceProviderId) =>
        {
            // Fetch the service provider including the OwnerId
            var serviceProvider = await context.ServiceProviders.FirstOrDefaultAsync(sp =>
                sp.Id == serviceProviderId
            );

            if (serviceProvider == null)
            {
                return Results.NotFound("Service provider not found.");
            }

            var services = await context
                .ServiceProviderServices.Include(sps => sps.Service)
                .Where(sps => sps.ServiceProviderId == serviceProviderId)
                .Select(s => new ServiceProvidersServicesDto(
                    s.ServiceId,
                    serviceProvider.OwnerId,
                    s.Service.Name,
                    s.Description,
                    s.DurationMinutes,
                    s.Price,
                    s.IsAvailable
                ))
                .ToListAsync();

            // Always return at least the OwnerId, even if no services
            return Results.Ok(
                new { ServiceProviderOwnerId = serviceProvider.OwnerId, Services = services }
            );
        }
    )
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound)
    .WithOpenApi();

app.MapGet(
        "/api/services/search/{query}",
        async (ApplicationDbContext context, string query) =>
        {
            var normalizedQuery = query.RemoveDiacritics();

            var services = await context
                .ServiceProviderServices.Include(sps => sps.Service)
                .Where(sps =>
                    sps.Service.NormalizedName.ToLower().Contains(normalizedQuery.ToLower())
                )
                .Select(s => new SearchServiceDto(
                    s.ServiceId,
                    s.Service.Name,
                    s.DurationMinutes,
                    s.Price,
                    s.IsAvailable,
                    s.ServiceProvider.Name,
                    s.ServiceProviderId
                ))
                .ToListAsync();
            if (services == null || services.Count == 0)
            {
                return Results.NotFound("No services found.");
            }
            return Results.Ok(services);
        }
    )
    .Produces<SearchServiceDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapGet(
        "/api/services/topsearch/{query}",
        async (ApplicationDbContext context, string query) =>
        {
            var normalizedQuery = query.RemoveDiacritics();

            var services = await context
                .ServiceProviderServices.Include(sps => sps.Service)
                .Where(sps =>
                    sps.Service.NormalizedName != null
                    && sps.Service.NormalizedName.ToLower().Contains(normalizedQuery.ToLower())
                    && sps.IsAvailable
                )
                .Take(5) // Limit the result to 5 services
                .Select(s => new SearchServiceDto(
                    s.ServiceId,
                    s.Service.Name,
                    s.DurationMinutes,
                    s.Price,
                    s.IsAvailable,
                    s.ServiceProvider.Name,
                    s.ServiceProviderId
                ))
                .ToListAsync();

            if (services == null || services.Count == 0)
            {
                return Results.NotFound("No services found.");
            }
            return Results.Ok(services);
        }
    )
    .Produces<SearchServiceDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapPut(
        "/api/serviceproviders/{serviceProviderId}/services/{serviceId}",
        async (
            ApplicationDbContext context,
            UpdateServiceDto dto,
            HttpContext http,
            int serviceProviderId,
            int serviceId
        ) =>
        {
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Results.Unauthorized();
            }

            var service = await context
                .ServiceProviderServices.Include(sp => sp.Service)
                .Include(sp => sp.ServiceProvider)
                .FirstOrDefaultAsync(sp =>
                    sp.ServiceId == serviceId && sp.ServiceProviderId == serviceProviderId
                );

            if (service == null)
            {
                return Results.NotFound("Service not found.");
            }

            if (service.ServiceProvider.OwnerId != userIdClaim.Value)
            {
                return Results.Forbid();
            }

            bool isUpdated = false;

            if (!string.IsNullOrWhiteSpace(dto.Name) && dto.Name != service.Service.Name)
            {
                service.Service.Name = dto.Name.Trim();
                isUpdated = true;
            }

            if (dto.Description != service.Description)
            {
                service.Description = dto.Description?.Trim();
                isUpdated = true;
            }

            if (
                dto.DurationMinutes > 0
                && dto.DurationMinutes != service.DurationMinutes
                && dto.DurationMinutes != null
            )
            {
                service.DurationMinutes = (int)dto.DurationMinutes;
                isUpdated = true;
            }

            if (dto.Price >= 0 && dto.Price != service.Price && dto.Price != null) // Allow zero price
            {
                service.Price = (decimal)dto.Price;
                isUpdated = true;
            }

            if (!isUpdated)
            {
                return Results.BadRequest("No changes detected.");
            }

            await context.SaveChangesAsync();

            var updatedService = new CustomServiceDto(
                Id: service.ServiceId,
                Name: service.Service.Name,
                Description: service.Description,
                DurationMinutes: service.DurationMinutes,
                Price: service.Price,
                IsAvailable: service.IsAvailable
            );

            return Results.Ok(updatedService);
        }
    )
    .WithName("UpdateService")
    .RequireAuthorization()
    .Produces<CustomServiceDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status403Forbidden)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapPut(
        "/api/serviceproviders/{serviceProviderId}/services/availability/{serviceId}",
        async (
            ApplicationDbContext context,
            HttpContext http,
            int serviceProviderId,
            int serviceId
        ) =>
        {
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Results.Unauthorized();
            }

            var service = await context
                .ServiceProviderServices.Include(sps => sps.ServiceProvider)
                .FirstOrDefaultAsync(s =>
                    s.ServiceId == serviceId && s.ServiceProviderId == serviceProviderId
                );

            if (service == null)
            {
                return Results.NotFound("Service not found.");
            }

            var userId = userIdClaim.Value;

            if (service.ServiceProvider.OwnerId != userId)
            {
                return Results.Forbid();
            }
            service.IsAvailable = !service.IsAvailable;

            await context.SaveChangesAsync();
            return Results.Ok(service.IsAvailable);
        }
    )
    .WithName("UpdateServiceAvailability")
    .RequireAuthorization()
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status403Forbidden)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapDelete(
        "/api/serviceproviders/{serviceProviderId}/services/{serviceId}",
        async (
            ApplicationDbContext context,
            HttpContext http,
            int serviceProviderId,
            int serviceId
        ) =>
        {
            var service = await context
                .ServiceProviderServices.Include(s => s.ServiceProvider)
                .FirstOrDefaultAsync(s =>
                    s.ServiceId == serviceId && s.ServiceProviderId == serviceProviderId
                );

            if (service == null)
            {
                return Results.NotFound("Service not found.");
            }

            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Results.Unauthorized();
            }
            var userId = userIdClaim.Value;
            if (service.ServiceProvider.OwnerId != userId)
            {
                return Results.Forbid();
            }

            context.ServiceProviderServices.Remove(service);
            await context.SaveChangesAsync();

            return Results.NoContent();
        }
    )
    .WithName("DeleteService")
    .Produces(StatusCodes.Status204NoContent)
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status403Forbidden)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .RequireAuthorization()
    .WithOpenApi();

app.MapGet(
        "/api/services/{serviceId}",
        async (ApplicationDbContext context, int serviceId) =>
        {
            var servicesByType = await context
                .ServiceProviderServices.Include(sps => sps.Service)
                .Where(sps => sps.ServiceId == serviceId)
                .Select(sps => new ServiceByTypeDto(
                    sps.Service.Id,
                    sps.ServiceProviderId,
                    sps.Service.Name,
                    sps.Description,
                    sps.DurationMinutes,
                    sps.Price,
                    sps.IsAvailable
                ))
                .ToListAsync();

            if (servicesByType == null || servicesByType.Count == 0)
            {
                return Results.NotFound("No services found for the specified type.");
            }

            return Results.Ok(servicesByType);
        }
    )
    .WithName("GetServiceByType")
    .Produces<CustomServiceDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound)
    .WithOpenApi();

app.MapGet(
        "/api/service-providers/{serviceProviderId}/services/{serviceId}/available-slots",
        async (
            int serviceProviderId,
            int serviceId,
            DateTime date,
            IAppointmentService appointmentService
        ) =>
        {
            // Validate that the date is not in the past
            if (date.Date < DateTime.Now.Date)
            {
                return Results.BadRequest("Cannot retrieve slots for past dates.");
            }

            var slots = await appointmentService.GetAvailableTimesAsync(
                serviceProviderId,
                serviceId,
                date
            );
            return Results.Ok(slots);
        }
    )
    .WithName("GetAvailableTimeSlots")
    .Produces<List<AvailableTimeDto>>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest)
    .WithOpenApi();

app.MapGet(
        "/api/service-providers/{serviceProviderId}/services/{serviceId}/available-dates",
        async (
            int serviceProviderId,
            int serviceId,
            DateTime? startDate,
            int daysToShow,
            IAppointmentService appointmentService
        ) =>
        {
            var start = startDate ?? DateTime.Now.Date;
            var dates = await appointmentService.GetAvailableDatesAsync(
                serviceProviderId,
                serviceId,
                start,
                daysToShow
            );
            return Results.Ok(dates);
        }
    )
    .WithName("GetAvailableDates")
    .Produces<List<DateTime>>(StatusCodes.Status200OK)
    .WithOpenApi();

// Appointment Endpoints
app.MapPost(
        "/api/appointments",
        async (
            ApplicationDbContext context,
            CreateAppointmentDto dto,
            HttpContext http,
            IAppointmentService appointmentService
        ) =>
        {
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Results.Unauthorized();
            }
            var userId = userIdClaim.Value;

            // Get service provider service details
            var serviceProviderService = await context
                .ServiceProviderServices.Include(sp => sp.Service)
                .Include(sps => sps.ServiceProvider)
                .FirstOrDefaultAsync(sp =>
                    sp.ServiceProviderId == dto.ServiceProviderId && sp.ServiceId == dto.ServiceId
                );

            if (serviceProviderService == null)
            {
                return Results.NotFound("Service not found.");
            }

            // Check if service is available
            if (!serviceProviderService.IsAvailable)
            {
                return Results.BadRequest("This service is currently unavailable.");
            }

            var endTime = dto.StartTime.AddMinutes(serviceProviderService.DurationMinutes);

            // Validate that the appointment is not in the past
            if (dto.StartTime <= DateTime.Now)
            {
                return Results.BadRequest("Cannot book appointments in the past.");
            }

            // Check if the requested time slot is available
            var isSlotAvailable = await appointmentService.IsTimeAvailableAsync(
                dto.ServiceProviderId,
                dto.ServiceId,
                dto.StartTime,
                endTime
            );

            if (!isSlotAvailable)
            {
                return Results.BadRequest(
                    "The requested time slot is not available. Please choose a different time."
                );
            }

            // Create the appointment
            var appointment = new Appointment
            {
                ServiceProviderId = dto.ServiceProviderId,
                ServiceId = dto.ServiceId,
                UserId = userId,
                StartTime = dto.StartTime,
                EndTime = endTime,
                Status = AppointmentStatus.Requested,
                Notes = dto.Notes,
                Service = serviceProviderService.Service,
                ServiceProvider = serviceProviderService.ServiceProvider,
            };

            context.Appointments.Add(appointment);

            try
            {
                await context.SaveChangesAsync();
            }
            catch (Exception)
            {
                // Handles potential race condition where slot becomes unavailable between check and save
                return Results.BadRequest(
                    "The requested time slot is no longer available. Please try again."
                );
            }

            return Results.Created(
                $"/api/appointments/{appointment.Id}",
                new AppointmentDto(
                    Id: appointment.Id,
                    StartTime: appointment.StartTime,
                    EndTime: appointment.EndTime,
                    UserId: appointment.UserId,
                    ServiceProviderId: appointment.ServiceProviderId,
                    ServiceId: appointment.ServiceId,
                    Status: appointment.Status.ToString(),
                    Notes: appointment.Notes,
                    ServiceName: appointment.Service.Name,
                    ServiceProviderName: appointment.ServiceProvider.Name
                )
            );
        }
    )
    .WithName("CreateAppointment")
    .Accepts<CreateAppointmentDto>("application/json")
    .RequireAuthorization()
    .Produces<AppointmentDto>(StatusCodes.Status201Created)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status404NotFound)
    .WithOpenApi();

app.MapGet(
        "/api/appointments",
        async (ApplicationDbContext context, HttpContext http) =>
        {
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Results.Unauthorized();
            }

            var userId = userIdClaim.Value;

            var appointments = await context
                .Appointments.Where(context => context.UserId == userId)
                .Select(a => new AppointmentDto(
                    a.Id,
                    a.StartTime,
                    a.EndTime,
                    a.UserId,
                    a.ServiceProviderId,
                    a.ServiceId,
                    a.Status.ToString(),
                    a.Notes,
                    a.Service.Name,
                    a.ServiceProvider.Name
                ))
                .ToListAsync();

            if (appointments == null)
            {
                return Results.NotFound("No appointments found for this user.");
            }

            return Results.Ok(appointments);
        }
    )
    .WithName("GetAppointmentsForUser")
    .Produces<List<AppointmentDto>>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapPut(
        "/api/appointments/status",
        async (ApplicationDbContext context, HttpContext http, UpdateAppointmentStatusDto dto) =>
        {
            var appointment = await context.Appointments.FindAsync(dto.appointmentId);
            if (appointment == null)
            {
                return Results.NotFound("Appointment not found.");
            }

            appointment.Status = dto.Status;
            return Results.Ok(
                new AppointmentDto(
                    Id: appointment.Id,
                    StartTime: appointment.StartTime,
                    EndTime: appointment.EndTime,
                    UserId: appointment.UserId,
                    ServiceProviderId: appointment.ServiceProviderId,
                    ServiceId: appointment.ServiceId,
                    Status: appointment.Status.ToString(),
                    Notes: appointment.Notes,
                    ServiceName: appointment.Service.Name,
                    ServiceProviderName: appointment.ServiceProvider.Name
                )
            );
        }
    )
    .WithName("UpdateAppointmentStatus")
    .RequireAuthorization()
    .Produces<AppointmentDto>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapDelete(
        "/api/appointments/{appointmentId}",
        async (ApplicationDbContext context, int appointmentId) =>
        {
            var appointment = await context.Appointments.FindAsync(appointmentId);

            if (appointment == null)
            {
                return Results.NotFound("Appointment not found.");
            }

            context.Appointments.Remove(appointment);
            await context.SaveChangesAsync();

            return Results.NoContent();
        }
    )
    .WithName("DeleteAppointment")
    .RequireAuthorization()
    .Produces(StatusCodes.Status204NoContent)
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status500InternalServerError)
    .WithOpenApi();

app.MapFallbackToFile("/index.html");

app.Run();
