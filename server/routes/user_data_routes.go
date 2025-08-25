package routes

import (
	"context"
	"encoding/json"
	"net/http"
	"tab-blaster-server/services"
	"time"
)

// Consumer-driven interfaces for user data routes
type SessionManager interface {
	GetUserSessions(ctx context.Context, userID string) ([]*services.Session, error)
	StoreUserSession(ctx context.Context, userID string, session *services.Session) error
	DeleteUserSession(ctx context.Context, userID string, sessionID string) error
	GetUserSession(ctx context.Context, userID string, sessionID string) (*services.Session, error)
}

type TabsManager interface {
	GetUserSavedTabs(ctx context.Context, userID string) ([]*services.SavedTab, error)
	StoreSavedTabs(ctx context.Context, userID string, tabs []*services.SavedTab) error
}

type SettingsManager interface {
	GetUserSettings(ctx context.Context, userID string) (map[string]interface{}, error)
	SaveUserSettings(ctx context.Context, userID string, settings map[string]interface{}) error
}

type DataManager interface {
	GetUserData(ctx context.Context, userID string, key string) (interface{}, error)
	SetUserData(ctx context.Context, userID string, key string, value interface{}) error
	DeleteUserData(ctx context.Context, userID string, key string) error
}

// UserDataService combines all user data interfaces
type UserDataServiceInterface interface {
	SessionManager
	TabsManager
	SettingsManager
	DataManager
}

// UserDataHandler handles user data HTTP requests
type UserDataHandler struct {
	userDataService UserDataServiceInterface
	authService     UserAuthenticator
}

// NewUserDataHandler creates a new user data handler
func NewUserDataHandler() (*UserDataHandler, error) {
	userDataService, err := services.NewUserDataService()
	if err != nil {
		return nil, err
	}

	authService, err := services.NewAuthService()
	if err != nil {
		return nil, err
	}

	return &UserDataHandler{
		userDataService: userDataService,
		authService:     authService,
	}, nil
}

// Helper to extract user ID from Authorization header
func (udh *UserDataHandler) getUserIDFromAuth(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", http.ErrNoCookie
	}

	// Expected format: "Bearer <token>"
	const bearerPrefix = "Bearer "
	if len(authHeader) <= len(bearerPrefix) || authHeader[:len(bearerPrefix)] != bearerPrefix {
		return "", http.ErrNoCookie
	}

	token := authHeader[len(bearerPrefix):]
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	userID, err := udh.authService.VerifyToken(ctx, token)
	if err != nil {
		return "", err
	}

	return userID, nil
}

// Helper to send error responses
func (udh *UserDataHandler) sendError(w http.ResponseWriter, statusCode int, message string, err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	errorMsg := message
	if err != nil {
		errorMsg = err.Error()
	}

	json.NewEncoder(w).Encode(Response{
		Message: message,
		Error:   errorMsg,
	})
}

// SetupUserDataRoutes adds user data routes to the provided mux
func SetupUserDataRoutes(mux *http.ServeMux) error {
	handler, err := NewUserDataHandler()
	if err != nil {
		return err
	}

	// Session routes
	mux.HandleFunc("/api/sessions", handler.HandleSessions)
	mux.HandleFunc("/api/sessions/", handler.HandleSessionByID)

	// Tabs routes
	mux.HandleFunc("/api/tabs", handler.HandleTabs)

	// Settings routes
	mux.HandleFunc("/api/settings", handler.HandleSettings)

	// Generic storage routes
	mux.HandleFunc("/api/storage/", handler.HandleStorage)

	return nil
}

