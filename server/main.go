package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"tab-blaster-server/routes"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	// Get port from environment variable or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Setup routes
	mux := routes.SetupRoutes()

	// Setup server
	server := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	fmt.Printf("Server starting on port %s...\n", port)
	log.Fatal(server.ListenAndServe())
}
