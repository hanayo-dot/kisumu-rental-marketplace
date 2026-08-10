package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"kisumu-rental-marketplace/internal/models"
)

type PropertyHandler struct {
	db *sql.DB
}

type rowScanner interface {
	Scan(dest ...interface{}) error
}

func NewPropertyHandler(db *sql.DB) *PropertyHandler {
	return &PropertyHandler{db: db}
}

func scanPropertyRow(scanner rowScanner, prop *models.Property) error {
	var description string
	var city, neighborhood, status, securityFeatures, nearbySchools, nearbyHospitals, nearbyShopping, nearbyTransport, propertyRules string
	var availableDate sql.NullTime
	var imageURLs, videoURLs, floorPlanURLs []string

	err := scanner.Scan(
		&prop.ID,
		&prop.LandlordID,
		&prop.Title,
		&description,
		&prop.Address,
		&prop.Area,
		&city,
		&neighborhood,
		&prop.Bedrooms,
		&prop.Bathrooms,
		&prop.PropertyType,
		&prop.PricePerMonth,
		&prop.Available,
		&prop.Status,
		&prop.Parking,
		&prop.Furnished,
		&prop.PetFriendly,
		&prop.Internet,
		&prop.Water,
		&prop.Electricity,
		&securityFeatures,
		&nearbySchools,
		&nearbyHospitals,
		&nearbyShopping,
		&nearbyTransport,
		&availableDate,
		&propertyRules,
		pq.Array(&imageURLs),
		pq.Array(&videoURLs),
		pq.Array(&floorPlanURLs),
		&prop.CreatedAt,
		&prop.UpdatedAt,
	)
	if err != nil {
		return err
	}

	prop.Description = description
	prop.City = city
	prop.Neighborhood = neighborhood
	prop.Status = status
	prop.SecurityFeatures = securityFeatures
	prop.NearbySchools = nearbySchools
	prop.NearbyHospitals = nearbyHospitals
	prop.NearbyShopping = nearbyShopping
	prop.NearbyTransport = nearbyTransport
	prop.PropertyRules = propertyRules
	prop.ImageURLs = imageURLs
	prop.VideoURLs = videoURLs
	prop.FloorPlanURLs = floorPlanURLs

	if availableDate.Valid {
		prop.AvailableDate = &availableDate.Time
	} else {
		prop.AvailableDate = nil
	}

	return nil
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
		Title            string   `json:"title" binding:"required"`
		Description      string   `json:"description"`
		Address          string   `json:"address" binding:"required"`
		Area             string   `json:"area" binding:"required"`
		City             string   `json:"city"`
		Neighborhood     string   `json:"neighborhood"`
		Bedrooms         int      `json:"bedrooms"`
		Bathrooms        int      `json:"bathrooms"`
		PropertyType     string   `json:"property_type" binding:"required"`
		PricePerMonth    float64  `json:"price_per_month" binding:"required"`
		Available        bool     `json:"available"`
		Status           string   `json:"status"`
		Parking          bool     `json:"parking"`
		Furnished        bool     `json:"furnished"`
		PetFriendly      bool     `json:"pet_friendly"`
		Internet         bool     `json:"internet"`
		Water            bool     `json:"water"`
		Electricity      bool     `json:"electricity"`
		SecurityFeatures string   `json:"security_features"`
		NearbySchools    string   `json:"nearby_schools"`
		NearbyHospitals  string   `json:"nearby_hospitals"`
		NearbyShopping   string   `json:"nearby_shopping"`
		NearbyTransport  string   `json:"nearby_transport"`
		AvailableDate    string   `json:"available_date"`
		PropertyRules    string   `json:"property_rules"`
		ImageURLs        []string `json:"image_urls"`
		VideoURLs        []string `json:"video_urls"`
		FloorPlanURLs    []string `json:"floor_plan_urls"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(req.Status) == "" {
		req.Status = "available"
	}

	if req.ImageURLs == nil {
		req.ImageURLs = []string{}
	}
	if req.VideoURLs == nil {
		req.VideoURLs = []string{}
	}
	if req.FloorPlanURLs == nil {
		req.FloorPlanURLs = []string{}
	}

	// Ensure landlord listing tracker exists
	h.db.Exec("INSERT INTO landlord_listings (landlord_id) VALUES ($1) ON CONFLICT (landlord_id) DO NOTHING", landlordID)

	// Check if this is the first free listing or a paid one
	var freeUsed int
	h.db.QueryRow(
		"SELECT free_listings_used FROM landlord_listings WHERE landlord_id = $1",
		landlordID,
	).Scan(&freeUsed)

	if freeUsed == 0 {
		// First listing is free, mark it as used
		h.db.Exec("UPDATE landlord_listings SET free_listings_used = 1 WHERE landlord_id = $1", landlordID)
	} else {
		// Charge KSh.250 for additional listings
		h.db.Exec("UPDATE landlord_listings SET paid_listings = paid_listings + 1 WHERE landlord_id = $1", landlordID)
	}

	var availableDate *time.Time
	if strings.TrimSpace(req.AvailableDate) != "" {
		parsed, err := time.Parse("2006-01-02", req.AvailableDate)
		if err == nil {
			availableDate = &parsed
		}
	}

	var property models.Property
	err := h.db.QueryRow(
		`INSERT INTO properties (landlord_id, title, description, address, area, city, neighborhood, bedrooms, bathrooms, property_type, price_per_month, available, status, parking, furnished, pet_friendly, internet, water, electricity, security_features, nearby_schools, nearby_hospitals, nearby_shopping, nearby_transport, available_date, property_rules, image_urls, video_urls, floor_plan_urls)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
		RETURNING id, landlord_id, title, COALESCE(description, ''), address, area, city, neighborhood, bedrooms, bathrooms, property_type, price_per_month, available, status, parking, furnished, pet_friendly, internet, water, electricity, COALESCE(security_features, ''), COALESCE(nearby_schools, ''), COALESCE(nearby_hospitals, ''), COALESCE(nearby_shopping, ''), COALESCE(nearby_transport, ''), available_date, COALESCE(property_rules, ''), image_urls, video_urls, floor_plan_urls, created_at, updated_at`,
		landlordID, req.Title, req.Description, req.Address, req.Area, req.City, req.Neighborhood, req.Bedrooms, req.Bathrooms, req.PropertyType, req.PricePerMonth, req.Available, req.Status, req.Parking, req.Furnished, req.PetFriendly, req.Internet, req.Water, req.Electricity, req.SecurityFeatures, req.NearbySchools, req.NearbyHospitals, req.NearbyShopping, req.NearbyTransport, availableDate, req.PropertyRules, pq.Array(req.ImageURLs), pq.Array(req.VideoURLs), pq.Array(req.FloorPlanURLs),
	).Scan(&property.ID, &property.LandlordID, &property.Title, &property.Description, &property.Address, &property.Area, &property.City, &property.Neighborhood, &property.Bedrooms, &property.Bathrooms, &property.PropertyType, &property.PricePerMonth, &property.Available, &property.Status, &property.Parking, &property.Furnished, &property.PetFriendly, &property.Internet, &property.Water, &property.Electricity, &property.SecurityFeatures, &property.NearbySchools, &property.NearbyHospitals, &property.NearbyShopping, &property.NearbyTransport, &property.AvailableDate, &property.PropertyRules, pq.Array(&property.ImageURLs), pq.Array(&property.VideoURLs), pq.Array(&property.FloorPlanURLs), &property.CreatedAt, &property.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create property"})
		return
	}

	if property.ImageURLs == nil {
		property.ImageURLs = []string{}
	}
	if property.VideoURLs == nil {
		property.VideoURLs = []string{}
	}
	if property.FloorPlanURLs == nil {
		property.FloorPlanURLs = []string{}
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
		`SELECT id, landlord_id, title, COALESCE(description, ''), address, area, city, neighborhood, bedrooms, bathrooms, property_type, price_per_month, available, status, parking, furnished, pet_friendly, internet, water, electricity, COALESCE(security_features, ''), COALESCE(nearby_schools, ''), COALESCE(nearby_hospitals, ''), COALESCE(nearby_shopping, ''), COALESCE(nearby_transport, ''), available_date, COALESCE(property_rules, ''), image_urls, video_urls, floor_plan_urls, created_at, updated_at FROM properties WHERE landlord_id = $1 ORDER BY created_at DESC`,
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
		if err := scanPropertyRow(rows, &prop); err != nil {
			continue
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
		`SELECT id, landlord_id, title, COALESCE(description, ''), address, area, city, neighborhood, bedrooms, bathrooms, property_type, price_per_month, available, status, parking, furnished, pet_friendly, internet, water, electricity, COALESCE(security_features, ''), COALESCE(nearby_schools, ''), COALESCE(nearby_hospitals, ''), COALESCE(nearby_shopping, ''), COALESCE(nearby_transport, ''), available_date, COALESCE(property_rules, ''), image_urls, video_urls, floor_plan_urls, created_at, updated_at FROM properties WHERE id = $1`,
		propID,
	).Scan(&prop.ID, &prop.LandlordID, &prop.Title, &prop.Description, &prop.Address, &prop.Area, &prop.City, &prop.Neighborhood, &prop.Bedrooms, &prop.Bathrooms, &prop.PropertyType, &prop.PricePerMonth, &prop.Available, &prop.Status, &prop.Parking, &prop.Furnished, &prop.PetFriendly, &prop.Internet, &prop.Water, &prop.Electricity, &prop.SecurityFeatures, &prop.NearbySchools, &prop.NearbyHospitals, &prop.NearbyShopping, &prop.NearbyTransport, &prop.AvailableDate, &prop.PropertyRules, pq.Array(&prop.ImageURLs), pq.Array(&prop.VideoURLs), pq.Array(&prop.FloorPlanURLs), &prop.CreatedAt, &prop.UpdatedAt)

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
	if prop.VideoURLs == nil {
		prop.VideoURLs = []string{}
	}
	if prop.FloorPlanURLs == nil {
		prop.FloorPlanURLs = []string{}
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

	var req struct {
		Title            string   `json:"title"`
		Description      string   `json:"description"`
		Address          string   `json:"address"`
		Area             string   `json:"area"`
		City             string   `json:"city"`
		Neighborhood     string   `json:"neighborhood"`
		Bedrooms         int      `json:"bedrooms"`
		Bathrooms        int      `json:"bathrooms"`
		PropertyType     string   `json:"property_type"`
		PricePerMonth    float64  `json:"price_per_month"`
		Available        bool     `json:"available"`
		Status           string   `json:"status"`
		Parking          bool     `json:"parking"`
		Furnished        bool     `json:"furnished"`
		PetFriendly      bool     `json:"pet_friendly"`
		Internet         bool     `json:"internet"`
		Water            bool     `json:"water"`
		Electricity      bool     `json:"electricity"`
		SecurityFeatures string   `json:"security_features"`
		NearbySchools    string   `json:"nearby_schools"`
		NearbyHospitals  string   `json:"nearby_hospitals"`
		NearbyShopping   string   `json:"nearby_shopping"`
		NearbyTransport  string   `json:"nearby_transport"`
		AvailableDate    string   `json:"available_date"`
		PropertyRules    string   `json:"property_rules"`
		ImageURLs        []string `json:"image_urls"`
		VideoURLs        []string `json:"video_urls"`
		FloorPlanURLs    []string `json:"floor_plan_urls"`
	}

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
	if req.VideoURLs == nil {
		req.VideoURLs = []string{}
	}
	if req.FloorPlanURLs == nil {
		req.FloorPlanURLs = []string{}
	}

	var availableDate *time.Time
	if strings.TrimSpace(req.AvailableDate) != "" {
		parsed, err := time.Parse("2006-01-02", req.AvailableDate)
		if err == nil {
			availableDate = &parsed
		}
	}

	_, err = h.db.Exec(
		`UPDATE properties SET title = $1, description = $2, address = $3, area = $4, city = $5, neighborhood = $6, bedrooms = $7, bathrooms = $8, property_type = $9, price_per_month = $10, available = $11, status = $12, parking = $13, furnished = $14, pet_friendly = $15, internet = $16, water = $17, electricity = $18, security_features = $19, nearby_schools = $20, nearby_hospitals = $21, nearby_shopping = $22, nearby_transport = $23, available_date = $24, property_rules = $25, image_urls = $26, video_urls = $27, floor_plan_urls = $28, updated_at = NOW() WHERE id = $29`,
		req.Title, req.Description, req.Address, req.Area, req.City, req.Neighborhood, req.Bedrooms, req.Bathrooms, req.PropertyType, req.PricePerMonth, req.Available, req.Status, req.Parking, req.Furnished, req.PetFriendly, req.Internet, req.Water, req.Electricity, req.SecurityFeatures, req.NearbySchools, req.NearbyHospitals, req.NearbyShopping, req.NearbyTransport, availableDate, req.PropertyRules, pq.Array(req.ImageURLs), pq.Array(req.VideoURLs), pq.Array(req.FloorPlanURLs), propID,
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
	city := c.Query("city")
	neighborhood := c.Query("neighborhood")
	minPrice := c.Query("min_price")
	maxPrice := c.Query("max_price")
	typeParam := c.Query("type")
	bedrooms := c.Query("bedrooms")
	bathrooms := c.Query("bathrooms")
	furnished := c.Query("furnished")
	petFriendly := c.Query("pet_friendly")
	keyword := c.Query("keyword")

	query := `SELECT id, landlord_id, title, COALESCE(description, ''), address, area, city, neighborhood, bedrooms, bathrooms, property_type, price_per_month, available, status, parking, furnished, pet_friendly, internet, water, electricity, COALESCE(security_features, ''), COALESCE(nearby_schools, ''), COALESCE(nearby_hospitals, ''), COALESCE(nearby_shopping, ''), COALESCE(nearby_transport, ''), available_date, COALESCE(property_rules, ''), image_urls, video_urls, floor_plan_urls, created_at, updated_at FROM properties WHERE available = true`

	var args []interface{}
	argIndex := 1

	if area != "" {
		query += fmt.Sprintf(" AND LOWER(area) = LOWER($%d)", argIndex)
		args = append(args, area)
		argIndex++
	}

	if city != "" {
		query += fmt.Sprintf(" AND LOWER(city) = LOWER($%d)", argIndex)
		args = append(args, city)
		argIndex++
	}

	if neighborhood != "" {
		query += fmt.Sprintf(" AND LOWER(neighborhood) = LOWER($%d)", argIndex)
		args = append(args, neighborhood)
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

	if typeParam != "" {
		query += fmt.Sprintf(" AND property_type = $%d", argIndex)
		args = append(args, typeParam)
		argIndex++
	}

	if bedrooms != "" {
		bedVal, _ := strconv.Atoi(bedrooms)
		query += fmt.Sprintf(" AND bedrooms >= $%d", argIndex)
		args = append(args, bedVal)
		argIndex++
	}

	if bathrooms != "" {
		bathVal, _ := strconv.Atoi(bathrooms)
		query += fmt.Sprintf(" AND bathrooms >= $%d", argIndex)
		args = append(args, bathVal)
		argIndex++
	}

	if furnished != "" {
		furnishedValue := strings.EqualFold(furnished, "true")
		query += fmt.Sprintf(" AND furnished = $%d", argIndex)
		args = append(args, furnishedValue)
		argIndex++
	}

	if petFriendly != "" {
		petValue := strings.EqualFold(petFriendly, "true")
		query += fmt.Sprintf(" AND pet_friendly = $%d", argIndex)
		args = append(args, petValue)
		argIndex++
	}

	if keyword != "" {
		keywordTerm := fmt.Sprintf("%%%s%%", keyword)
		query += fmt.Sprintf(" AND (LOWER(title) LIKE LOWER($%d) OR LOWER(description) LIKE LOWER($%d) OR LOWER(address) LIKE LOWER($%d))", argIndex, argIndex+1, argIndex+2)
		args = append(args, keywordTerm, keywordTerm, keywordTerm)
		argIndex += 3
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
		if err := scanPropertyRow(rows, &prop); err != nil {
			continue
		}
		properties = append(properties, prop)
	}

	if properties == nil {
		properties = []models.Property{}
	}

	c.JSON(http.StatusOK, properties)
}