// HandleSessions handles session collection requests
func (udh *UserDataHandler) HandleSessions(w http.ResponseWriter, r *http.Request) {
	userID, err := udh.getUserIDFromAuth(r)
	if err != nil {
		udh.sendError(w, http.StatusUnauthorized, "Authentication required", err)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	switch r.Method {
	case http.MethodGet:
		sessions, err := udh.userDataService.GetUserSessions(ctx, userID)
		if err != nil {
			udh.sendError(w, http.StatusInternalServerError, "Failed to fetch sessions", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Message: "Sessions retrieved successfully",
			Data:    sessions,
		})

	case http.MethodPost:
		var session services.Session
		if err := json.NewDecoder(r.Body).Decode(&session); err != nil {
			udh.sendError(w, http.StatusBadRequest, "Invalid request body", err)
			return
		}

		if err := udh.userDataService.StoreUserSession(ctx, userID, &session); err != nil {
			udh.sendError(w, http.StatusInternalServerError, "Failed to store session", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(Response{
			Message: "Session stored successfully",
			Data:    session,
		})

	default:
		udh.sendError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
	}
}

// HandleSessionByID handles individual session requests
func (udh *UserDataHandler) HandleSessionByID(w http.ResponseWriter, r *http.Request) {
	userID, err := udh.getUserIDFromAuth(r)
	if err != nil {
		udh.sendError(w, http.StatusUnauthorized, "Authentication required", err)
		return
	}

	// Extract session ID from URL path
	sessionID := r.URL.Path[len("/api/sessions/"):]
	if sessionID == "" {
		udh.sendError(w, http.StatusBadRequest, "Session ID is required", nil)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	switch r.Method {
	case http.MethodGet:
		session, err := udh.userDataService.GetUserSession(ctx, userID, sessionID)
		if err != nil {
			udh.sendError(w, http.StatusNotFound, "Session not found", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Message: "Session retrieved successfully",
			Data:    session,
		})

	case "PUT":
		var session services.Session
		if err := json.NewDecoder(r.Body).Decode(&session); err != nil {
			udh.sendError(w, http.StatusBadRequest, "Invalid request body", err)
			return
		}

		session.ID = sessionID // Ensure ID matches URL
		if err := udh.userDataService.StoreUserSession(ctx, userID, &session); err != nil {
			udh.sendError(w, http.StatusInternalServerError, "Failed to update session", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Message: "Session updated successfully",
			Data:    session,
		})

	case http.MethodDelete:
		if err := udh.userDataService.DeleteUserSession(ctx, userID, sessionID); err != nil {
			udh.sendError(w, http.StatusInternalServerError, "Failed to delete session", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Message: "Session deleted successfully",
		})

	default:
		udh.sendError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
	}
}

// HandleTabs handles saved tabs requests
func (udh *UserDataHandler) HandleTabs(w http.ResponseWriter, r *http.Request) {
	userID, err := udh.getUserIDFromAuth(r)
	if err != nil {
		udh.sendError(w, http.StatusUnauthorized, "Authentication required", err)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	switch r.Method {
	case http.MethodGet:
		tabs, err := udh.userDataService.GetUserSavedTabs(ctx, userID)
		if err != nil {
			udh.sendError(w, http.StatusInternalServerError, "Failed to fetch saved tabs", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Message: "Saved tabs retrieved successfully",
			Data:    tabs,
		})

	case http.MethodPost:
		var requestBody struct {
			Tabs []*services.SavedTab `json:"tabs"`
		}

		if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
			udh.sendError(w, http.StatusBadRequest, "Invalid request body", err)
			return
		}

		if err := udh.userDataService.StoreSavedTabs(ctx, userID, requestBody.Tabs); err != nil {
			udh.sendError(w, http.StatusInternalServerError, "Failed to store saved tabs", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(Response{
			Message: "Saved tabs stored successfully",
		})

	default:
		udh.sendError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
	}
}

// HandleSettings handles user settings requests
func (udh *UserDataHandler) HandleSettings(w http.ResponseWriter, r *http.Request) {
	userID, err := udh.getUserIDFromAuth(r)
	if err != nil {
		udh.sendError(w, http.StatusUnauthorized, "Authentication required", err)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	switch r.Method {
	case http.MethodGet:
		settings, err := udh.userDataService.GetUserSettings(ctx, userID)
		if err != nil {
			udh.sendError(w, http.StatusInternalServerError, "Failed to fetch settings", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Message: "Settings retrieved successfully",
			Data:    settings,
		})

	case http.MethodPost:
		var settings map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&settings); err != nil {
			udh.sendError(w, http.StatusBadRequest, "Invalid request body", err)
			return
		}

		if err := udh.userDataService.SaveUserSettings(ctx, userID, settings); err != nil {
			udh.sendError(w, http.StatusInternalServerError, "Failed to save settings", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Message: "Settings saved successfully",
		})

	default:
		udh.sendError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
	}
}

// HandleStorage handles generic storage requests
func (udh *UserDataHandler) HandleStorage(w http.ResponseWriter, r *http.Request) {
	userID, err := udh.getUserIDFromAuth(r)
	if err != nil {
		udh.sendError(w, http.StatusUnauthorized, "Authentication required", err)
		return
	}

	// Extract key from URL path
	key := r.URL.Path[len("/api/storage/"):]
	if key == "" {
		udh.sendError(w, http.StatusBadRequest, "Storage key is required", nil)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	switch r.Method {
	case http.MethodGet:
		data, err := udh.userDataService.GetUserData(ctx, userID, key)
		if err != nil {
			udh.sendError(w, http.StatusNotFound, "Data not found", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Message: "Data retrieved successfully",
			Data:    data,
		})

	case http.MethodPost:
		var requestBody struct {
			Value interface{} `json:"value"`
		}

		if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
			udh.sendError(w, http.StatusBadRequest, "Invalid request body", err)
			return
		}

		if err := udh.userDataService.SetUserData(ctx, userID, key, requestBody.Value); err != nil {
			udh.sendError(w, http.StatusInternalServerError, "Failed to store data", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Message: "Data stored successfully",
		})

	case http.MethodDelete:
		if err := udh.userDataService.DeleteUserData(ctx, userID, key); err != nil {
			udh.sendError(w, http.StatusInternalServerError, "Failed to delete data", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Response{
			Message: "Data deleted successfully",
		})

	default:
		udh.sendError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
	}
}
