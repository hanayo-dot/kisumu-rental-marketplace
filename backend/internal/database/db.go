package database

import (
	"database/sql"
	"os"

	_ "github.com/lib/pq"
)

func InitDB() (*sql.DB, error) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:password@localhost:5432/kisumu_rental?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}

func CreateTables(db *sql.DB) error {
	schema := `
	-- Users table
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		email VARCHAR(255) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		full_name VARCHAR(255) NOT NULL,
		phone VARCHAR(20),
		user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('landlord', 'tenant')),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	-- Properties table
	CREATE TABLE IF NOT EXISTS properties (
		id SERIAL PRIMARY KEY,
		landlord_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		address VARCHAR(255) NOT NULL,
		area VARCHAR(100) NOT NULL,
		city VARCHAR(100) DEFAULT 'Kisumu',
		bedrooms INT,
		bathrooms INT,
		property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('house', 'commercial', 'apartment')),
		price_per_month DECIMAL(10, 2) NOT NULL,
		available BOOLEAN DEFAULT TRUE,
		image_urls TEXT[],
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	-- Connections table
	CREATE TABLE IF NOT EXISTS connections (
		id SERIAL PRIMARY KEY,
		tenant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		property_id INT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
		landlord_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'viewing_scheduled', 'contacted', 'successful', 'rejected', 'expired')),
		landlord_note TEXT,
		connection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		verified_at TIMESTAMP,
		payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid')),
		payment_amount DECIMAL(10, 2) DEFAULT 150.00,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	-- Landlord Listings Counter
	CREATE TABLE IF NOT EXISTS landlord_listings (
		id SERIAL PRIMARY KEY,
		landlord_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
		free_listings_used INT DEFAULT 0,
		paid_listings INT DEFAULT 0,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	-- Create indexes
	CREATE INDEX IF NOT EXISTS idx_properties_landlord_id ON properties(landlord_id);
	CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
	CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_per_month);
	CREATE INDEX IF NOT EXISTS idx_connections_tenant_id ON connections(tenant_id);
	CREATE INDEX IF NOT EXISTS idx_connections_landlord_id ON connections(landlord_id);
	CREATE INDEX IF NOT EXISTS idx_connections_property_id ON connections(property_id);
	CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
	`

	_, err := db.Exec(schema)
	return err
}
