#!/bin/bash

# JokerVision AutoFollow - Railway Deployment Script

echo "🚀 Deploying JokerVision AutoFollow to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Logging into Railway..."
railway login

# Create new project
echo "📦 Creating Railway project..."
railway init jokervision-autofollow

# Link to project
railway link

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set MONGO_URL="$MONGO_URL"
railway variables set DB_NAME="$DB_NAME"
railway variables set EMERGENT_LLM_KEY="$EMERGENT_LLM_KEY"
railway variables set TEXTBELT_API_KEY="$TEXTBELT_API_KEY"
railway variables set FACEBOOK_APP_ID="$FACEBOOK_APP_ID"
railway variables set FACEBOOK_APP_SECRET="$FACEBOOK_APP_SECRET" 
railway variables set FACEBOOK_VERIFY_TOKEN="$FACEBOOK_VERIFY_TOKEN"
railway variables set SECRET_KEY="$SECRET_KEY"
railway variables set JWT_SECRET="$JWT_SECRET"

# Deploy backend
echo "🚢 Deploying backend to Railway..."
cd backend
railway up

echo "✅ Backend deployed successfully!"
echo "🌐 Your backend URL: $(railway status --json | jq -r '.deployments[0].url')"

cd ..
echo "🎉 Deployment complete!"