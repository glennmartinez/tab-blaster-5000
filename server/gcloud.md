# Google Cloud Deployment Guide

This guide covers deploying the Tab Blaster Server to Google Cloud Run with secure secret management.

## Prerequisites

```bash
# Install gcloud CLI (if not installed)
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project tab-blaster-5k
```

## Enable Required APIs

```bash
# Enable Cloud Run, Container Registry, and Secret Manager
gcloud services enable run.googleapis.com --project tab-blaster-5k
gcloud services enable containerregistry.googleapis.com --project tab-blaster-5k
gcloud services enable secretmanager.googleapis.com --project tab-blaster-5k
```

## Build and Push Docker Image

```bash
# Build docke image -
cd server
docker build -t server-tab-blaster-server .
# Configure Docker to use gcloud as credential helper
gcloud auth configure-docker

# Tag your image for Google Container Registry
docker tag server-tab-blaster-server gcr.io/tab-blaster-5k/tab-blaster-server:latest

# Push to registry
docker push gcr.io/tab-blaster-5k/tab-blaster-server:latest
```

## Create Secrets

```bash
# Create Firebase API Key secret
echo "YOUR_FIREBASE_API_KEY" | gcloud secrets create FIREBASE_API_KEY \
  --project tab-blaster-5k \
  --data-file=-

# Create Firebase Service Account Key secret (replace with your actual JSON)
echo '{"type":"service_account","project_id":"YOUR_PROJECT_ID","private_key_id":"YOUR_KEY_ID","private_key":"YOUR_PRIVATE_KEY","client_email":"YOUR_CLIENT_EMAIL",...}' | gcloud secrets create FIREBASE_SERVICE_ACCOUNT_KEY \
  --project tab-blaster-5k \
  --data-file=-
```

## Grant Secret Access Permissions

```bash
#fetch project number
gcloud projects describe tab-blaster-5k --format='value(projectNumber)'
```

```bash
# Grant access to FIREBASE_API_KEY secret
gcloud secrets add-iam-policy-binding FIREBASE_API_KEY \
  --project tab-blaster-5k \
  --member "serviceAccount:19786549408-compute@developer.gserviceaccount.com" \
  --role "roles/secretmanager.secretAccessor"

# Grant access to FIREBASE_SERVICE_ACCOUNT_KEY secret
gcloud secrets add-iam-policy-binding FIREBASE_SERVICE_ACCOUNT_KEY \
  --project tab-blaster-5k \
  --member "serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role "roles/secretmanager.secretAccessor"
```

**Note**: Replace `YOUR_PROJECT_NUMBER` with your actual project number. You can get it with:

```bash
gcloud projects describe tab-blaster-5k --format='value(projectNumber)'
```

## Initial Deploy

```bash
# Deploy to Cloud Run with secrets
gcloud run deploy tab-blaster-5k \
  --image gcr.io/tab-blaster-5k/tab-blaster-server:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID" \
  --set-secrets="FIREBASE_API_KEY=FIREBASE_API_KEY:latest" \
  --set-secrets="FIREBASE_SERVICE_ACCOUNT_KEY=FIREBASE_SERVICE_ACCOUNT_KEY:latest" \
  --memory 512Mi \
  --cpu 1
```

## Redeploy Service (After Updates)

```bash
# Update existing service with new image and/or secrets
gcloud run services update tab-blaster-5k \
  --project tab-blaster-5k \
  --region us-central1 \
  --image gcr.io/tab-blaster-5k/tab-blaster-server:latest \
  --set-env-vars="FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID" \
  --set-secrets="FIREBASE_API_KEY=FIREBASE_API_KEY:latest" \
  --set-secrets="FIREBASE_SERVICE_ACCOUNT_KEY=FIREBASE_SERVICE_ACCOUNT_KEY:latest"
```

## Useful Commands

### View Services

```bash
# List all Cloud Run services
gcloud run services list --project tab-blaster-5k

# Get service URL
gcloud run services describe tab-blaster-5k \
  --project tab-blaster-5k \
  --region us-central1 \
  --format 'value(status.url)'
```

### Manage Secrets

```bash
# List all secrets
gcloud secrets list --project tab-blaster-5k

#create secret
echo -n "your-jwt-secret-value" | gcloud secrets create jwt-secret --data-file=-

# View secret metadata (not the actual value)
gcloud secrets describe FIREBASE_API_KEY --project tab-blaster-5k
gcloud secrets describe FIREBASE_SERVICE_ACCOUNT_KEY --project tab-blaster-5k

# Check IAM policy for secrets
gcloud secrets get-iam-policy FIREBASE_API_KEY --project tab-blaster-5k
gcloud secrets get-iam-policy FIREBASE_SERVICE_ACCOUNT_KEY --project tab-blaster-5k
```

### Update Secrets

```bash
# Update a secret with new value
echo "NEW_API_KEY_VALUE" | gcloud secrets versions add FIREBASE_API_KEY \
  --project tab-blaster-5k \
  --data-file=-
```

### View Logs

```bash
# View service logs
gcloud run services logs read tab-blaster-5k \
  --project tab-blaster-5k \
  --region us-central1 \
  --limit 50

# Stream logs in real-time
gcloud run services logs tail tab-blaster-5k \
  --project tab-blaster-5k \
  --region us-central1
```

## Testing Deployment

```bash
# Test health endpoint
curl https://YOUR_SERVICE_URL/health

# Test Firebase connection
curl https://YOUR_SERVICE_URL/api/firebase/testconnection

# Test database connection
curl https://YOUR_SERVICE_URL/api/firebase/testdb
```

## Security Notes

- ✅ No credentials stored in Docker image
- ✅ Secrets managed by Google Cloud Secret Manager
- ✅ IAM-controlled access to secrets
- ✅ Secrets encrypted at rest and in transit
- ✅ Safe to push Docker image to public registries

## Troubleshooting

### Permission Denied on Secrets

If you get permission errors, ensure the service account has the correct permissions:

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe tab-blaster-5k --format='value(projectNumber)')

# Grant permissions
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --project tab-blaster-5k \
  --member "serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role "roles/secretmanager.secretAccessor"
```

### Service Not Starting

Check logs for initialization errors:

```bash
gcloud run services logs read tab-blaster-5k --project tab-blaster-5k --region us-central1
```

Common issues:

- Missing environment variables
- Invalid secret values
- Network connectivity issues
