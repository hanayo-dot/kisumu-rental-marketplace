package utils

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes a password
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash), err
}

// VerifyPassword verifies a password against a hash
func VerifyPassword(hash, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateToken generates a JWT token including userID and userType
func GenerateToken(userID int, userType string) (string, error) {
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		if os.Getenv("APP_ENV") == "production" {
			return "", errors.New("JWT_SECRET environment variable must be set in production")
		}
		secretKey = "your-secret-key-change-in-production"
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := jwt.MapClaims{
		"userID":   userID,
		"userType": userType,
		"exp":      expirationTime.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secretKey))
}

// ValidateToken validates and parses a JWT token, returning userID and userType
func ValidateToken(tokenString string) (int, string, error) {
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		secretKey = "your-secret-key-change-in-production"
	}

	token, err := jwt.ParseWithClaims(tokenString, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		return 0, "", err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return 0, "", errors.New("invalid token")
	}

	userIDFloat, ok := claims["userID"].(float64)
	if !ok {
		return 0, "", errors.New("invalid userID in token")
	}

	userType, _ := claims["userType"].(string)

	return int(userIDFloat), userType, nil
}

