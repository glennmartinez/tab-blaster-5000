# Tab Blaster 5000 Server

A lightweight Go HTTP server for the Tab Blaster 5000 application using only the standard library.

## Features

- RESTful API endpoints for tabs and sessions
- Health check endpoint
- Docker containerization
- Docker Compose configuration
- Structured routing

## Project Structure

```
server/
├── main.go              # Application entry point
├── routes/              # HTTP route handlers
│   └── routes.go
├── go.mod               # Go module definition
├── go.sum               # Go module dependencies
├── Dockerfile           # Docker image configuration
├── docker-compose.yml   # Docker Compose configuration
├── .dockerignore        # Docker ignore file
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## API Endpoints

- `GET /` - Root endpoint with server information
- `GET /health` - Health check endpoint
- `GET /api/` - API information
- `GET /api/tabs` - Get all tabs
- `POST /api/tabs` - Create a new tab
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create a new session
- `GET /api/firebase/testconnection` - Test Firebase connection
- `POST /api/firebase/auth/verify` - Verify Firebase ID token

## Development

### Prerequisites

- Go 1.25+
- Docker (optional)
- Docker Compose (optional)
- Firebase Project with Admin SDK credentials

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication in your Firebase project
3. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
4. Configure environment variables (see Configuration section)

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:

- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_DATABASE_URL` - Your Firebase Realtime Database URL (optional)
- `FIREBASE_CREDENTIALS_FILE` - Path to your service account key file

Alternative (not recommended for production):

- `FIREBASE_SERVICE_ACCOUNT_KEY` - Service account JSON as string

### Running Locally

```bash
# Navigate to server directory
cd server

# Run the server
go run main.go
```

The server will start on port 8080 by default.

### Running with Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop the services
docker-compose down
```

### Building

```bash
# Build the binary
go build -o main .

# Run the binary
./main
```

### Environment Variables

- `PORT` - Server port (default: 8080)
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_DATABASE_URL` - Firebase Realtime Database URL
- `FIREBASE_CREDENTIALS_FILE` - Path to Firebase service account key
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Service account JSON (alternative to file)

## Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:8080/health

# Root endpoint
curl http://localhost:8080/

# API info
curl http://localhost:8080/api/

# Get tabs
curl http://localhost:8080/api/tabs

# Create a tab
curl -X POST http://localhost:8080/api/tabs

# Get sessions
curl http://localhost:8080/api/sessions

# Create a session
curl -X POST http://localhost:8080/api/sessions

# Test Firebase connection
curl http://localhost:8080/api/firebase/testconnection

# Verify Firebase ID token
curl -X POST http://localhost:8080/api/firebase/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"id_token":"YOUR_FIREBASE_ID_TOKEN"}'
```

## Future Enhancements

- Database integration (PostgreSQL example included in docker-compose.yml)
- Authentication and authorization
- Request logging middleware
- CORS configuration
- Rate limiting
- Input validation
- Error handling middleware
