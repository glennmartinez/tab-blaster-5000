package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"

	firebasemodel "tab-blaster-server/models/firebase_model" // Add this line
)

// FirebaseService provides Firebase operations
type FirebaseService struct {
	app       *firebase.App
	auth      *auth.Client
	firestore *firestore.Client
	config    *firebasemodel.FirebaseConfig
	mu        sync.RWMutex
}

// Removed FirebaseServiceInterface - using consumer-driven interfaces instead

var (
	firebaseService *FirebaseService
	once            sync.Once
	initErr         error
)

// NewFirebaseService creates a new Firebase service instance (singleton)
func NewFirebaseService() (*FirebaseService, error) {
	once.Do(func() {
		firebaseService, initErr = initializeFirebaseService()
	})
	return firebaseService, initErr
}

// initializeFirebaseService initializes the Firebase service
func initializeFirebaseService() (*FirebaseService, error) {
	config, err := loadFirebaseConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to load Firebase config: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Initialize Firebase app with credentials
	var opts []option.ClientOption
	if config.CredentialsFile != "" {
		opts = append(opts, option.WithCredentialsFile(config.CredentialsFile))
	}

	firebaseConfig := &firebase.Config{
		ProjectID: config.ProjectID,
	}

	app, err := firebase.NewApp(ctx, firebaseConfig, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firebase app: %w", err)
	}

	// Initialize Auth client
	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Auth client: %w", err)
	}

	// Initialize Firestore client
	firestoreClient, err := app.Firestore(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firestore client: %w", err)
	}

	service := &FirebaseService{
		app:       app,
		auth:      authClient,
		firestore: firestoreClient,
		config:    config,
	}

	log.Printf("Firebase service initialized successfully for project: %s", config.ProjectID)
	return service, nil
}

// loadFirebaseConfig loads Firebase configuration from environment variables
func loadFirebaseConfig() (*firebasemodel.FirebaseConfig, error) {
	config := &firebasemodel.FirebaseConfig{
		ProjectID:       os.Getenv("FIREBASE_PROJECT_ID"),
		CredentialsFile: os.Getenv("FIREBASE_CREDENTIALS_FILE"),
	}

	if config.ProjectID == "" {
		return nil, fmt.Errorf("FIREBASE_PROJECT_ID environment variable is required")
	}

	// Check for credentials file path first (simplest approach)
	if config.CredentialsFile != "" {
		return config, nil
	}

	// Fallback: Check for complete JSON string
	if serviceAccountKey := os.Getenv("FIREBASE_SERVICE_ACCOUNT_KEY"); serviceAccountKey != "" {
		tmpFile, err := createTempServiceAccountFile(serviceAccountKey)
		if err != nil {
			return nil, fmt.Errorf("failed to create temporary service account file: %w", err)
		}
		config.CredentialsFile = tmpFile
		return config, nil
	}

	return nil, fmt.Errorf("no Firebase credentials found. Set FIREBASE_CREDENTIALS_FILE or FIREBASE_SERVICE_ACCOUNT_KEY")
}

// createTempServiceAccountFile creates a temporary file with the service account key
func createTempServiceAccountFile(serviceAccountKey string) (string, error) {
	// Validate JSON
	var jsonData map[string]interface{}
	if err := json.Unmarshal([]byte(serviceAccountKey), &jsonData); err != nil {
		return "", fmt.Errorf("invalid JSON in service account key: %w", err)
	}

	tmpFile, err := os.CreateTemp("", "firebase-service-account-*.json")
	if err != nil {
		return "", err
	}
	defer tmpFile.Close()

	if _, err := tmpFile.WriteString(serviceAccountKey); err != nil {
		os.Remove(tmpFile.Name())
		return "", err
	}

	return tmpFile.Name(), nil
}

