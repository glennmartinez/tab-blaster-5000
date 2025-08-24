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
	mux.HandleFunc("/api/tabs", tabsHandler)
	mux.HandleFunc("/api/sessions", sessionsHandler)
	
	// Setup Firebase routes
	if err := SetupFirebaseRoutes(mux); err != nil {
		log.Printf("Warning: Failed to setup Firebase routes: %v", err)
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
					"/api/firebase/testconnection",
					"/api/firebase/auth/verify",
				},
			},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	http.NotFound(w, r)
}

// tabsHandler handles tab-related requests
func tabsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		response := Response{
			Message: "Tabs retrieved successfully",
			Data: []map[string]interface{}{
				{
					"id":    1,
					"title": "Example Tab",
					"url":   "https://example.com",
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)

	case http.MethodPost:
		response := Response{
			Message: "Tab created successfully",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// sessionsHandler handles session-related requests
func sessionsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		response := Response{
			Message: "Sessions retrieved successfully",
			Data: []map[string]interface{}{
				{
					"id":   1,
					"name": "Work Session",
					"tabs": 5,
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)

	case http.MethodPost:
		response := Response{
			Message: "Session created successfully",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
