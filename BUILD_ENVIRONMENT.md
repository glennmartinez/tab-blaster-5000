# Environment Configuration & Build Process

## Environment Setup

This project supports automatic environment-based server URL configuration:

### Development Mode

- **Server URL**: `http://localhost:8080`
- **Use Case**: Local development with Docker Compose
- **Environment**: `VITE_IS_DEVELOPMENT=true`

### Production Mode

- **Server URL**: `https://tab-blaster-5k-19786549408.us-central1.run.app`
- **Use Case**: Production deployment to cloud
- **Environment**: `VITE_IS_DEVELOPMENT=false`

## Build Commands

### Development Builds

```bash
# Development build (uses localhost:8080)
npm run build:dev

# Development server (uses localhost:8080)
npm run dev

# Development build with watch mode
npm run build:watch
```

### Production Builds

```bash
# Production build (uses cloud URL)
npm run build:prod

# Build and preview production
npm run preview:prod
```

### Docker Development

```bash
# Start local server with Docker Compose (auto-uses localhost:8080)
docker-compose up

# Then run development build
npm run build:dev
```

## Environment Files

- `.env.development` - Development environment variables
- `.env.production` - Production environment variables
- `.env` - Default/fallback environment variables

## Configuration Flow

1. **Build Process** determines environment mode via `--mode development|production`
2. **Vite** loads appropriate `.env.{mode}` file
3. **ConfigService** reads `VITE_IS_DEVELOPMENT` flag
4. **Server URL** is automatically selected:
   - `true` → `http://localhost:8080`
   - `false` → `https://tab-blaster-5k-19786549408.us-central1.run.app`

## Manual Override

Users can still manually override the server URL through the Settings UI. The environment configuration only sets the initial default value.

## Benefits

- ✅ **Zero Configuration**: Automatic environment detection
- ✅ **Docker Ready**: Works out-of-the-box with docker-compose
- ✅ **Build Flexibility**: Explicit dev/prod build commands
- ✅ **User Override**: Manual server URL configuration still available
- ✅ **No Hardcoded URLs**: All URLs managed through environment variables
