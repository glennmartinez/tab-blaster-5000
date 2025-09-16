package services

import (
	"context"
	"fmt"
	"log"
	"sync"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

// Collection structure constants - NEW optimized pattern
const (
	// Main collection name for the new structure
	COLLECTION_NAME = "tab-blaster-5k"
)

// Storage key to collection type mapping
var STORAGE_KEY_TO_COLLECTION_TYPE = map[string]string{
	"tasks":               "tasks",
	"taskFocusData":       "task-focus-data",
	"currentFocusSession": "focus-sessions",
	"disruptions":         "disruptions",
	"disruption_ids":      "disruption-ids",
	"sessions":            "sessions",
	"savedTabs":           "saved-tabs",
	"favorites":           "favorites",
	"settings":            "settings",
	"metrics":             "metrics",
	"sessionAnalytics":    "session-analytics",
}

// Session represents a user session
type Session struct {
	ID           string            `json:"id" firestore:"id"`
	Name         string            `json:"name" firestore:"name"`
	Description  string            `json:"description,omitempty" firestore:"description,omitempty"`
	CreatedAt    string            `json:"createdAt" firestore:"createdAt"`
	LastModified string            `json:"lastModified" firestore:"lastModified"`
	Tabs         []Tab             `json:"tabs" firestore:"tabs"`
	WindowCount  int               `json:"window_count,omitempty" firestore:"window_count,omitempty"`
	TabCount     int               `json:"tab_count,omitempty" firestore:"tab_count,omitempty"`
	Tags         []string          `json:"tags,omitempty" firestore:"tags,omitempty"`
	Metadata     map[string]string `json:"metadata,omitempty" firestore:"metadata,omitempty"`
}

// Tab represents a browser tab
type Tab struct {
	ID         int    `json:"id" firestore:"id"`
	URL        string `json:"url,omitempty" firestore:"url,omitempty"`
	Title      string `json:"title,omitempty" firestore:"title,omitempty"`
	WindowId   int    `json:"windowId" firestore:"windowId"`
	Index      int    `json:"index" firestore:"index"`
	Active     bool   `json:"active,omitempty" firestore:"active,omitempty"`
	Pinned     bool   `json:"pinned,omitempty" firestore:"pinned,omitempty"`
	FavIconUrl string `json:"favIconUrl,omitempty" firestore:"favIconUrl,omitempty"`
	Usage      *Usage `json:"usage,omitempty" firestore:"usage,omitempty"`
}

// Usage represents tab usage statistics
type Usage struct {
	VisitCount int    `json:"visitCount" firestore:"visitCount"`
	LastAccess string `json:"lastAccess,omitempty" firestore:"lastAccess,omitempty"` // ISO string or null
}

// SavedTab represents a saved tab
type SavedTab struct {
	ID         int               `json:"id" firestore:"id"`
	URL        string            `json:"url,omitempty" firestore:"url,omitempty"`
	Title      string            `json:"title,omitempty" firestore:"title,omitempty"`
	WindowId   int               `json:"windowId" firestore:"windowId"`
	Index      int               `json:"index" firestore:"index"`
	FavIconUrl string            `json:"favIconUrl,omitempty" firestore:"favIconUrl,omitempty"`
	SavedAt    string            `json:"savedAt" firestore:"savedAt"` // ISO string to match frontend
	Tags       []string          `json:"tags,omitempty" firestore:"tags,omitempty"`
	Notes      string            `json:"notes,omitempty" firestore:"notes,omitempty"`
	Metadata   map[string]string `json:"metadata,omitempty" firestore:"metadata,omitempty"`
}

// UserDataService handles user data operations
type UserDataService struct {
	firebaseService *FirebaseService
	mu              sync.RWMutex
}

var (
	userDataService *UserDataService
	userDataOnce    sync.Once
	userDataErr     error
)

// Helper functions for new collection structure

// getCollectionType maps storage keys to collection types
func getCollectionType(storageKey string) string {
	if collectionType, exists := STORAGE_KEY_TO_COLLECTION_TYPE[storageKey]; exists {
		return collectionType
	}
	// Default to the key itself if no mapping exists
	return storageKey
}

// getCollectionPath returns the full path for a collection
func getCollectionPath(userID, storageKey string) string {
	collectionType := getCollectionType(storageKey)
	return fmt.Sprintf("%s/%s/%s", COLLECTION_NAME, userID, collectionType)
}

// getSessionsCollectionPath returns the path for sessions collection
func getSessionsCollectionPath(userID string) string {
	return fmt.Sprintf("%s/%s/sessions", COLLECTION_NAME, userID)
}

// getSavedTabsCollectionPath returns the path for saved-tabs collection
func getSavedTabsCollectionPath(userID string) string {
	return fmt.Sprintf("%s/%s/saved-tabs", COLLECTION_NAME, userID)
}

// NewUserDataService creates a new user data service instance
func NewUserDataService() (*UserDataService, error) {
	userDataOnce.Do(func() {
		userDataService, userDataErr = initializeUserDataService()
	})
	return userDataService, userDataErr
}

// initializeUserDataService initializes the user data service
func initializeUserDataService() (*UserDataService, error) {
	firebaseService, err := NewFirebaseService()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firebase service: %w", err)
	}

	service := &UserDataService{
		firebaseService: firebaseService,
	}

	log.Println("User data service initialized successfully")
	return service, nil
}

