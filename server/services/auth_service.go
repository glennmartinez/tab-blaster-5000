package services

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"firebase.google.com/go/v4/auth"
	"github.com/golang-jwt/jwt/v5"
)

// AuthService handles user authentication with JWT tokens
type AuthService struct {
	firebaseService *FirebaseService
	jwtSecret       []byte
	mu              sync.RWMutex
}

// LoginRequest represents a login request
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse represents a successful login with JWT token
type LoginResponse struct {
	UserID    string    `json:"user_id"`
	Email     string    `json:"email"`
	Token     string    `json:"token"` // JWT token instead of custom token
	ExpiresAt time.Time `json:"expires_at"`
}

// JWTClaims represents the claims in our JWT token
type JWTClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

var (
	authService *AuthService
	authOnce    sync.Once
	authErr     error
)

// NewAuthService creates a new auth service instance
func NewAuthService() (*AuthService, error) {
	authOnce.Do(func() {
		authService, authErr = initializeAuthService()
	})
	return authService, authErr
}

// initializeAuthService initializes the auth service
func initializeAuthService() (*AuthService, error) {
	firebaseService, err := NewFirebaseService()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firebase service: %w", err)
	}

	// Get JWT secret from environment or generate a secure one
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Println("JWT_SECRET not set, generating a random one")
		secretBytes := make([]byte, 32)
		if _, err := rand.Read(secretBytes); err != nil {
			return nil, fmt.Errorf("failed to generate JWT secret: %w", err)
		}
		jwtSecret = hex.EncodeToString(secretBytes)
		log.Printf("Generated JWT secret: %s", jwtSecret)
	}

	service := &AuthService{
		firebaseService: firebaseService,
		jwtSecret:       []byte(jwtSecret),
	}

	log.Println("Auth service initialized successfully with JWT tokens")
	return service, nil
}

// FirebaseSignInResponse represents the response from Firebase Auth REST API
type FirebaseSignInResponse struct {
	LocalId      string `json:"localId"`
	Email        string `json:"email"`
	IdToken      string `json:"idToken"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    string `json:"expiresIn"`
	Error        struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

// FirebaseSignInRequest represents the request to Firebase Auth REST API
type FirebaseSignInRequest struct {
	Email             string `json:"email"`
	Password          string `json:"password"`
	ReturnSecureToken bool   `json:"returnSecureToken"`
}

// Login verifies user credentials against Firebase Auth
func (as *AuthService) Login(ctx context.Context, req LoginRequest) (*LoginResponse, error) {
	as.mu.Lock()
	defer as.mu.Unlock()

	// Basic validation
	if req.Email == "" || req.Password == "" {
		return nil, fmt.Errorf("email and password are required")
	}

	// First, try to authenticate with Firebase REST API
	apiKey := as.getFirebaseAPIKey()
	if apiKey == "" {
		return nil, fmt.Errorf("Firebase API key not configured")
	}

	log.Printf("DEBUG: Using API key: %s...", apiKey[:10]) // Only show first 10 chars for security

	// Use Firebase REST API to verify credentials
	signInURL := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=%s", apiKey)

	signInReq := FirebaseSignInRequest{
		Email:             req.Email,
		Password:          req.Password,
		ReturnSecureToken: true,
	}

	reqBody, err := json.Marshal(signInReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := http.Post(signInURL, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("authentication request failed: %w", err)
	}
	defer resp.Body.Close()

	var signInResp FirebaseSignInResponse
	if err := json.NewDecoder(resp.Body).Decode(&signInResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	log.Printf("DEBUG: Response status: %d", resp.StatusCode)
	if signInResp.Error.Code != 0 {
		log.Printf("DEBUG: Firebase error: %s", signInResp.Error.Message)
	}

	// Check for errors in the response (like your example)
	if resp.StatusCode != http.StatusOK || signInResp.Error.Code != 0 {
		return nil, fmt.Errorf("authentication failed: %s", signInResp.Error.Message)
	}

	// Get user details using Admin SDK
	user, err := as.firebaseService.auth.GetUser(ctx, signInResp.LocalId)
	if err != nil {
		return nil, fmt.Errorf("failed to get user details: %w", err)
	}

	// Generate JWT token for API access
	expiresAt := time.Now().Add(24 * time.Hour) // 24-hour expiry
	token, err := as.generateJWTToken(user.UID, user.Email, expiresAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create JWT token: %w", err)
	}

	response := &LoginResponse{
		UserID:    user.UID,
		Email:     user.Email,
		Token:     token,
		ExpiresAt: expiresAt,
	}

	log.Printf("User authenticated successfully: %s", user.Email)
	return response, nil
}

// generateJWTToken creates a new JWT token for the user
func (as *AuthService) generateJWTToken(userID, email string, expiresAt time.Time) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "tab-blaster-server",
			Subject:   userID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(as.jwtSecret)
}

// VerifyToken verifies and parses a JWT token, returning the user ID
func (as *AuthService) VerifyToken(ctx context.Context, tokenString string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return as.jwtSecret, nil
	})

	if err != nil {
		return "", fmt.Errorf("token verification failed: %w", err)
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		log.Printf("JWT token verified successfully for user: %s", claims.UserID)
		return claims.UserID, nil
	}

	return "", fmt.Errorf("invalid token claims")
}

// getFirebaseAPIKey extracts API key from environment variables
func (as *AuthService) getFirebaseAPIKey() string {
	apiKey := os.Getenv("FIREBASE_API_KEY")
	if apiKey == "" {
		log.Println("WARNING: FIREBASE_API_KEY not set in environment")
		return "AIzaSyDbstc4ULwozJLhIqJrLKMqfhL9tKGp3Yg" // Fallback for development
	}
	return apiKey
}

// Logout revokes all refresh tokens for a user (Firebase method)
func (as *AuthService) Logout(ctx context.Context, userID string) error {
	as.mu.Lock()
	defer as.mu.Unlock()

	if userID == "" {
		return fmt.Errorf("user ID is required")
	}

	// Revoke all refresh tokens for the user using Firebase
	err := as.firebaseService.auth.RevokeRefreshTokens(ctx, userID)
	if err != nil {
		log.Printf("Failed to revoke tokens for user %s: %v", userID, err)
		// Don't return error here, just log it - logout should still succeed
	}

	log.Printf("User logged out: %s", userID)
	return nil
}

// GetUserByID retrieves user information by ID from Firebase
func (as *AuthService) GetUserByID(ctx context.Context, userID string) (*auth.UserRecord, error) {
	return as.firebaseService.auth.GetUser(ctx, userID)
}

// Close cleans up resources
func (as *AuthService) Close() error {
	as.mu.Lock()
	defer as.mu.Unlock()

	if as.firebaseService != nil {
		return as.firebaseService.Close()
	}

	log.Println("Auth service closed")
	return nil
}
