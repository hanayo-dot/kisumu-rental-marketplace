package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"kisumu-rental-marketplace/internal/models"
)

type FavoriteHandler struct {
	db *sql.DB
}

func NewFavoriteHandler(db *sql.DB) *FavoriteHandler {
	return &FavoriteHandler{db: db}
}

// AddFavorite saves a property to the authenticated user's favorites
func (h *FavoriteHandler) AddFavorite(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req models.FavoriteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.db.Exec(
		`INSERT INTO favorites (user_id, property_id) VALUES ($1, $2) ON CONFLICT (user_id, property_id) DO NOTHING`,
		userID.(int), req.PropertyID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save favorite"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "favorite saved"})
}

// ListFavorites returns the authenticated user's favorite properties
func (h *FavoriteHandler) ListFavorites(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	rows, err := h.db.Query(
		`SELECT f.id, f.property_id, f.created_at, p.id, p.landlord_id, p.title, COALESCE(p.description, ''), COALESCE(p.address, ''), COALESCE(p.area, ''), COALESCE(p.city, ''), COALESCE(p.neighborhood, ''), p.bedrooms, p.bathrooms, p.property_type, p.price_per_month, p.available, p.status, p.image_urls
		FROM favorites f
		JOIN properties p ON p.id = f.property_id
		WHERE f.user_id = $1
		ORDER BY f.created_at DESC`,
		userID.(int),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch favorites"})
		return
	}
	defer rows.Close()

	var favorites []models.Favorite
	for rows.Next() {
		var favorite models.Favorite
		var property models.Property
		var imageURLs []string
		if err := rows.Scan(
			&favorite.ID,
			&favorite.PropertyID,
			&favorite.CreatedAt,
			&property.ID,
			&property.LandlordID,
			&property.Title,
			&property.Description,
			&property.Address,
			&property.Area,
			&property.City,
			&property.Neighborhood,
			&property.Bedrooms,
			&property.Bathrooms,
			&property.PropertyType,
			&property.PricePerMonth,
			&property.Available,
			&property.Status,
			pq.Array(&imageURLs),
		); err != nil {
			continue
		}
		property.ImageURLs = imageURLs
		favorite.Property = &property
		favorites = append(favorites, favorite)
	}

	if favorites == nil {
		favorites = []models.Favorite{}
	}

	c.JSON(http.StatusOK, favorites)
}

// RemoveFavorite deletes a favorite by property id
func (h *FavoriteHandler) RemoveFavorite(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	propertyID, err := strconv.Atoi(c.Param("property_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid property id"})
		return
	}

	_, err = h.db.Exec("DELETE FROM favorites WHERE user_id = $1 AND property_id = $2", userID.(int), propertyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove favorite"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "favorite removed"})
}
