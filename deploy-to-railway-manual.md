# 🚀 Manual Railway Deployment Guide for JokerVision

## Step 1: Get Your MongoDB Connection String
Please provide your MongoDB Atlas connection string that looks like:
```
mongodb+srv://jokervision-admin:YOUR_PASSWORD@jokervision-production.xxxxx.mongodb.net/jokervision_production?retryWrites=true&w=majority
```

## Step 2: Railway Web Interface Deployment

### 2.1 Open Railway Dashboard
1. Go to: https://railway.app/dashboard
2. Sign in to your Railway account
3. Click **"+ New Project"**

### 2.2 Choose Deployment Method
**Option A: GitHub Connection (Recommended)**
1. Click **"Deploy from GitHub repo"**
2. Connect your GitHub account if not connected
3. You'll need to push your code to GitHub first

**Option B: Empty Project**
1. Click **"Empty Project"** 
2. Give it a name: `jokervision-backend`
3. Click **"+ Add Service"**
4. Choose **"Empty Service"**

### 2.3 Configure the Service
1. Click on your new service
2. Go to **"Settings"** tab
3. Set **"Service Name"**: `jokervision-backend`

### 2.4 Add Environment Variables
Go to **"Variables"** tab and add these one by one:

```
MONGO_URL = [Your MongoDB connection string]
DB_NAME = jokervision_production
EMERGENT_LLM_KEY = sk-emergent-2C05bB8C455C19d449
TEXTBELT_API_KEY = textbelt_test_key
FACEBOOK_APP_ID = test_app_id_123
FACEBOOK_APP_SECRET = test_app_secret_456
FACEBOOK_VERIFY_TOKEN = shottenkirk_verify_2024
SECRET_KEY = jokervision_super_secure_key_2024_production_xyz789
JWT_SECRET = jwt_secret_key_jokervision_auth_token_abc123
```

### 2.5 Deploy Your Code
If using GitHub:
1. Push your code to a GitHub repository
2. Connect that repository to Railway
3. Railway will automatically deploy

If using empty service:
1. You'll need to upload your code manually
2. Or connect to a GitHub repository later

## Step 3: Alternative - Push to GitHub First

Since Railway works best with GitHub, let's set that up:

1. Create a new repository on GitHub
2. Push your JokerVision code there
3. Connect Railway to that repository
4. Automatic deployments will work

Would you like me to help you set up the GitHub connection instead?