package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"kisumu-rental-marketplace/internal/database"
	"kisumu-rental-marketplace/internal/handlers"
	"kisumu-rental-marketplace/internal/middleware"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Create tables
	if err := database.CreateTables(db); err != nil {
		log.Fatalf("Failed to create tables: %v", err)
	}

	// Initialize Gin router
	router := gin.Default()

	// Middleware
	router.Use(middleware.CORSMiddleware())

	// Auth routes
	authHandler := handlers.NewAuthHandler(db)
	auth := router.Group("/api/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Protected routes middleware
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware())

	// Property routes
	propertyHandler := handlers.NewPropertyHandler(db)
	properties := protected.Group("/properties")
	{
		properties.POST("", propertyHandler.CreateProperty)
		properties.GET("", propertyHandler.ListProperties)
		properties.GET("/:id", propertyHandler.GetProperty)
		properties.PUT("/:id", propertyHandler.UpdateProperty)
		properties.DELETE("/:id", propertyHandler.DeleteProperty)
	}

	// Connection routes
	connectionHandler := handlers.NewConnectionHandler(db)
	connections := protected.Group("/connections")
	{
		connections.POST("", connectionHandler.CreateConnection)
		connections.GET("", connectionHandler.ListConnections)
		connections.PUT("/:id/verify", connectionHandler.VerifyConnection)
	}

	// Public routes
	public := router.Group("/api")
	{
		public.GET("/properties/search", propertyHandler.SearchProperties)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server running on :%s\n", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
