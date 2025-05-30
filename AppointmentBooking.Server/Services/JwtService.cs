using AppointmentBooking.Server.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AppointmentBooking.Server.Services;

public class JwtService
{
    private readonly IConfiguration _configuration;
    private readonly SymmetricSecurityKey _signingKey;
    private readonly int _tokenExpirationDays;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;

        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is not configured.");
        _signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(key));

        if (!int.TryParse(jwtSettings["TokenExpirationDays"], out _tokenExpirationDays))
        {
            _tokenExpirationDays = 7; // Default to 7 days if not configured
        }
    }

    public string GenerateToken(ApplicationUser user)
    {
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email ?? throw new InvalidOperationException("User email is null")),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            }),
            Expires = DateTime.UtcNow.AddDays(_tokenExpirationDays),
            SigningCredentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = _signingKey,
            ValidateIssuer = false, // Set to true and configure if you have an issuer
            ValidateAudience = false, // Set to true and configure if you have an audience
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero // Reduce clock skew for stricter validation
        };

        try
        {
            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            return principal;
        }
        catch (SecurityTokenException)
        {
            return null; // Token is invalid
        }
    }
}
