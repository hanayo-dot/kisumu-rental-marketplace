package models

import "time"

// User represents a user in the system
type User struct {
	ID           int       `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	FullName     string    `json:"full_name"`
	Phone        string    `json:"phone"`
	UserType     string    `json:"user_type"` // "landlord" or "tenant"
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Property represents a rental property
type Property struct {
	ID            int       `json:"id"`
	LandlordID    int       `json:"landlord_id"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	Address       string    `json:"address"`
	Area          string    `json:"area"`
	City          string    `json:"city"`
	Bedrooms      int       `json:"bedrooms"`
	Bathrooms     int       `json:"bathrooms"`
	PropertyType  string    `json:"property_type"` // "house", "commercial", "apartment"
	PricePerMonth float64   `json:"price_per_month"`
	Available     bool      `json:"available"`
	ImageURLs     []string  `json:"image_urls"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Connection represents a tenant-property connection
type Connection struct {
	ID             int        `json:"id"`
	TenantID       int        `json:"tenant_id"`
	PropertyID     int        `json:"property_id"`
	LandlordID     int        `json:"landlord_id"`
	Status         string     `json:"status"` // "pending", "viewing_scheduled", "contacted", "successful", "rejected", "expired"
	LandlordNote   string     `json:"landlord_note"`
	ConnectionDate time.Time  `json:"connection_date"`
	VerifiedAt     *time.Time `json:"verified_at"`
	PaymentStatus  string     `json:"payment_status"` // "unpaid", "pending", "paid"
	PaymentAmount  float64    `json:"payment_amount"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`

	// Enriched fields from joins
	TenantName    string `json:"tenant_name,omitempty"`
	TenantPhone   string `json:"tenant_phone,omitempty"`
	TenantEmail   string `json:"tenant_email,omitempty"`
	PropertyTitle string `json:"property_title,omitempty"`
	LandlordName  string `json:"landlord_name,omitempty"`
	LandlordPhone string `json:"landlord_phone,omitempty"`
}

// LandlordListing tracks listing usage for landlords
type LandlordListing struct {
	ID                int       `json:"id"`
	LandlordID        int       `json:"landlord_id"`
	FreeListingsUsed  int       `json:"free_listings_used"`
	PaidListings      int       `json:"paid_listings"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// RegisterRequest for user registration
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
	Phone    string `json:"phone"`
	UserType string `json:"user_type" binding:"required,oneof=landlord tenant"`
}

// LoginRequest for user login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse contains JWT token
type AuthResponse struct {
	Token     string `json:"token"`
	User      *User  `json:"user"`
	ExpiresIn int64  `json:"expires_in"`
}

// SearchRequest for property search
type SearchRequest struct {
	Area      string  `json:"area"`
	MinPrice  float64 `json:"min_price"`
	MaxPrice  float64 `json:"max_price"`
	Type      string  `json:"type"`
	Bedrooms  int     `json:"bedrooms"`
	Bathrooms int     `json:"bathrooms"`
}

// VerifyConnectionRequest for landlord to verify connection
type VerifyConnectionRequest struct {
	Status      string `json:"status" binding:"required"`
	LandlordNote string `json:"landlord_note"`
}
