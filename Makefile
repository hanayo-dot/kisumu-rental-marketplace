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

COMPOSE_CMD := $(shell command -v docker-compose 2>/dev/null || (docker compose version >/dev/null 2>&1 && echo "docker compose"))

install-backend:
	cd backend && go mod download

install-frontend:
	cd frontend && npm install

db-start:
	@docker stop kisumu-db 2>/dev/null || true
	@docker rm kisumu-db 2>/dev/null || true
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
	@if [ -n "$(COMPOSE_CMD)" ]; then \
		$(COMPOSE_CMD) up --build; \
	else \
		echo "docker-compose plugin not found, falling back to standalone Docker CLI..."; \
		docker network create kisumu-network 2>/dev/null || true; \
		docker stop kisumu-db kisumu-backend 2>/dev/null || true; \
		docker rm kisumu-db kisumu-backend 2>/dev/null || true; \
		docker run -d --name kisumu-db --network kisumu-network -e POSTGRES_PASSWORD=password -e POSTGRES_DB=kisumu_rental -p 5432:5432 postgres:15-alpine; \
		echo "Waiting for database container to be ready..."; \
		sleep 3; \
		docker build -t kisumu-backend ./backend; \
		docker run -d --name kisumu-backend --network kisumu-network -e DATABASE_URL=postgres://postgres:password@kisumu-db:5432/kisumu_rental?sslmode=disable -e PORT=8080 -p 8080:8080 kisumu-backend; \
		echo "PostgreSQL running on localhost:5432, Go Backend API running on localhost:8080"; \
	fi

docker-down:
	@if [ -n "$(COMPOSE_CMD)" ]; then \
		$(COMPOSE_CMD) down; \
	else \
		docker stop kisumu-backend kisumu-db 2>/dev/null || true; \
		docker rm kisumu-backend kisumu-db 2>/dev/null || true; \
		docker network rm kisumu-network 2>/dev/null || true; \
	fi

clean:
	@if [ -n "$(COMPOSE_CMD)" ]; then $(COMPOSE_CMD) down -v; else docker stop kisumu-backend kisumu-db 2>/dev/null || true; docker rm kisumu-backend kisumu-db 2>/dev/null || true; docker network rm kisumu-network 2>/dev/null || true; fi
	rm -rf frontend/dist frontend/node_modules
	go clean ./...
