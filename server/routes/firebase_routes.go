package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"tab-blaster-server/services"
)

// FirebaseHandler handles Firebase-related HTTP requests
type FirebaseHandler struct {
	firebaseService services.FirebaseServiceInterface
}

// NewFirebaseHandler creates a new Firebase handler
func NewFirebaseHandler() (*FirebaseHandler, error) {
	firebaseService, err := services.NewFirebaseService()
	if err != nil {
		return nil, err
	}

	return &FirebaseHandler{
		firebaseService: firebaseService,
	}, nil
}

// TestConnectionResponse represents the response for Firebase test connection
type TestConnectionResponse struct {
	Status    string `json:"status"`
	ProjectID string `json:"project_id"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

// AuthRequest represents an authentication request
type AuthRequest struct {
	IDToken string `json:"id_token"`
}

// AuthResponse represents an authentication response
type AuthResponse struct {
	UID           string            `json:"uid"`
	Email         string            `json:"email"`
	EmailVerified bool              `json:"email_verified"`
	Claims        map[string]interface{} `json:"claims,omitempty"`
}

// SetupFirebaseRoutes adds Firebase routes to the provided mux
func SetupFirebaseRoutes(mux *http.ServeMux) error {
	handler, err := NewFirebaseHandler()
	if err != nil {
		return err
	}

	// Firebase API routes
	mux.HandleFunc("/api/firebase/testconnection", handler.TestConnection)
	mux.HandleFunc("/api/firebase/auth/verify", handler.VerifyToken)
	mux.HandleFunc("/api/firebase/testdb", handler.TestDatabase)
	
	return nil
}

// TestConnection tests the Firebase connection
func (fh *FirebaseHandler) TestConnection(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Test the connection
	err := fh.firebaseService.TestConnection()
	
	response := TestConnectionResponse{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	if err != nil {
		response.Status = "error"
		response.Message = err.Error()
		
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(Response{
			Message: "Firebase connection test failed",
			Error:   err.Error(),
			Data:    response,
		})
		return
	}

	// Get project ID if connection is successful
	if fs, ok := fh.firebaseService.(*services.FirebaseService); ok {
		response.ProjectID = fs.GetProjectID()
	}

	response.Status = "success"
	response.Message = "Successfully connected to Firebase"

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Message: "Firebase connection test successful",
		Data:    response,
	})
}

// VerifyToken verifies a Firebase ID token
func (fh *FirebaseHandler) VerifyToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var authReq AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&authReq); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Message: "Invalid request body",
			Error:   err.Error(),
		})
		return
	}

	if authReq.IDToken == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Message: "ID token is required",
			Error:   "missing id_token field",
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Verify the token
	token, err := fh.firebaseService.VerifyIDToken(ctx, authReq.IDToken)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(Response{
			Message: "Token verification failed",
			Error:   err.Error(),
		})
		return
	}

	// Build response
	authResp := AuthResponse{
		UID:           token.UID,
		Claims:        token.Claims,
	}

	// Extract email and email verification status from claims
	if email, ok := token.Claims["email"].(string); ok {
		authResp.Email = email
	}
	if emailVerified, ok := token.Claims["email_verified"].(bool); ok {
		authResp.EmailVerified = emailVerified
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Message: "Token verified successfully",
		Data:    authResp,
	})
}

// TestDatabase tests Firestore database access by fetching users collection
func (fh *FirebaseHandler) TestDatabase(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Fetch users collection
	users, err := fh.firebaseService.GetCollection(ctx, "habits")
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Message: "Failed to fetch users collection",
			Error:   err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Message: fmt.Sprintf("Successfully retrieved %d users from Firestore", len(users)),
		Data: map[string]interface{}{
			"collection": "users",
			"count":      len(users),
			"users":      users,
		},
	})
}