// getEnvOrDefault returns environment variable or default value
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// TestConnection tests the Firebase connection
func (fs *FirebaseService) TestConnection() error {
	if fs == nil {
		return fmt.Errorf("Firebase service is not initialized")
	}

	fs.mu.RLock()
	defer fs.mu.RUnlock()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Test Auth service by trying to get a non-existent user (this will fail but proves connection works)
	_, err := fs.auth.GetUser(ctx, "test-connection-user-that-does-not-exist")
	if err != nil {
		// If error is "user not found", connection is working
		if auth.IsUserNotFound(err) {
			return nil
		}
		// Other errors might indicate connection issues
		return fmt.Errorf("Firebase connection test failed: %w", err)
	}

	return nil
}

// VerifyIDToken verifies a Firebase ID token
func (fs *FirebaseService) VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error) {
	if fs == nil || fs.auth == nil {
		return nil, fmt.Errorf("Firebase Auth client is not initialized")
	}

	fs.mu.RLock()
	defer fs.mu.RUnlock()

	token, err := fs.auth.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, fmt.Errorf("failed to verify ID token: %w", err)
	}

	return token, nil
}

// CreateUser creates a new user in Firebase Auth
func (fs *FirebaseService) CreateUser(ctx context.Context, email, password string) (*auth.UserRecord, error) {
	if fs == nil || fs.auth == nil {
		return nil, fmt.Errorf("Firebase Auth client is not initialized")
	}

	fs.mu.RLock()
	defer fs.mu.RUnlock()

	params := (&auth.UserToCreate{}).
		Email(email).
		Password(password).
		EmailVerified(false).
		Disabled(false)

	user, err := fs.auth.CreateUser(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// GetUser retrieves a user by UID
func (fs *FirebaseService) GetUser(ctx context.Context, uid string) (*auth.UserRecord, error) {
	if fs == nil || fs.auth == nil {
		return nil, fmt.Errorf("Firebase Auth client is not initialized")
	}

	fs.mu.RLock()
	defer fs.mu.RUnlock()

	user, err := fs.auth.GetUser(ctx, uid)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// Close closes the Firebase service and cleans up resources
func (fs *FirebaseService) Close() error {
	if fs == nil {
		return nil
	}

	fs.mu.Lock()
	defer fs.mu.Unlock()

	// Close Firestore client if initialized
	if fs.firestore != nil {
		if err := fs.firestore.Close(); err != nil {
			log.Printf("Warning: failed to close Firestore client: %v", err)
		}
	}

	// Clean up temporary credentials file if it exists
	if fs.config != nil && fs.config.CredentialsFile != "" {
		if _, err := os.Stat(fs.config.CredentialsFile); err == nil {
			// Only remove if it's a temp file (contains "firebase-service-account")
			if len(fs.config.CredentialsFile) > 0 &&
				(fs.config.CredentialsFile[:4] == "/tmp" || fs.config.CredentialsFile[:4] == "\\tmp") {
				os.Remove(fs.config.CredentialsFile)
			}
		}
	}

	log.Println("Firebase service closed")
	return nil
}

// GetProjectID returns the configured Firebase project ID
func (fs *FirebaseService) GetProjectID() string {
	if fs == nil || fs.config == nil {
		return ""
	}
	fs.mu.RLock()
	defer fs.mu.RUnlock()
	return fs.config.ProjectID
}

// GetCollection retrieves all documents from a Firestore collection
func (fs *FirebaseService) GetCollection(ctx context.Context, collectionName string) ([]map[string]interface{}, error) {
	if fs == nil || fs.firestore == nil {
		return nil, fmt.Errorf("Firestore client is not initialized")
	}

	fs.mu.RLock()
	defer fs.mu.RUnlock()

	// Get all documents from the collection
	docs, err := fs.firestore.Collection(collectionName).Documents(ctx).GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get documents from collection %s: %w", collectionName, err)
	}

	// Convert documents to map slice
	var results []map[string]interface{}
	for _, doc := range docs {
		docData := doc.Data()
		// Add the document ID to the data
		docData["id"] = doc.Ref.ID
		results = append(results, docData)
	}

	log.Printf("Retrieved %d documents from collection: %s", len(results), collectionName)
	return results, nil
}