// Session Management Methods

func (uds *UserDataService) GetUserSessions(ctx context.Context, userID string) ([]*Session, error) {
	uds.mu.RLock()
	defer uds.mu.RUnlock()

	// NEW: Use optimized collection structure
	collectionPath := getSessionsCollectionPath(userID)
	collection := uds.firebaseService.firestore.Collection(collectionPath)
	iter := collection.Documents(ctx)
	defer iter.Stop()

	var sessions []*Session
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to iterate sessions: %w", err)
		}

		var session Session
		if err := doc.DataTo(&session); err != nil {
			log.Printf("Failed to parse session %s: %v", doc.Ref.ID, err)
			continue
		}

		sessions = append(sessions, &session)
	}

	log.Printf("Retrieved %d sessions for user %s", len(sessions), userID)
	return sessions, nil
}

func (uds *UserDataService) StoreUserSession(ctx context.Context, userID string, session *Session) error {
	uds.mu.Lock()
	defer uds.mu.Unlock()

	// NEW: Use optimized collection structure
	collectionPath := getSessionsCollectionPath(userID)
	collection := uds.firebaseService.firestore.Collection(collectionPath)

	var docRef *firestore.DocumentRef
	if session.ID != "" {
		docRef = collection.Doc(session.ID)
	} else {
		docRef = collection.NewDoc()
		session.ID = docRef.ID
	}

	_, err := docRef.Set(ctx, session)
	if err != nil {
		return fmt.Errorf("failed to store session: %w", err)
	}

	log.Printf("Stored session %s for user %s (NEW structure)", session.ID, userID)
	return nil
}

func (uds *UserDataService) DeleteUserSession(ctx context.Context, userID string, sessionID string) error {
	uds.mu.Lock()
	defer uds.mu.Unlock()

	// NEW: Use optimized collection structure
	collectionPath := getSessionsCollectionPath(userID)
	docRef := uds.firebaseService.firestore.Collection(collectionPath).Doc(sessionID)
	_, err := docRef.Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}

	log.Printf("Deleted session %s for user %s (NEW structure)", sessionID, userID)
	return nil
}

func (uds *UserDataService) GetUserSession(ctx context.Context, userID string, sessionID string) (*Session, error) {
	uds.mu.Lock()
	defer uds.mu.Unlock()

	// NEW: Use optimized collection structure
	collectionPath := getSessionsCollectionPath(userID)
	docRef := uds.firebaseService.firestore.Collection(collectionPath).Doc(sessionID)
	doc, err := docRef.Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	if !doc.Exists() {
		return nil, fmt.Errorf("session not found")
	}

	var session Session
	if err := doc.DataTo(&session); err != nil {
		return nil, fmt.Errorf("failed to parse session: %w", err)
	}

	return &session, nil
}

// Saved Tabs Management Methods

func (uds *UserDataService) GetUserSavedTabs(ctx context.Context, userID string) ([]*SavedTab, error) {
	uds.mu.RLock()
	defer uds.mu.RUnlock()

	// NEW: Use optimized collection structure
	collectionPath := getSavedTabsCollectionPath(userID)
	collection := uds.firebaseService.firestore.Collection(collectionPath)
	iter := collection.Documents(ctx)
	defer iter.Stop()

	var tabs []*SavedTab
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to iterate saved tabs: %w", err)
		}

		var tab SavedTab
		if err := doc.DataTo(&tab); err != nil {
			log.Printf("Failed to parse saved tab %s: %v", doc.Ref.ID, err)
			continue
		}

		tabs = append(tabs, &tab)
	}

	log.Printf("Retrieved %d saved tabs for user %s (NEW structure)", len(tabs), userID)
	return tabs, nil
}

