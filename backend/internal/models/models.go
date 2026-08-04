package models

import "time"

// User represents a user in the system
type User struct {
	ID                     int        `json:"id"`
	Email                  string     `json:"email"`
	PasswordHash           string     `json:"-"`
	FullName               string     `json:"full_name"`
	Phone                  string     `json:"phone"`
	UserType               string     `json:"user_type"` // "landlord", "tenant", or "admin"
	ProfilePicture         string     `json:"profile_picture"`
	Bio                    string     `json:"bio"`
	Languages              string     `json:"languages"`
	PreferredLocations     string     `json:"preferred_locations"`
	PreferredPropertyTypes string     `json:"preferred_property_types"`
	MoveInDate             *time.Time `json:"move_in_date,omitempty"`
	Pets                   string     `json:"pets"`
	SmokingPreference      string     `json:"smoking_preference"`
	RentalHistory          string     `json:"rental_history"`
	References             string     `json:"references"`
	VerificationStatus     string     `json:"verification_status"`
	EmailVerified          bool       `json:"email_verified"`
	PhoneVerified          bool       `json:"phone_verified"`
	IdentityVerified       bool       `json:"identity_verified"`
	VerificationBadge      bool       `json:"verification_badge"`
	ProfileCompleted       bool       `json:"profile_completed"`
	JoinedDate             time.Time  `json:"joined_date"`
	CreatedAt              time.Time  `json:"created_at"`
	UpdatedAt              time.Time  `json:"updated_at"`
}

