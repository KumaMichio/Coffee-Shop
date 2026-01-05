# Coffee Shop Finder - Development Commands

.PHONY: help install dev build test clean docker-up docker-down docker-build docker-logs

# Default target
help:
	@echo "Available commands:"
	@echo "  install       - Install dependencies for backend and frontend"
	@echo "  dev           - Start development servers"
	@echo "  build         - Build for production"
	@echo "  test          - Run tests"
	@echo "  clean         - Clean node_modules and build files"
	@echo "  docker-up     - Start services with Docker Compose"
	@echo "  docker-down   - Stop Docker services"
	@echo "  docker-build  - Rebuild Docker images"
	@echo "  docker-logs   - Show Docker logs"

# Install dependencies
install:
	cd backend && npm install
	cd ../frontend && npm install

# Start development servers
dev:
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:5001"
	@echo "Frontend: http://localhost:3000"
	@echo "Make sure PostgreSQL is running on port 5432"
	cd backend && npm run dev &
	cd ../frontend && npm start

# Build for production
build:
	cd frontend && npm run build
	cd ../backend && npm run build 2>/dev/null || echo "Backend build not needed"

# Run tests
test:
	cd backend && npm test
	cd ../frontend && npm test -- --watchAll=false

# Clean up
clean:
	cd backend && rm -rf node_modules
	cd ../frontend && rm -rf node_modules build

# Docker commands
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose up -d --build

docker-logs:
	docker-compose logs -f

# Database commands
db-init:
	psql -U postgres -c "CREATE DATABASE coffee_app;" 2>/dev/null || echo "Database already exists"
	psql -U postgres -d coffee_app -f database.sql

db-reset:
	psql -U postgres -c "DROP DATABASE IF EXISTS coffee_app;"
	psql -U postgres -c "CREATE DATABASE coffee_app;"
	psql -U postgres -d coffee_app -f database.sql