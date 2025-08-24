#!/bin/bash

# Test script for the Go server Firebase integration

BASE_URL="http://localhost:8080"

echo "🚀 Testing Tab Blaster 5000 Go Server with Firebase Integration"
echo "=============================================================="

# Test server health
echo "🏥 Testing server health..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$response" -eq 200 ]; then
    echo "✅ Server health check passed"
else
    echo "❌ Server health check failed (HTTP $response)"
    exit 1
fi

# Test API endpoints
echo ""
echo "📋 Testing API endpoints..."
curl -s "$BASE_URL/api/" | jq '.' || echo "API endpoint test completed"

# Test Firebase connection
echo ""
echo "🔥 Testing Firebase connection..."
firebase_response=$(curl -s "$BASE_URL/api/firebase/testconnection")
echo "$firebase_response" | jq '.' || echo "$firebase_response"

firebase_status=$(echo "$firebase_response" | jq -r '.data.status // "unknown"')
if [ "$firebase_status" = "success" ]; then
    echo "✅ Firebase connection test passed"
else
    echo "⚠️  Firebase connection test failed or not configured"
    echo "   Make sure to configure your Firebase environment variables"
fi

echo ""
echo "🎉 Test completed!"
echo ""
echo "📖 Next steps:"
echo "   1. Configure your Firebase project in .env file"
echo "   2. Add your service account key"
echo "   3. Test the /api/firebase/testconnection endpoint"
echo "   4. Integrate with your Chrome extension"