// Property represents a rental property
type Property struct {
	ID                int        `json:"id"`
	LandlordID        int        `json:"landlord_id"`
	Title             string     `json:"title"`
	Description       string     `json:"description"`
	Address           string     `json:"address"`
	Area              string     `json:"area"`
	City              string     `json:"city"`
	Neighborhood      string     `json:"neighborhood"`
	Bedrooms          int        `json:"bedrooms"`
	Bathrooms         int        `json:"bathrooms"`
	PropertyType      string     `json:"property_type"` // "house", "commercial", "apartment"
	PricePerMonth     float64    `json:"price_per_month"`
	Available         bool       `json:"available"`
	Status            string     `json:"status"`
	Parking           bool       `json:"parking"`
	Furnished         bool       `json:"furnished"`
	PetFriendly       bool       `json:"pet_friendly"`
	Internet          bool       `json:"internet"`
	Water             bool       `json:"water"`
	Electricity       bool       `json:"electricity"`
	SecurityFeatures  string     `json:"security_features"`
	NearbySchools     string     `json:"nearby_schools"`
	NearbyHospitals   string     `json:"nearby_hospitals"`
	NearbyShopping    string     `json:"nearby_shopping"`
	NearbyTransport   string     `json:"nearby_transport"`
	AvailableDate     *time.Time `json:"available_date,omitempty"`
	PropertyRules     string     `json:"property_rules"`
	ImageURLs         []string   `json:"image_urls"`
	VideoURLs         []string   `json:"video_urls"`
	FloorPlanURLs     []string   `json:"floor_plan_urls"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

// Connection represents a tenant-property connection
type Connection struct {
	ID             int        `json:"id"`
	TenantID       int        `json:"tenant_id"`
	PropertyID     int        `json:"property_id"`
	LandlordID     int        `json:"landlord_id"`
	Status         string     `json:"status"`
	LandlordNote   string     `json:"landlord_note"`
	ConnectionDate time.Time  `json:"connection_date"`
	VerifiedAt     *time.Time `json:"verified_at"`
	PaymentStatus  string     `json:"payment_status"`
	PaymentAmount  float64    `json:"payment_amount"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`

	TenantName    string `json:"tenant_name,omitempty"`
	TenantPhone   string `json:"tenant_phone,omitempty"`
	TenantEmail   string `json:"tenant_email,omitempty"`
	PropertyTitle string `json:"property_title,omitempty"`
	LandlordName  string `json:"landlord_name,omitempty"`
	LandlordPhone string `json:"landlord_phone,omitempty"`
}

// Favorite represents a saved favorite property
type Favorite struct {
	ID         int       `json:"id"`
	UserID     int       `json:"user_id"`
	PropertyID int       `json:"property_id"`
	Property   *Property `json:"property,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

// Application represents a rental application
type Application struct {
	ID             int        `json:"id"`
	TenantID       int        `json:"tenant_id"`
	PropertyID     int        `json:"property_id"`
	LandlordID     int        `json:"landlord_id"`
	Status         string     `json:"status"`
	MoveInDate     *time.Time `json:"move_in_date,omitempty"`
	Notes          string     `json:"notes"`
	References     string     `json:"references"`
	RentalHistory  string     `json:"rental_history"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// Conversation represents a chat thread
type Conversation struct {
	ID         int       `json:"id"`
	TenantID   int       `json:"tenant_id"`
	LandlordID int       `json:"landlord_id"`
	PropertyID int       `json:"property_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Message represents a chat message
type Message struct {
	ID             int       `json:"id"`
	ConversationID int       `json:"conversation_id"`
	SenderID       int       `json:"sender_id"`
	Text           string    `json:"text"`
	AttachmentURL  string    `json:"attachment_url"`
	CreatedAt      time.Time `json:"created_at"`
}

// Lease represents a digital lease agreement
type Lease struct {
	ID           int       `json:"id"`
	PropertyID   int       `json:"property_id"`
	TenantID     int       `json:"tenant_id"`
	LandlordID   int       `json:"landlord_id"`
	DocumentURL  string    `json:"document_url"`
	Status       string    `json:"status"`
	StartDate    time.Time `json:"start_date"`
	EndDate      time.Time `json:"end_date"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// MaintenanceRequest represents an issue report
type MaintenanceRequest struct {
	ID           int       `json:"id"`
	TenantID     int       `json:"tenant_id"`
	PropertyID   int       `json:"property_id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	Priority     string    `json:"priority"`
	Status       string    `json:"status"`
	AttachmentURL string   `json:"attachment_url"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Notification represents a user notification
type Notification struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Title     string    `json:"title"`
	Body      string    `json:"body"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"created_at"`
}

// Review represents a rating or review
type Review struct {
	ID         int       `json:"id"`
	ReviewerID int       `json:"reviewer_id"`
	TargetID   int       `json:"target_id"`
	PropertyID int       `json:"property_id"`
	Rating     int       `json:"rating"`
	Comment    string    `json:"comment"`
	CreatedAt  time.Time `json:"created_at"`
}

// VerificationRecord tracks identity and listing verification
type VerificationRecord struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Type      string    `json:"type"`
	Status    string    `json:"status"`
	Notes     string    `json:"notes"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// AuditLog records system events
type AuditLog struct {
	ID        int       `json:"id"`
	ActorID   int       `json:"actor_id"`
	Action    string    `json:"action"`
	Target    string    `json:"target"`
	Details   string    `json:"details"`
	CreatedAt time.Time `json:"created_at"`
}

// RegisterRequest for user registration
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
	Phone    string `json:"phone"`
	UserType string `json:"user_type" binding:"required,oneof=landlord tenant admin"`
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
	Area            string  `json:"area"`
	Neighborhood    string  `json:"neighborhood"`
	City            string  `json:"city"`
	MinPrice        float64 `json:"min_price"`
	MaxPrice        float64 `json:"max_price"`
	Type            string  `json:"type"`
	Bedrooms        int     `json:"bedrooms"`
	Bathrooms       int     `json:"bathrooms"`
	Furnished       *bool   `json:"furnished"`
	PetFriendly     *bool   `json:"pet_friendly"`
	AvailableDate   string  `json:"available_date"`
	Keyword         string  `json:"keyword"`
}

// VerifyConnectionRequest for landlord to verify connection
type VerifyConnectionRequest struct {
	Status       string `json:"status" binding:"required"`
	LandlordNote string `json:"landlord_note"`
}

// UserUpdateRequest for profile updates
type UserUpdateRequest struct {
	FullName               string `json:"full_name"`
	Phone                  string `json:"phone"`
	Bio                    string `json:"bio"`
	Languages              string `json:"languages"`
	PreferredLocations     string `json:"preferred_locations"`
	PreferredPropertyTypes string `json:"preferred_property_types"`
	MoveInDate             string `json:"move_in_date"`
	Pets                   string `json:"pets"`
	SmokingPreference      string `json:"smoking_preference"`
}

// FavoriteRequest for saving favorites
type FavoriteRequest struct {
	PropertyID int `json:"property_id" binding:"required"`
}
