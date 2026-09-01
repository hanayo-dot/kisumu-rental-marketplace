package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"kisumu-rental-marketplace/internal/models"
)

type ConnectionHandler struct {
	db *sql.DB
}

func NewConnectionHandler(db *sql.DB) *ConnectionHandler {
	return &ConnectionHandler{db: db}
}

// CreateConnection creates a new tenant-property connection
func (h *ConnectionHandler) CreateConnection(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	tenantID := userID.(int)

	var req struct {
		PropertyID int `json:"property_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get property and landlord info
	var prop models.Property
	var landlordID int
	err := h.db.QueryRow(
		"SELECT id, landlord_id, title FROM properties WHERE id = $1",
		req.PropertyID,
	).Scan(&prop.ID, &landlordID, &prop.Title)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "property not found"})
		return
	}

	// Check if an active connection already exists
	var existingID int
	err = h.db.QueryRow(
		"SELECT id FROM connections WHERE tenant_id = $1 AND property_id = $2 AND status NOT IN ('rejected', 'expired')",
		tenantID, req.PropertyID,
	).Scan(&existingID)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "A connection request for this property already exists"})
		return
	}

	// Create connection
	var connection models.Connection
	err = h.db.QueryRow(
		`INSERT INTO connections (tenant_id, property_id, landlord_id, status, payment_amount) 
		VALUES ($1, $2, $3, 'pending', 150) 
		RETURNING id, tenant_id, property_id, landlord_id, status, payment_status, payment_amount, created_at`,
		tenantID, req.PropertyID, landlordID,
	).Scan(&connection.ID, &connection.TenantID, &connection.PropertyID, &connection.LandlordID, &connection.Status, &connection.PaymentStatus, &connection.PaymentAmount, &connection.CreatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create connection"})
		return
	}

	connection.PropertyTitle = prop.Title
	c.JSON(http.StatusCreated, connection)
}

// ListConnections lists connections for landlord or tenant
func (h *ConnectionHandler) ListConnections(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userType := c.Query("user_type") // "landlord" or "tenant"
	contextUserType, existsType := c.Get("userType")
	if existsType {
		if uStr, ok := contextUserType.(string); ok && uStr != "" && uStr != "admin" {
			userType = uStr
		}
	}
	if userType == "" {
		userType = "tenant"
	}

	var rows *sql.Rows
	var err error

	if userType == "landlord" {
		rows, err = h.db.Query(
			`SELECT c.id, c.tenant_id, c.property_id, c.landlord_id, c.status, COALESCE(c.landlord_note, ''), 
			        c.verified_at, c.payment_status, c.payment_amount, c.created_at, c.updated_at,
			        u.full_name, COALESCE(u.phone, ''), u.email, p.title
			 FROM connections c
			 JOIN users u ON c.tenant_id = u.id
			 JOIN properties p ON c.property_id = p.id
			 WHERE c.landlord_id = $1 
			 ORDER BY c.created_at DESC`,
			userID.(int),
		)
	} else {
		rows, err = h.db.Query(
			`SELECT c.id, c.tenant_id, c.property_id, c.landlord_id, c.status, COALESCE(c.landlord_note, ''), 
			        c.verified_at, c.payment_status, c.payment_amount, c.created_at, c.updated_at,
			        u.full_name, COALESCE(u.phone, ''), p.title
			 FROM connections c
			 JOIN users u ON c.landlord_id = u.id
			 JOIN properties p ON c.property_id = p.id
			 WHERE c.tenant_id = $1 
			 ORDER BY c.created_at DESC`,
			userID.(int),
		)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch connections"})
		return
	}
	defer rows.Close()

	var connections []models.Connection
	for rows.Next() {
		var conn models.Connection
		if userType == "landlord" {
			if err := rows.Scan(&conn.ID, &conn.TenantID, &conn.PropertyID, &conn.LandlordID, &conn.Status, &conn.LandlordNote, &conn.VerifiedAt, &conn.PaymentStatus, &conn.PaymentAmount, &conn.CreatedAt, &conn.UpdatedAt, &conn.TenantName, &conn.TenantPhone, &conn.TenantEmail, &conn.PropertyTitle); err != nil {
				continue
			}
		} else {
			if err := rows.Scan(&conn.ID, &conn.TenantID, &conn.PropertyID, &conn.LandlordID, &conn.Status, &conn.LandlordNote, &conn.VerifiedAt, &conn.PaymentStatus, &conn.PaymentAmount, &conn.CreatedAt, &conn.UpdatedAt, &conn.LandlordName, &conn.LandlordPhone, &conn.PropertyTitle); err != nil {
				continue
			}
		}
		connections = append(connections, conn)
	}

	if connections == nil {
		connections = []models.Connection{}
	}

	c.JSON(http.StatusOK, connections)
}

// VerifyConnection allows landlord to verify a connection
func (h *ConnectionHandler) VerifyConnection(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	connID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid connection id"})
		return
	}

	var req models.VerifyConnectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify this is the landlord for this connection
	var landlordID int
	h.db.QueryRow("SELECT landlord_id FROM connections WHERE id = $1", connID).Scan(&landlordID)
	if landlordID != userID.(int) {
		c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized"})
		return
	}

	verifiedAt := time.Now()
	paymentStatus := "unpaid"

	if req.Status == "successful" {
		paymentStatus = "pending" // Mark for payment
	}

	_, err = h.db.Exec(
		`UPDATE connections SET status = $1, landlord_note = $2, verified_at = $3, payment_status = $4 WHERE id = $5`,
		req.Status, req.LandlordNote, verifiedAt, paymentStatus, connID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify connection"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "connection verified",
		"status":         req.Status,
		"payment_status": paymentStatus,
	})
}

// PayConnection marks a successful connection as paid by the tenant.
func (h *ConnectionHandler) PayConnection(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	connID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid connection id"})
		return
	}

	var tenantID int
	var paymentStatus string
	var paymentAmount float64
	var connectionStatus string
	err = h.db.QueryRow(
		"SELECT tenant_id, payment_status, payment_amount, status FROM connections WHERE id = $1",
		connID,
	).Scan(&tenantID, &paymentStatus, &paymentAmount, &connectionStatus)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "connection not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load connection"})
		return
	}

	if tenantID != userID.(int) {
		c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized"})
		return
	}

	if connectionStatus != "successful" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "payment can only be made after the landlord confirms a successful connection"})
		return
	}

	if paymentStatus == "paid" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "payment already completed"})
		return
	}

	tx, err := h.db.BeginTx(c.Request.Context(), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to begin transaction"})
		return
	}
	defer tx.Rollback()

	reference := fmt.Sprintf("connection-%d-payment", connID)
	_, err = tx.ExecContext(c.Request.Context(),
		`INSERT INTO payments (user_id, amount, currency, provider, method, status, reference, metadata)
		 VALUES ($1, $2, 'KES', 'local', 'direct', 'completed', $3, '{}'::jsonb)`,
		userID.(int), paymentAmount, reference,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record payment"})
		return
	}

	_, err = tx.ExecContext(c.Request.Context(),
		"UPDATE connections SET payment_status = 'paid', updated_at = NOW() WHERE id = $1",
		connID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update connection payment status"})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to commit payment transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "payment completed", "payment_status": "paid"})
}
