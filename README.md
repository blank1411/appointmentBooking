
# Appointment Booking System

A full-stack appointment booking system built with **ASP.NET Core (.NET 8)** and **React**.

## 🚀 Getting Started

### 📦 Requirements

- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [Node.js (v18+)](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/)
- Visual Studio 2022+ or VS Code

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/appointmentBooking.git
cd appointmentBooking
```

### 2. Backend (.NET API)

#### 📁 Open solution with Visual Studio and restore dependencies

```bash
dotnet restore
```

#### ⚙️ Setup `appsettings.json`

Create a new `appsettings.json` file in the root folder using this template:

```json
{
  "ConnectionStrings": {
    "AppointmentBookingDatabase": "Server=YOUR_SERVER_NAME;Database=AppointmentBookingDatabase;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "JwtSettings": {
    "Key": "your-secure-secret-key-here",
    "TokenExpirationDays": 7
  }
}
```

#### 🧬 Apply Database Migrations

```bash
dotnet ef database update
```

### 3. Frontend (React)

```bash
cd appointmentbooking.client
npm install
```

To run the frontend:

```bash
npm run dev
```

### 4. Run the Full App

Preferably start the .server folder from Visual Studio on https server and start the .client with VSCode using "npm run dev".

Visit the app at: [https://localhost:59826](https://localhost:59826)

## ✨ Features

- JWT-based authentication
- Add, edit, and delete businesses and services
- Book appointments
- Secure REST API
- SQL Server integration with EF Core
