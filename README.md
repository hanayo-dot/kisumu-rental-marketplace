# Kisumu Rental Marketplace

A complete rental listing platform for Kisumu, Kenya that connects landlords with tenants.

**Tech Stack:** React + TypeScript (Frontend) | Go (Backend API) | PostgreSQL (Database)

## Project Structure

```
kisumu-rental-marketplace/
├── frontend/           # React TypeScript frontend (Vite, TailwindCSS)
├── backend/            # Go API server (Gin framework)
└── database/           # PostgreSQL schemas and migrations
```

## Features

- **For Tenants:**
  - Search properties by area, price range, and type
  - Send connection requests to landlords
  - Track inquiry status and payment

- **For Landlords:**
  - List first property for free, then KSh.250 per additional listing
  - Manage property listings
  - Verify tenant connections
  - Track KSh.150 payment when connection is successful

## Quick Start

### Prerequisites
- Node.js 18+
- Go 1.21+
- PostgreSQL 13+

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database URL
go mod download
go run cmd/main.go
```

Runs on `http://localhost:8080`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

### Database

```bash
# Create database
createdb kisumu_rental

# Connection string in .env
DATABASE_URL=postgres://postgres:password@localhost:5432/kisumu_rental?sslmode=disable
```

## API Endpoints

### Public Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/properties/search` - Search properties (public)

### Protected Routes (require JWT token)

**Properties:**
- `POST /api/properties` - Create property (landlord)
- `GET /api/properties` - List landlord's properties
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

**Connections:**
- `POST /api/connections` - Create connection (tenant inquiry)
- `GET /api/connections?user_type=landlord` - List connections
- `PUT /api/connections/:id/verify` - Verify connection status

## Pricing Model

- **Landlords:**
  - 1st property listing: FREE
  - Additional listings: KSh.250 each

- **Tenants:**
  - Connection fee: KSh.150 (paid after landlord confirms successful connection)

## Project Checklist

- [x] Backend API setup with Go/Gin
- [x] Database schema with PostgreSQL
- [x] Frontend with React + TypeScript
- [x] Authentication (JWT)
- [x] Property listing management
- [x] Tenant connection workflow
- [x] Landlord verification system
- [x] Search functionality
- [ ] Payment processing integration
- [ ] Image upload handling
- [ ] Email notifications
- [ ] Admin dashboard

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
```

### Backend (.env)
```
DATABASE_URL=postgres://postgres:password@localhost:5432/kisumu_rental?sslmode=disable
PORT=8080
JWT_SECRET=your-secret-key-change-in-production
```

## Development Notes

- Frontend uses Tailwind CSS for styling
- Backend uses Gin framework for routing
- JWT tokens expire after 24 hours
- Landlord can only modify their own properties
- Tenants can only view their own connections

## License

MIT
