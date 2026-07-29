# Kisumu Rental Marketplace - Setup Guide

## Quick Start (5-10 minutes)

### Step 1: Prerequisites
- Node.js 18+ (for frontend)
- Go 1.21+ (for backend)
- PostgreSQL 13+ (for database)

### Step 2: Database Setup
```bash
# Create database
createdb -U postgres kisumu_rental

# Or using Docker
docker run --name kisumu-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=kisumu_rental \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### Step 3: Backend Setup
```bash
cd backend

# Create .env file (if not already created)
cp .env.example .env

# Install dependencies
go mod download

# Run server
go run cmd/main.go
```

The server will start at `http://localhost:8080`

### Step 4: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`

---

## Using Docker (Recommended for Production)

```bash
# Start everything with one command
docker-compose up --build

# Services will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080
# Database: localhost:5432
```

---

## Available Commands

### Using Make
```bash
make help              # Show all available commands
make dev              # Run all services locally
make backend          # Run backend only
make frontend         # Run frontend only
make db-start         # Start PostgreSQL
make docker-up        # Start with Docker
make docker-down      # Stop Docker containers
```

### Direct Commands
```bash
# Backend
cd backend && go run cmd/main.go

# Frontend
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build

# Start production preview
cd frontend && npm run preview
```

---

## Project Architecture

### Frontend (React + TypeScript)
- **Location:** `/frontend`
- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** React Context API
- **HTTP Client:** Fetch API

**Key Pages:**
- `/login` - User login
- `/register` - New user registration
- `/search` - Property search (for tenants)
- `/landlord/dashboard` - Landlord dashboard

**Key Components:**
- Authentication (Login/Register)
- Property listing and search
- Tenant connection requests
- Landlord connection verification

### Backend (Go + Gin)
- **Location:** `/backend`
- **Framework:** Gin Web Framework
- **Database:** PostgreSQL
- **Authentication:** JWT (expiry: 24 hours)
- **Port:** 8080

**API Structure:**
```
/api/auth
  POST /register        - Register user
  POST /login           - Login user

/api/properties
  POST /                - Create property (KSh.250 for extra listings)
  GET /                 - List user's properties
  GET /search           - Search properties (public)
  GET /:id              - Get single property
  PUT /:id              - Update property
  DELETE /:id           - Delete property

/api/connections
  POST /                - Create connection (tenant inquiry)
  GET /                 - List connections
  PUT /:id/verify       - Verify connection (landlord)
```

### Database (PostgreSQL)
- **Location:** `/database` (migrations handled in code)
- **Tables:**
  - `users` - User accounts (landlord/tenant)
  - `properties` - Rental listings
  - `connections` - Tenant-property connections
  - `landlord_listings` - Tracking free/paid listings per landlord

---

## Authentication Flow

1. User registers with email, password, name, phone, and type (landlord/tenant)
2. Password is hashed with bcrypt
3. User logs in with email and password
4. Server returns JWT token (valid for 24 hours)
5. Token stored in browser localStorage
6. Subsequent requests include `Authorization: Bearer <token>` header
7. Server validates token before allowing access to protected routes

---

## Pricing Model

### Landlord Charges
- **First property:** FREE
- **Each additional property:** KSh.250 (charged when listing is created)

### Tenant Charges
- **Connection fee:** KSh.150 (charged ONLY when landlord confirms successful connection)
- **Confirmation statuses:** 
  - `pending` - Awaiting landlord review
  - `viewing_scheduled` - Landlord confirmed viewing
  - `contacted` - Landlord contacted tenant
  - `successful` - Connection successful, payment triggered
  - `rejected` - Landlord rejected
  - `expired` - No action within 7 days

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgres://postgres:password@localhost:5432/kisumu_rental?sslmode=disable
PORT=8080
JWT_SECRET=your-secret-key-change-in-production
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
```

---

## Common Issues

### Issue: "Cannot connect to database"
**Solution:** Make sure PostgreSQL is running and the DATABASE_URL is correct.
```bash
# Check PostgreSQL status
psql -U postgres -h localhost -c "SELECT 1;"
```

### Issue: "Frontend shows blank page"
**Solution:** Check browser console for errors. Make sure backend is running on port 8080.

### Issue: "CORS errors in browser console"
**Solution:** Backend CORS middleware is configured to allow all origins. Check that API_URL in frontend .env matches backend URL.

### Issue: "Go mod download fails with permission error"
**Solution:** This is a system-level permission issue. Try:
```bash
export GOPATH=$HOME/go
go mod download
```

---

## Development Tips

1. **Hot Reload:** Both frontend and backend support hot reload during development
2. **Database:** Use `make db-start` to quickly start a fresh PostgreSQL instance
3. **Testing:** Use Postman or `curl` to test API endpoints
4. **Logs:** Check browser console (frontend) and terminal (backend) for errors

---

## Deployment

### Using Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Deploy backend binary to server
3. Set environment variables
4. Run backend: `./main`
5. Serve frontend from `/frontend/dist` using nginx or similar

---

## File Structure Details

```
frontend/src/
├── pages/              # Page components (Login, Register, Search, Dashboard)
├── components/         # Reusable UI components
├── services/          # API service functions
├── hooks/             # Custom React hooks (useAuth)
├── types/             # TypeScript type definitions
├── App.tsx            # Main app component with routing
└── main.tsx           # React entry point

backend/
├── cmd/
│   └── main.go        # Server entry point
├── internal/
│   ├── handlers/      # HTTP request handlers
│   ├── models/        # Data structures
│   ├── database/      # Database functions
│   ├── middleware/    # Auth and CORS middleware
│   └── utils/         # Helper functions
└── go.mod             # Go module definition
```

---

## Support

For issues or questions, check:
1. README.md files in backend/ and frontend/
2. API documentation comments in handler files
3. TypeScript types in frontend/src/types/
4. Database schema in backend/internal/database/db.go
