#!/bin/bash

# JokerVision AutoFollow - Vercel Deployment Script

echo "🚀 Deploying JokerVision AutoFollow Frontend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging into Vercel..."
vercel login

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build the project
echo "🔨 Building React application..."
yarn build

# Deploy to Vercel
echo "🚢 Deploying to Vercel..."
vercel --prod

# Set environment variables
echo "⚙️  Setting environment variables..."
vercel env add REACT_APP_BACKEND_URL production
# You'll be prompted to enter: https://jokervision-backend.up.railway.app

echo "✅ Frontend deployed successfully!"
echo "🌐 Visit your site at: https://jokervision.vercel.app"

cd ..
echo "🎉 Frontend deployment complete!"