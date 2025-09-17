# Authentication System Overview

This document explains the complete authentication flow for the Ultimate Tab Manager Chrome Extension, covering both frontend (Chrome Extension) and backend (Go Server) components.

## Architecture Overview

The authentication system follows a professional server-side JWT token approach:

- **Firebase**: Used only for user authentication and password validation
- **Go Server**: Generates and manages JWT tokens for session management
- **Chrome Extension**: Stores and sends JWT tokens for API requests

## Authentication Flow

### 1. User Login Process

#### Frontend (Chrome Extension)

1. User enters email and password in the extension popup
2. `SimpleAuthService.login()` is called
3. Credentials are sent to the Go server's `/login` endpoint via HTTP POST

#### Backend (Go Server)

1. Server receives login request at `/routes/auth_routes.go`
2. `AuthService.Login()` validates credentials with Firebase REST API
3. If valid, server generates a JWT token with user information
4. Server returns JWT token and user data to the client

### 2. JWT Token Generation (Server-Side)

```go
// Server generates JWT token with HMAC-SHA256 signing
type JWTClaims struct {
    UserID string `json:"user_id"`
    Email  string `json:"email"`
    jwt.RegisteredClaims
}

// Token expires in 24 hours
ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour))
```

### 3. Token Storage (Client-Side)

```typescript
// Client stores JWT token in Chrome storage
await chrome.storage.local.set({
  authUser: this.currentUser,
  customToken: data.token, // JWT token
});
```

### 4. Authenticated API Requests

#### Frontend Request Flow

1. `ServerStorageAdapter.makeAuthenticatedRequest()` is called for any API operation
2. Service retrieves JWT token from `SimpleAuthService.getToken()`
3. Token is added to Authorization header: `Bearer <jwt_token>`
4. Request is sent to the Go server

#### Backend Request Handling

1. Server receives request with Authorization header
2. `getUserIDFromAuth()` extracts token from header
3. `AuthService.VerifyToken()` validates JWT token
4. If valid, user ID is extracted and request proceeds
5. If invalid, 401 Unauthorized is returned

## Key Components

### Frontend Components

#### SimpleAuthService (`src/services/SimpleAuthService.ts`)

- **Purpose**: Manages authentication state and tokens
- **Key Methods**:
  - `login(email, password)`: Authenticates user with server
  - `getToken()`: Retrieves stored JWT token
  - `logout()`: Clears authentication data
  - `getCurrentUser()`: Returns current user information

#### ServerStorageAdapter (`src/services/adapters/ServerStorageAdapter.ts`)

- **Purpose**: Handles authenticated API requests to server
- **Key Methods**:
  - `makeAuthenticatedRequest()`: Adds JWT token to requests
  - All storage operations (sessions, tabs, settings, etc.)

### Backend Components

#### AuthService (`server/services/auth_service.go`)

- **Purpose**: Core authentication logic and JWT management
- **Key Methods**:
  - `Login()`: Validates credentials with Firebase and generates JWT
  - `VerifyToken()`: Validates JWT tokens and returns user ID
  - `generateJWTToken()`: Creates signed JWT tokens

#### Auth Routes (`server/routes/auth_routes.go`)

- **Purpose**: HTTP endpoints for authentication operations
- **Endpoints**:
  - `POST /login`: User authentication
  - `POST /logout`: User logout
  - `POST /verify`: Token verification

#### User Data Routes (`server/routes/user_data_routes.go`)

- **Purpose**: Protected API endpoints requiring authentication
- **Authentication**: Uses `getUserIDFromAuth()` middleware
- **Endpoints**: All user data operations (sessions, tabs, settings, storage)

## Security Features

### JWT Token Security

- **Signing Method**: HMAC-SHA256
- **Secret**: Randomly generated 256-bit key (environment configurable)
- **Expiration**: 24-hour token lifetime
- **Claims**: Minimal user data (ID, email)

### Firebase Integration

- **Limited Scope**: Only used for password validation
- **No Client Access**: Chrome extension never directly communicates with Firebase
- **Server-Only**: All Firebase operations happen server-side

### Request Security

- **Bearer Token**: JWT sent in Authorization header
- **HTTPS**: All communications over secure connections
- **Token Validation**: Every protected endpoint validates JWT

## Error Handling

### Authentication Failures

1. **Invalid Credentials**: Firebase returns authentication error
2. **Expired Token**: JWT validation fails, client redirected to login
3. **Missing Token**: 401 Unauthorized returned immediately
4. **Invalid Token**: JWT parsing/validation fails

### Client-Side Error Handling

```typescript
if (response.status === 401) {
  console.error("Authentication expired. Please login again.");
  await this.authService.logout();
  throw new Error("Authentication expired. Please login again.");
}
```

### Server-Side Error Handling

```go
if err != nil {
    return "", fmt.Errorf("token verification failed: %w", err)
}
```

## Configuration

### Environment Variables

```bash
# Firebase Configuration (Server)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id

# JWT Configuration (Server)
JWT_SECRET=your_jwt_secret_key  # Optional, auto-generated if not set

# API URLs (Client)
VITE_API_URL=http://localhost:8080  # Server API base URL
```

### Chrome Extension Permissions

```json
{
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["http://localhost:8080/*"]
}
```

## Development Workflow

### Starting the System

1. **Start Go Server**: `cd server && go run main.go`
2. **Build Extension**: `npm run build`
3. **Load Extension**: Load `dist` folder in Chrome Developer Mode

### Testing Authentication

1. Open Chrome extension popup
2. Enter valid Firebase user credentials
3. Verify successful login and token storage
4. Test protected API operations (sessions, tabs, etc.)
5. Verify token expiration handling

## Troubleshooting

### Common Issues

#### "User is not authenticated" Error

- **Cause**: JWT token missing or invalid
- **Solution**: Check token storage, verify server JWT validation

#### Login Successful but API Calls Fail

- **Cause**: Token format mismatch between client and server
- **Solution**: Verify LoginResponse interface matches server response

#### Server JWT Errors

- **Cause**: Missing JWT_SECRET or invalid token format
- **Solution**: Check server logs, verify JWT secret generation

### Debug Steps

1. Check browser console for client-side errors
2. Check server logs for authentication failures
3. Verify JWT token format and expiration
4. Test API endpoints with valid tokens

## Future Enhancements

### Planned Improvements

- **Token Refresh**: Automatic token renewal before expiration
- **Multi-Device Support**: Token management across multiple browser instances
- **Enhanced Security**: Token rotation and revocation capabilities
- **Audit Logging**: Comprehensive authentication event tracking

### Performance Optimizations

- **Token Caching**: Reduce storage access for token retrieval
- **Request Batching**: Combine multiple authenticated requests
- **Connection Pooling**: Optimize server HTTP connections
