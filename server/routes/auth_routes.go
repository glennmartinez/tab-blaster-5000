package routes

import (
	"context"
	"encoding/json"
	"net/http"
	"tab-blaster-server/services"
	"time"

	"firebase.google.com/go/v4/auth"
)

// Consumer-driven interfaces for auth routes
type UserAuthenticator interface {
	Login(ctx context.Context, req services.LoginRequest) (*services.LoginResponse, error)
	VerifyToken(ctx context.Context, idToken string) (string, error)
}

type UserLogout interface {
	Logout(ctx context.Context, userID string) error
}

type UserGetter interface {
	GetUserByID(ctx context.Context, userID string) (*auth.UserRecord, error)
}

// AuthService combines auth interfaces
type AuthService interface {
	UserAuthenticator
	UserLogout
	UserGetter
}

// AuthHandler handles authentication HTTP requests
type AuthHandler struct {
	authService AuthService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler() (*AuthHandler, error) {
	authService, err := services.NewAuthService()
	if err != nil {
		return nil, err
	}

	return &AuthHandler{
		authService: authService,
	}, nil
}

// SetupAuthRoutes adds authentication routes to the provided mux
func SetupAuthRoutes(mux *http.ServeMux) error {
	handler, err := NewAuthHandler()
	if err != nil {
		return err
	}

	// Auth API routes
	mux.HandleFunc("/api/auth/login", handler.Login)
	mux.HandleFunc("/api/auth/logout", handler.Logout)
	mux.HandleFunc("/api/auth/verify", handler.VerifyToken)
	mux.HandleFunc("/api/auth/me", handler.GetCurrentUser)

	return nil
}

// Login handles user login requests
func (ah *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var loginReq services.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Message: "Invalid request body",
			Error:   err.Error(),
		})
		return
	}

	if loginReq.Email == "" || loginReq.Password == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Message: "Email and password are required",
			Error:   "missing email or password",
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Authenticate user
	response, err := ah.authService.Login(ctx, loginReq)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(Response{
			Message: "Login failed",
			Error:   err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Message: "Login successful",
		Data:    response,
	})
}

// Logout handles user logout requests
func (ah *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var logoutReq struct {
		UserID string `json:"user_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&logoutReq); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Message: "Invalid request body",
			Error:   err.Error(),
		})
		return
	}

	if logoutReq.UserID == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Message: "User ID is required",
			Error:   "missing user_id",
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Logout user
	err := ah.authService.Logout(ctx, logoutReq.UserID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Message: "Logout failed",
			Error:   err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Message: "Logout successful",
	})
}

// VerifyToken handles token verification requests
func (ah *AuthHandler) VerifyToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var tokenReq struct {
		IDToken string `json:"id_token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&tokenReq); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Message: "Invalid request body",
			Error:   err.Error(),
		})
		return
	}

	if tokenReq.IDToken == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Message: "ID token is required",
			Error:   "missing id_token",
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Verify token
	userID, err := ah.authService.VerifyToken(ctx, tokenReq.IDToken)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(Response{
			Message: "Token verification failed",
			Error:   err.Error(),
		})
		return
	}

	// Build response with user info
	userInfo := map[string]interface{}{
		"user_id": userID,
		"valid":   true,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Message: "Token verified successfully",
		Data:    userInfo,
	})
}

// GetCurrentUser handles requests to get current user info
func (ah *AuthHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user ID from query params or headers (you might want to get this from JWT token)
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Message: "User ID is required",
			Error:   "missing user_id parameter",
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Get user info
	user, err := ah.authService.GetUserByID(ctx, userID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(Response{
			Message: "User not found",
			Error:   err.Error(),
		})
		return
	}

	// Build user response (excluding sensitive data)
	userInfo := map[string]interface{}{
		"user_id":        user.UID,
		"email":          user.Email,
		"email_verified": user.EmailVerified,
		"display_name":   user.DisplayName,
		"photo_url":      user.PhotoURL,
		"disabled":       user.Disabled,
		"created_at":     user.UserMetadata.CreationTimestamp,
		"last_signin":    user.UserMetadata.LastLogInTimestamp,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Message: "User retrieved successfully",
		Data:    userInfo,
	})
}
