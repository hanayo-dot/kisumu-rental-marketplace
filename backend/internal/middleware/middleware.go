package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"kisumu-rental-marketplace/internal/utils"
)

// AuthMiddleware validates JWT tokens and populates userID and userType in context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		userID, userType, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}

		c.Set("userID", userID)
		c.Set("userType", userType)
		c.Next()
	}
}

// RequireRole ensures the authenticated user has one of the allowed roles
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userTypeVal, exists := c.Get("userType")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		userTypeStr, ok := userTypeVal.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "invalid user role"})
			c.Abort()
			return
		}

		for _, r := range roles {
			if strings.EqualFold(r, userTypeStr) {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions for this action"})
		c.Abort()
	}
}

// CORSMiddleware handles CORS safely with configurable origin
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allowedOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
		
		var allowOrigin string
		if allowedOrigins != "" {
			origins := strings.Split(allowedOrigins, ",")
			for _, o := range origins {
				if strings.TrimSpace(o) == origin {
					allowOrigin = origin
					break
				}
			}
		}

		if allowOrigin == "" {
			if origin != "" {
				allowOrigin = origin
			} else {
				allowOrigin = "http://localhost:5173"
			}
		}

		c.Writer.Header().Set("Access-Control-Allow-Origin", allowOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

