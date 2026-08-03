package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"kisumu-rental-marketplace/internal/models"
)

type PropertyHandler struct {
	db *sql.DB
}

func NewPropertyHandler(db *sql.DB) *PropertyHandler {
	return &PropertyHandler{db: db}
}

// CreateProperty creates a new property listing
func (h *PropertyHandler) CreateProperty(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	landlordID := userID.(int)

	var req struct {
		Title         string   `json:"title" binding:"required"`
		Description   string   `json:"description"`
		Address       string   `json:"address" binding:"required"`
		Area          string   `json:"area" binding:"required"`
		Bedrooms      int      `json:"bedrooms"`
		Bathrooms     int      `json:"bathrooms"`
		PropertyType  string   `json:"property_type" binding:"required"`
		PricePerMonth float64  `json:"price_per_month" binding:"required"`
		ImageURLs     []string `json:"image_urls"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.ImageURLs == nil {
		req.ImageURLs = []string{}
	}

	// Ensure landlord listing tracker exists
	h.db.Exec("INSERT INTO landlord_listings (landlord_id) VALUES ($1) ON CONFLICT (landlord_id) DO NOTHING", landlordID)

	// Check if this is the first free listing or a paid one
	var freeUsed, paidCount int
	h.db.QueryRow(
		"SELECT free_listings_used, paid_listings FROM landlord_listings WHERE landlord_id = $1",
		landlordID,
	).Scan(&freeUsed, &paidCount)

	if freeUsed == 0 {
		// First listing is free, mark it as used
		h.db.Exec("UPDATE landlord_listings SET free_listings_used = 1 WHERE landlord_id = $1", landlordID)
	} else {
		// Charge KSh.250 for additional listings
		h.db.Exec("UPDATE landlord_listings SET paid_listings = paid_listings + 1 WHERE landlord_id = $1", landlordID)
	}

	var property models.Property
	err := h.db.QueryRow(
		`INSERT INTO properties (landlord_id, title, description, address, area, bedrooms, bathrooms, property_type, price_per_month, image_urls) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
		RETURNING id, landlord_id, title, COALESCE(description, ''), address, area, bedrooms, bathrooms, property_type, price_per_month, available, image_urls, created_at, updated_at`,
		landlordID, req.Title, req.Description, req.Address, req.Area, req.Bedrooms, req.Bathrooms, req.PropertyType, req.PricePerMonth, pq.Array(req.ImageURLs),
	).Scan(&property.ID, &property.LandlordID, &property.Title, &property.Description, &property.Address, &property.Area,
		&property.Bedrooms, &property.Bathrooms, &property.PropertyType, &property.PricePerMonth, &property.Available, pq.Array(&property.ImageURLs), &property.CreatedAt, &property.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create property"})
		return
	}

	if property.ImageURLs == nil {
		property.ImageURLs = []string{}
	}

	c.JSON(http.StatusCreated, property)
}

// ListProperties lists all properties for a landlord
func (h *PropertyHandler) ListProperties(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	rows, err := h.db.Query(
		"SELECT id, landlord_id, title, COALESCE(description, ''), address, area, bedrooms, bathrooms, property_type, price_per_month, available, image_urls, created_at, updated_at FROM properties WHERE landlord_id = $1 ORDER BY created_at DESC",
		userID.(int),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch properties"})
		return
	}
	defer rows.Close()

	var properties []models.Property
	for rows.Next() {
		var prop models.Property
		if err := rows.Scan(&prop.ID, &prop.LandlordID, &prop.Title, &prop.Description, &prop.Address, &prop.Area,
			&prop.Bedrooms, &prop.Bathrooms, &prop.PropertyType, &prop.PricePerMonth, &prop.Available, pq.Array(&prop.ImageURLs), &prop.CreatedAt, &prop.UpdatedAt); err != nil {
			continue
		}
		if prop.ImageURLs == nil {
			prop.ImageURLs = []string{}
		}
		properties = append(properties, prop)
	}

	if properties == nil {
		properties = []models.Property{}
	}

	c.JSON(http.StatusOK, properties)
}

// GetProperty retrieves a single property
func (h *PropertyHandler) GetProperty(c *gin.Context) {
	propID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid property id"})
		return
	}

	var prop models.Property
	err = h.db.QueryRow(
		"SELECT id, landlord_id, title, COALESCE(description, ''), address, area, bedrooms, bathrooms, property_type, price_per_month, available, image_urls, created_at, updated_at FROM properties WHERE id = $1",
		propID,
	).Scan(&prop.ID, &prop.LandlordID, &prop.Title, &prop.Description, &prop.Address, &prop.Area,
		&prop.Bedrooms, &prop.Bathrooms, &prop.PropertyType, &prop.PricePerMonth, &prop.Available, pq.Array(&prop.ImageURLs), &prop.CreatedAt, &prop.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "property not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch property"})
		return
	}

	if prop.ImageURLs == nil {
		prop.ImageURLs = []string{}
	}

	c.JSON(http.StatusOK, prop)
}

// UpdateProperty updates a property
func (h *PropertyHandler) UpdateProperty(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	propID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid property id"})
		return
	}

	var req models.Property
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify ownership
	var landlordID int
	err = h.db.QueryRow("SELECT landlord_id FROM properties WHERE id = $1", propID).Scan(&landlordID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "property not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database query failed"})
		return
	}

	if landlordID != userID.(int) {
		c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized"})
		return
	}

	if req.ImageURLs == nil {
		req.ImageURLs = []string{}
	}

	_, err = h.db.Exec(
		"UPDATE properties SET title = $1, description = $2, address = $3, area = $4, bedrooms = $5, bathrooms = $6, price_per_month = $7, available = $8, image_urls = $9, updated_at = NOW() WHERE id = $10",
		req.Title, req.Description, req.Address, req.Area, req.Bedrooms, req.Bathrooms, req.PricePerMonth, req.Available, pq.Array(req.ImageURLs), propID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update property"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "property updated"})
}

// DeleteProperty deletes a property
func (h *PropertyHandler) DeleteProperty(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	propID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid property id"})
		return
	}

	// Verify ownership
	var landlordID int
	err = h.db.QueryRow("SELECT landlord_id FROM properties WHERE id = $1", propID).Scan(&landlordID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "property not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database query failed"})
		return
	}

	if landlordID != userID.(int) {
		c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized"})
		return
	}

	_, err = h.db.Exec("DELETE FROM properties WHERE id = $1", propID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete property"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "property deleted"})
}

// SearchProperties searches for properties by area and price
func (h *PropertyHandler) SearchProperties(c *gin.Context) {
	area := c.Query("area")
	minPrice := c.Query("min_price")
	maxPrice := c.Query("max_price")
	pType := c.Query("type")

	query := "SELECT id, landlord_id, title, COALESCE(description, ''), address, area, bedrooms, bathrooms, property_type, price_per_month, available, image_urls, created_at, updated_at FROM properties WHERE available = true"

	var args []interface{}
	argIndex := 1

	if area != "" {
		query += fmt.Sprintf(" AND area = $%d", argIndex)
		args = append(args, area)
		argIndex++
	}

	if minPrice != "" {
		minVal, _ := strconv.ParseFloat(minPrice, 64)
		query += fmt.Sprintf(" AND price_per_month >= $%d", argIndex)
		args = append(args, minVal)
		argIndex++
	}

	if maxPrice != "" {
		maxVal, _ := strconv.ParseFloat(maxPrice, 64)
		query += fmt.Sprintf(" AND price_per_month <= $%d", argIndex)
		args = append(args, maxVal)
		argIndex++
	}

	if pType != "" {
		query += fmt.Sprintf(" AND property_type = $%d", argIndex)
		args = append(args, pType)
		argIndex++
	}

	query += " ORDER BY created_at DESC"

	rows, err := h.db.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "search failed"})
		return
	}
	defer rows.Close()

	var properties []models.Property
	for rows.Next() {
		var prop models.Property
		if err := rows.Scan(&prop.ID, &prop.LandlordID, &prop.Title, &prop.Description, &prop.Address, &prop.Area,
			&prop.Bedrooms, &prop.Bathrooms, &prop.PropertyType, &prop.PricePerMonth, &prop.Available, pq.Array(&prop.ImageURLs), &prop.CreatedAt, &prop.UpdatedAt); err != nil {
			continue
		}
		if prop.ImageURLs == nil {
			prop.ImageURLs = []string{}
		}
		properties = append(properties, prop)
	}

	if properties == nil {
		properties = []models.Property{}
	}

	c.JSON(http.StatusOK, properties)
}
