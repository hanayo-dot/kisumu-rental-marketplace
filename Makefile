.PHONY: help install-backend install-frontend dev backend frontend db-start docker-up docker-down

help:
	@echo "Kisumu Rental Marketplace - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev                 - Start all services (backend, frontend, db)"
	@echo "  make backend             - Run Go backend only"
	@echo "  make frontend            - Run React frontend only"
	@echo ""
	@echo "Database:"
	@echo "  make db-start            - Start PostgreSQL container"
	@echo "  make db-create           - Create database"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up           - Build and start all services with Docker"
	@echo "  make docker-down         - Stop Docker services"
	@echo ""
	@echo "Installation:"
	@echo "  make install-backend     - Install Go dependencies"
	@echo "  make install-frontend    - Install Node dependencies"

install-backend:
	cd backend && go mod download

install-frontend:
	cd frontend && npm install

db-start:
	docker run --name kisumu-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=kisumu_rental -p 5432:5432 -d postgres:15-alpine

db-create:
	createdb -U postgres -h localhost kisumu_rental 2>/dev/null || echo "Database already exists"

backend:
	cd backend && go run cmd/main.go

backend-run:
	cd backend && ./run.sh

frontend:
	cd frontend && npm run dev

dev:
	@echo "Starting Kisumu Rental Marketplace..."
	@echo "Backend: http://localhost:8080"
	@echo "Frontend: http://localhost:5173"
	@echo ""
	@echo "Make sure PostgreSQL is running at localhost:5432"
	@echo ""
	@(cd backend && go run cmd/main.go) & \
	(cd frontend && npm run dev) & \
	wait

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

clean:
	docker-compose down -v
	rm -rf frontend/dist frontend/node_modules
	go clean ./...