func (uds *UserDataService) StoreSavedTabs(ctx context.Context, userID string, tabs []*SavedTab) error {
	uds.mu.Lock()
	defer uds.mu.Unlock()

	batch := uds.firebaseService.firestore.Batch()
	// NEW: Use optimized collection structure
	collectionPath := getSavedTabsCollectionPath(userID)
	collection := uds.firebaseService.firestore.Collection(collectionPath)

	for _, tab := range tabs {
		var docRef *firestore.DocumentRef
		// Use tab ID as string for document ID, or generate new one
		tabIDStr := fmt.Sprintf("%d", tab.ID)
		if tab.ID != 0 {
			docRef = collection.Doc(tabIDStr)
		} else {
			docRef = collection.NewDoc()
			// Parse document ID back to int for the tab
			if docID := docRef.ID; len(docID) > 0 {
				// For new docs, use a hash of the document ID as integer
				hash := 0
				for _, c := range docID {
					hash = int(c) + (hash << 6) + (hash << 16) - hash
				}
				if hash < 0 {
					hash = -hash
				}
				tab.ID = hash
			}
		}
		batch.Set(docRef, tab)
	}

	_, err := batch.Commit(ctx)
	if err != nil {
		return fmt.Errorf("failed to store saved tabs: %w", err)
	}

	log.Printf("Stored %d saved tabs for user %s (NEW structure)", len(tabs), userID)
	return nil
}

// Settings Management Methods

func (uds *UserDataService) GetUserSettings(ctx context.Context, userID string) (map[string]interface{}, error) {
	uds.mu.RLock()
	defer uds.mu.RUnlock()

	// NEW: Use optimized collection structure
	collectionPath := getCollectionPath(userID, "settings")
	docRef := uds.firebaseService.firestore.Collection(collectionPath).Doc("settings")
	doc, err := docRef.Get(ctx)
	if err != nil {
		// Return empty settings if document doesn't exist
		return make(map[string]interface{}), nil
	}

	settings := doc.Data()
	log.Printf("Retrieved settings for user %s (NEW structure)", userID)
	return settings, nil
}

func (uds *UserDataService) SaveUserSettings(ctx context.Context, userID string, settings map[string]interface{}) error {
	uds.mu.Lock()
	defer uds.mu.Unlock()

	// NEW: Use optimized collection structure
	collectionPath := getCollectionPath(userID, "settings")
	docRef := uds.firebaseService.firestore.Collection(collectionPath).Doc("settings")
	_, err := docRef.Set(ctx, settings)
	if err != nil {
		return fmt.Errorf("failed to save settings: %w", err)
	}

	log.Printf("Saved settings for user %s (NEW structure)", userID)
	return nil
}

// Generic Storage Methods

func (uds *UserDataService) GetUserData(ctx context.Context, userID string, key string) (interface{}, error) {
	uds.mu.RLock()
	defer uds.mu.RUnlock()

	// NEW: Use optimized collection structure
	collectionPath := getCollectionPath(userID, key)
	docRef := uds.firebaseService.firestore.Collection(collectionPath).Doc(key)
	doc, err := docRef.Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get data for key %s: %w", key, err)
	}

	data := doc.Data()
	if value, exists := data["value"]; exists {
		return value, nil
	}

	return data, nil
}

func (uds *UserDataService) SetUserData(ctx context.Context, userID string, key string, value interface{}) error {
	uds.mu.Lock()
	defer uds.mu.Unlock()

	// NEW: Use optimized collection structure
	collectionPath := getCollectionPath(userID, key)
	docRef := uds.firebaseService.firestore.Collection(collectionPath).Doc(key)
	_, err := docRef.Set(ctx, map[string]interface{}{
		"value":     value,
		"timestamp": firestore.ServerTimestamp,
	})
	if err != nil {
		return fmt.Errorf("failed to set data for key %s: %w", key, err)
	}

	log.Printf("Saved data for key %s for user %s (NEW structure)", key, userID)
	return nil
}

func (uds *UserDataService) DeleteUserData(ctx context.Context, userID string, key string) error {
	uds.mu.Lock()
	defer uds.mu.Unlock()

	// NEW: Use optimized collection structure
	collectionPath := getCollectionPath(userID, key)
	docRef := uds.firebaseService.firestore.Collection(collectionPath).Doc(key)
	_, err := docRef.Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete data for key %s: %w", key, err)
	}

	log.Printf("Deleted data for key %s for user %s (NEW structure)", key, userID)
	return nil
}

// Close cleans up resources
func (uds *UserDataService) Close() error {
	uds.mu.Lock()
	defer uds.mu.Unlock()

	if uds.firebaseService != nil {
		return uds.firebaseService.Close()
	}

	log.Println("User data service closed")
	return nil
}
