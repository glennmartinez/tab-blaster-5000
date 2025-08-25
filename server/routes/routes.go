package routes

import (
	"encoding/json"
	"log"
	"net/http"
)

// Response represents a standard API response
type Response struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// SetupRoutes configures all the application routes
func SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("/health", healthHandler)

	// API routes
	mux.HandleFunc("/api/", apiHandler)

	// Setup Firebase routes
	if err := SetupFirebaseRoutes(mux); err != nil {
		log.Printf("Warning: Failed to setup Firebase routes: %v", err)
	}

	// Setup Auth routes
	if err := SetupAuthRoutes(mux); err != nil {
		log.Printf("Warning: Failed to setup Auth routes: %v", err)
	}

	// Setup User Data routes
	if err := SetupUserDataRoutes(mux); err != nil {
		log.Printf("Warning: Failed to setup User Data routes: %v", err)
	}

	// Root endpoint
	mux.HandleFunc("/", rootHandler)

	return mux
}

// rootHandler handles requests to the root path
func rootHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	response := Response{
		Message: "Tab Blaster 5000 Server",
		Data: map[string]string{
			"version": "1.0.0",
			"status":  "running",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// healthHandler provides a health check endpoint
func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := Response{
		Message: "Server is healthy",
		Data: map[string]string{
			"status": "ok",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// apiHandler handles general API requests
func apiHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/api/" {
		response := Response{
			Message: "Tab Blaster 5000 API",
			Data: map[string][]string{
				"endpoints": {
					"/health",
					"/api/tabs",
					"/api/sessions",
					"/api/settings",
					"/api/storage/{key}",
					"/api/firebase/testconnection",
					"/api/firebase/auth/verify",
					"/api/auth/login",
					"/api/auth/logout",
					"/api/auth/verify",
					"/api/auth/me",
				},
			},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	http.NotFound(w, r)
}
