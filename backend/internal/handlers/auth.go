package handlers

import (
	"database/sql"
	"net/http"

	"kisumu-rental-marketplace/internal/models"
	"kisumu-rental-marketplace/internal/utils"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	db *sql.DB
}

func NewAuthHandler(db *sql.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

// Register creates a new user
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Email == "" || req.Password == "" || req.FullName == "" || req.UserType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email, password, full_name, and user_type are required"})
		return
	}

	// Hash password
	passwordHash, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process password"})
		return
	}

	// Insert user
	var userID int
	err = h.db.QueryRow(
		"INSERT INTO users (email, password_hash, full_name, phone, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		req.Email, passwordHash, req.FullName, req.Phone, req.UserType,
	).Scan(&userID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email already exists"})
		return
	}

	// Create landlord listing tracker if landlord
	if req.UserType == "landlord" {
		h.db.Exec("INSERT INTO landlord_listings (landlord_id) VALUES ($1)", userID)
	}

	// Generate token
	token, err := utils.GenerateToken(userID, req.UserType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	user := &models.User{
		ID:       userID,
		Email:    req.Email,
		FullName: req.FullName,
		Phone:    req.Phone,
		UserType: req.UserType,
	}

	c.JSON(http.StatusCreated, models.AuthResponse{
		Token:     token,
		User:      user,
		ExpiresIn: 86400,
	})
}

// Login authenticates a user
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password are required"})
		return
	}

	var user models.User
	var passwordHash string
	err := h.db.QueryRow(
		"SELECT id, email, password_hash, full_name, COALESCE(phone, ''), user_type FROM users WHERE email = $1",
		req.Email,
	).Scan(&user.ID, &user.Email, &passwordHash, &user.FullName, &user.Phone, &user.UserType)

	if err != nil || !utils.VerifyPassword(passwordHash, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.UserType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		Token:     token,
		User:      &user,
		ExpiresIn: 86400,
	})
}
