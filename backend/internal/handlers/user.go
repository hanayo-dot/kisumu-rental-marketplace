package handlers

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"kisumu-rental-marketplace/internal/models"
)

type UserHandler struct {
	db *sql.DB
}

func NewUserHandler(db *sql.DB) *UserHandler {
	return &UserHandler{db: db}
}

// GetCurrentUser returns the profile of the authenticated user
func (h *UserHandler) GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var user models.User
	var moveInDate sql.NullTime
	err := h.db.QueryRow(
		`SELECT id, email, full_name, COALESCE(phone, ''), user_type, COALESCE(profile_picture, ''), COALESCE(bio, ''), COALESCE(languages, ''), COALESCE(preferred_locations, ''), COALESCE(preferred_property_types, ''), move_in_date, COALESCE(pets, ''), COALESCE(smoking_preference, ''), COALESCE(rental_history, ''), COALESCE(references, ''), verification_status, email_verified, phone_verified, identity_verified, verification_badge, profile_completed, joined_date, created_at, updated_at FROM users WHERE id = $1`,
		userID.(int),
	).Scan(
		&user.ID,
		&user.Email,
		&user.FullName,
		&user.Phone,
		&user.UserType,
		&user.ProfilePicture,
		&user.Bio,
		&user.Languages,
		&user.PreferredLocations,
		&user.PreferredPropertyTypes,
		&moveInDate,
		&user.Pets,
		&user.SmokingPreference,
		&user.RentalHistory,
		&user.References,
		&user.VerificationStatus,
		&user.EmailVerified,
		&user.PhoneVerified,
		&user.IdentityVerified,
		&user.VerificationBadge,
		&user.ProfileCompleted,
		&user.JoinedDate,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user profile"})
		return
	}

	if moveInDate.Valid {
		user.MoveInDate = &moveInDate.Time
	}

	c.JSON(http.StatusOK, user)
}

// UpdateCurrentUser updates profile fields for the authenticated user
func (h *UserHandler) UpdateCurrentUser(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req models.UserUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var moveInDate *time.Time
	if strings.TrimSpace(req.MoveInDate) != "" {
		parsed, err := time.Parse("2006-01-02", req.MoveInDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "move_in_date must be in YYYY-MM-DD format"})
			return
		}
		moveInDate = &parsed
	}

	_, err := h.db.Exec(
		`UPDATE users SET full_name = $1, phone = $2, bio = $3, languages = $4, preferred_locations = $5, preferred_property_types = $6, move_in_date = $7, pets = $8, smoking_preference = $9, profile_completed = TRUE, updated_at = NOW() WHERE id = $10`,
		req.FullName,
		req.Phone,
		req.Bio,
		req.Languages,
		req.PreferredLocations,
		req.PreferredPropertyTypes,
		moveInDate,
		req.Pets,
		req.SmokingPreference,
		userID.(int),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user profile"})
		return
	}

	h.GetCurrentUser(c)
}
