package utils

import (
	"testing"
)

func TestHashAndVerifyPassword(t *testing.T) {
	password := "securePassword123"

	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if hash == password {
		t.Errorf("Hash should not match raw password")
	}

	if !VerifyPassword(hash, password) {
		t.Errorf("VerifyPassword failed for correct password")
	}

	if VerifyPassword(hash, "wrongPassword") {
		t.Errorf("VerifyPassword passed for incorrect password")
	}
}

func TestGenerateAndValidateToken(t *testing.T) {
	userID := 42
	userType := "landlord"

	token, err := GenerateToken(userID, userType)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	if token == "" {
		t.Fatalf("Generated token is empty")
	}

	extractedID, extractedRole, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	if extractedID != userID {
		t.Errorf("Expected userID %d, got %d", userID, extractedID)
	}

	if extractedRole != userType {
		t.Errorf("Expected userType %s, got %s", userType, extractedRole)
	}
}

func TestValidateInvalidToken(t *testing.T) {
	_, _, err := ValidateToken("invalid.jwt.token")
	if err == nil {
		t.Errorf("Expected error for invalid token, got nil")
	}
}
