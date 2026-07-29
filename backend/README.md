# Kisumu Rental Marketplace - Backend API

Backend API built with Go, Gin framework, and PostgreSQL.

## Setup

1. Install Go 1.21+
2. Install PostgreSQL
3. Copy `.env.example` to `.env` and configure database URL
4. Run: `go mod download`
5. Run: `go run cmd/main.go`

Server runs on `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Properties (Protected)
- `POST /api/properties` - Create property (KSh.250 for additional listings)
- `GET /api/properties` - List landlord's properties
- `GET /api/properties/:id` - Get single property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Search (Public)
- `GET /api/properties/search?area=Kisumu&min_price=5000&max_price=50000` - Search properties

### Connections (Protected)
- `POST /api/connections` - Create connection (tenant inquiry)
- `GET /api/connections?user_type=landlord` - List connections
- `PUT /api/connections/:id/verify` - Verify connection (landlord)

## Database Schema
- `users` - User accounts (landlord/tenant)
- `properties` - Rental listings
- `connections` - Tenant-property connections
- `landlord_listings` - Track free and paid listings per landlord
