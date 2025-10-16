# 🔧 Complete External Setup Guide - Step by Step

**Total Time Required:** ~30-45 minutes  
**Required:** Credit card (for verification, most services have free tiers)  
**Difficulty:** Beginner-friendly

---

## 📋 TABLE OF CONTENTS

1. [Twilio SMS Setup (PRIORITY 1)](#1-twilio-sms-setup)
2. [Facebook Integration Setup (PRIORITY 2)](#2-facebook-integration-setup)
3. [Chrome Extension Installation (PRIORITY 3)](#3-chrome-extension-installation)
4. [OpenAI API Key (Optional)](#4-openai-api-key-optional)
5. [Social Media Integrations (Optional)](#5-social-media-integrations)
6. [Testing All Integrations](#6-testing-all-integrations)

---

## 1. TWILIO SMS SETUP (15 minutes)

### Why You Need This:
- Send real SMS messages to leads
- Receive SMS messages from leads
- Enable AI SMS bot functionality

### What You Get Free:
- $15 free trial credit
- ~500 SMS messages (US)
- Unlimited incoming messages

---

### STEP 1: Create Twilio Account

1. **Go to Twilio Website**
   - Open browser: https://www.twilio.com/try-twilio
   - Click "Sign up for free" (red button)

2. **Fill Registration Form**
   ```
   First Name: [Your First Name]
   Last Name: [Your Last Name]
   Email: [Your Business Email]
   Password: [Strong Password - save this!]
   ```
   - Check "I'm not a robot"
   - Click "Start your free trial"

3. **Verify Your Email**
   - Check your email inbox
   - Click verification link in email from Twilio
   - You'll be redirected to Twilio Console

4. **Verify Your Phone Number**
   - Twilio will ask for your phone number
   - Enter: `+1 (555) 123-4567` (your real number)
   - Choose: "Text me" 
   - Enter the 6-digit code you receive
   - Click "Submit"

---

### STEP 2: Get Your Phone Number

1. **Navigate to Phone Numbers**
   - In Twilio Console, click "Get a trial number" button
   - OR go to: Console → Develop → Phone Numbers → Manage → Buy a number

2. **Select Your Number**
   - Twilio will suggest a number (usually local to your area)
   - Make sure it has these capabilities checked:
     - ✅ Voice
     - ✅ SMS
     - ✅ MMS
   - Click "Choose this number"
   - Click "Done" (it's free!)

3. **Save Your Phone Number**
   - You'll see something like: `+1 234 567 8900`
   - **COPY THIS NUMBER** - you'll need it!
   - Write it down: `___________________________`

---

### STEP 3: Get Your API Credentials

1. **Go to Account Settings**
   - Click on your profile picture (top right)
   - Select "Account" → "API keys & tokens"
   - OR direct link: https://console.twilio.com/

2. **Find Your Credentials**
   You'll see three important values:

   **Account SID** (looks like: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   ```
   Example: AC1234567890abcdef1234567890abcd
   ```
   - Click "Show" to reveal
   - Click "Copy" icon
   - Paste somewhere safe

   **Auth Token** (looks like: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   ```
   Example: 1234567890abcdef1234567890abcdef
   ```
   - Click "Show" to reveal
   - Click "Copy" icon
   - Paste somewhere safe

3. **Keep These Safe!**
   - Create a text file: `twilio_credentials.txt`
   - Save:
     ```
     Account SID: ACxxxxxxxxxxxxxxxx
     Auth Token: xxxxxxxxxxxxxxxxxx
     Phone Number: +1234567890
     ```
   - Keep this file secure (don't share publicly)

---

### STEP 4: Configure JokerVision with Twilio

1. **Add to Backend Environment**
   - Open a new terminal/console
   - SSH or access your backend server
   - Edit the `.env` file:
   
   ```bash
   nano /app/backend/.env
   ```

2. **Add These Lines** (at the end of file):
   ```env
   # Twilio SMS Configuration
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+12345678900
   ```
   - Replace with YOUR actual values
   - Save file: `Ctrl+O`, Enter, `Ctrl+X`

3. **Restart Backend**
   ```bash
   sudo supervisorctl restart backend
   ```
   
4. **Verify It Loaded**
   ```bash
   tail -f /var/log/supervisor/backend.err.log
   ```
   - Look for: "✅ Twilio configured" or similar message

---

### STEP 5: Test Twilio Integration

1. **Test from Twilio Console**
   - Go to: Console → Develop → Messaging → Try it out → Send an SMS
   - To: Your personal phone number
   - From: Your Twilio number
   - Body: "Test message from JokerVision"
   - Click "Make request"
   - You should receive the SMS!

2. **Add Verified Phone Numbers (Trial Account)**
   - Go to: Console → Develop → Phone Numbers → Manage → Verified Caller IDs
   - Click "Add a new Caller ID"
   - Enter your phone number (and any test numbers)
   - Verify with code
   - **IMPORTANT:** Trial accounts can only send to verified numbers!

3. **Test from JokerVision**
   - We'll test this after setup is complete

---

### STEP 6: Upgrade Options (When Ready)

**Free Trial Limitations:**
- Can only text verified numbers
- Messages show "Sent from your Twilio trial account"
- $15 credit (~500 messages)

**To Remove Limitations:**
1. Go to: Console → Billing
2. Click "Upgrade your account"
3. Add payment method
4. Minimum $20 initial purchase
5. Pay-as-you-go: ~$0.0075 per SMS

**Pricing:**
- SMS: $0.0075 per message (US)
- Voice: $0.0085 per minute
- Phone number: $1.15/month

---

## 2. FACEBOOK INTEGRATION SETUP (10 minutes)

### Why You Need This:
- Auto-post vehicles to Facebook Marketplace
- Auto-post to Facebook Groups
- Capture leads from Facebook messages

### Options Available:
- **Option A:** Chrome Extension (Easier, recommended)
- **Option B:** Facebook Developer App (Advanced, more powerful)

We'll do **Option A** for now.

---

### OPTION A: Chrome Extension Setup

### STEP 1: Install Chrome Extension

1. **Open Chrome Browser**
   - Make sure you're using Google Chrome (not Firefox, Safari, etc.)
   - Update to latest version if needed

2. **Enable Developer Mode**
   - Open Chrome
   - Go to: `chrome://extensions`
   - Top right corner: Toggle "Developer mode" ON (it will turn blue)

3. **Load Extension**
   - Click "Load unpacked" button (appears after enabling developer mode)
   - Navigate to: `/app/chrome-extension/` folder
   - Click "Select Folder"
   
   **If you can't access the folder:**
   ```bash
   # Download the extension folder to your local computer
   # From your server, run:
   cd /app/chrome-extension
   zip -r chrome-extension.zip .
   # Then download chrome-extension.zip to your computer
   # Unzip it and load that folder in Chrome
   ```

4. **Verify Installation**
   - You should see "JokerVision AutoFollow" in your extensions list
   - Make sure it's toggled ON (blue switch)
   - Pin it to toolbar (click the puzzle piece icon → pin)

---

### STEP 2: Configure Extension

1. **Click Extension Icon**
   - Find JokerVision icon in Chrome toolbar
   - Click it to open popup

2. **Enter Backend URL**
   ```
   Backend URL: https://autofollowpro.preview.emergentagent.com/api
   ```
   - Click "Save Settings"

3. **Log into Facebook**
   - Open new tab: https://www.facebook.com
   - Log in with your business account
   - Make sure you stay logged in

---

### STEP 3: Set Up Facebook Business Page (If needed)

1. **Create Business Page** (if you don't have one)
   - Go to: https://www.facebook.com/pages/create
   - Choose "Business or Brand"
   - Page name: Your dealership name
   - Category: "Automotive Dealership"
   - Click "Create Page"

2. **Add Information**
   - Address: Your dealership address
   - Phone: Your dealership phone
   - Hours: Business hours
   - Click "Save"

3. **Connect to Marketplace**
   - On your page, click "Sell" or "Marketplace"
   - Follow prompts to enable Marketplace selling
   - Accept terms and conditions

---

### STEP 4: Join Facebook Groups (Optional)

For auto-posting to groups:

1. **Find Relevant Groups**
   - Search Facebook for: "cars for sale [your city]"
   - Or: "car dealership [your city]"
   - Or: "buy sell trade cars [your city]"

2. **Join Groups**
   - Request to join (most auto-approve)
   - Read group rules about selling
   - Make note of group names

3. **Save Group Names**
   - You'll need these group names in JokerVision settings
   - Example: "Los Angeles Cars For Sale"

---

### OPTION B: Facebook Developer App (Advanced)

Only do this if Chrome Extension doesn't work for you.

### STEP 1: Create Facebook Developer Account

1. **Go to Facebook Developers**
   - URL: https://developers.facebook.com/
   - Click "Get Started" (top right)
   - Log in with your Facebook account

2. **Complete Registration**
   - Choose account type: "Business"
   - Fill in business details
   - Verify your email
   - Accept terms

---

### STEP 2: Create New App

1. **Create App**
   - Click "My Apps" → "Create App"
   - Choose "Business" type
   - App name: "JokerVision AutoFollow"
   - Contact email: Your email
   - Click "Create App"

2. **Complete Security Check**
   - May require CAPTCHA
   - Verify your identity if asked

3. **Note Your App ID**
   - You'll see "App ID" at top of page
   - Copy this: `_________________________`

---

### STEP 3: Add Facebook Login Product

1. **Add Product**
   - Dashboard → "Add Product"
   - Find "Facebook Login"
   - Click "Set Up"

2. **Choose Platform**
   - Select "Web"
   - Site URL: `https://autofollowpro.preview.emergentagent.com`
   - Click "Save"

3. **Configure Settings**
   - Go to: Facebook Login → Settings
   - Valid OAuth Redirect URIs:
     ```
     https://autofollowpro.preview.emergentagent.com/auth/facebook/callback
     ```
   - Click "Save Changes"

---

### STEP 4: Get Page Access Token

1. **Go to Graph API Explorer**
   - URL: https://developers.facebook.com/tools/explorer/
   
2. **Generate Token**
   - Select your app from dropdown
   - Click "Generate Access Token"
   - Grant permissions:
     - ✅ pages_manage_posts
     - ✅ pages_read_engagement
     - ✅ pages_manage_metadata
     - ✅ pages_show_list
   - Click "Generate"

3. **Get Long-Lived Token**
   - Copy the token shown
   - Go to: https://developers.facebook.com/tools/accesstoken/
   - Click "Extend Access Token"
   - Copy the new long-lived token
   - Save it: `_________________________`

---

### STEP 5: Add to JokerVision

Edit backend `.env`:
```env
# Facebook API Configuration
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_PAGE_ACCESS_TOKEN=your_long_lived_token_here
FACEBOOK_PAGE_ID=your_page_id_here
```

Restart backend:
```bash
sudo supervisorctl restart backend
```

---

## 3. CHROME EXTENSION INSTALLATION (5 minutes)

We covered this in Facebook setup, but here's the standalone guide:

### STEP 1: Download Extension Files

If you're on local computer and need to download:

```bash
# On server:
cd /app/chrome-extension
tar -czf chrome-extension.tar.gz .
# Download this file to your local computer
```

Or access directly from:
```
/app/chrome-extension/
```

Files should include:
- `manifest.json`
- `background.js`
- `content.js`
- `popup.html`
- `popup.js`
- `config.js`
- `styles.css`

---

### STEP 2: Load in Chrome

1. Open Chrome
2. Go to: `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select `/app/chrome-extension/` folder
6. Extension appears in list

---

### STEP 3: Configure Extension

1. **Click Extension Icon**
2. **Enter Settings:**
   ```
   Backend URL: https://autofollowpro.preview.emergentagent.com/api
   Tenant ID: default_dealership
   ```
3. **Click "Save"**
4. **Click "Test Connection"**
   - Should show: "✅ Connected"

---

### STEP 4: Grant Permissions

1. Chrome may ask for permissions:
   - ✅ Read and change data on facebook.com
   - ✅ Store data
   - ✅ Make network requests
2. Click "Allow" for all

---

## 4. OPENAI API KEY (Optional - 10 minutes)

**Note:** You're already using Emergent LLM key which works great! Only do this if you want to use your own OpenAI account.

### STEP 1: Create OpenAI Account

1. **Go to OpenAI**
   - URL: https://platform.openai.com/signup
   - Click "Sign up"
   
2. **Register**
   - Email: Your email
   - Password: Strong password
   - Verify email

3. **Add Payment Method**
   - Go to: Billing → Payment methods
   - Add credit/debit card
   - Set up auto-recharge: $10 minimum

---

### STEP 2: Create API Key

1. **Navigate to API Keys**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"

2. **Name Your Key**
   - Name: "JokerVision Production"
   - Click "Create"

3. **Copy Key**
   - **IMPORTANT:** Copy immediately - you won't see it again!
   - Format: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Save to file: `openai_key.txt`

---

### STEP 3: Add to JokerVision

Edit backend `.env`:
```env
# OpenAI Configuration (Optional - using this instead of Emergent LLM)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Restart backend:
```bash
sudo supervisorctl restart backend
```

---

### Cost Estimates:
- GPT-4: ~$0.01-0.03 per conversation
- Voice AI: ~$0.06 per minute
- Budget: $50-100/month for moderate use

---

## 5. SOCIAL MEDIA INTEGRATIONS (Optional)

### Instagram Business (15 minutes)

### STEP 1: Convert to Business Account

1. Open Instagram app on phone
2. Go to Profile → Menu (☰) → Settings
3. Account → Switch to Professional Account
4. Choose "Business"
5. Connect to Facebook Page

### STEP 2: Get Instagram Credentials

1. Go to Facebook Business Suite: https://business.facebook.com/
2. Settings → Instagram accounts
3. Connect your Instagram
4. Get Instagram Business Account ID

### STEP 3: Add to JokerVision

```env
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_id_here
INSTAGRAM_ACCESS_TOKEN=your_token_here
```

---

### Twitter/X API (20 minutes)

### STEP 1: Apply for Developer Account

1. Go to: https://developer.twitter.com/
2. Click "Apply for access"
3. Fill application:
   - Use case: "Marketing automation"
   - Description: "Automotive dealership social media posting"
4. Submit and wait (usually approved in 1-2 days)

### STEP 2: Create App

1. After approval, go to Developer Portal
2. Create new project
3. Create app within project
4. Note: API Key, API Secret, Bearer Token

### STEP 3: Add to JokerVision

```env
TWITTER_API_KEY=your_key_here
TWITTER_API_SECRET=your_secret_here
TWITTER_BEARER_TOKEN=your_token_here
```

---

### LinkedIn API (30 minutes)

### STEP 1: Create LinkedIn Company Page

1. Go to: https://www.linkedin.com/company/setup/new/
2. Fill company details
3. Verify company (may require business email)

### STEP 2: Create LinkedIn App

1. Go to: https://www.linkedin.com/developers/apps
2. Click "Create app"
3. Fill details:
   - App name: JokerVision
   - LinkedIn Page: Your company page
4. Submit for review

### STEP 3: Add to JokerVision

After approval:
```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_secret
```

---

## 6. TESTING ALL INTEGRATIONS

### Test Checklist

After completing all setups, verify everything:

### ✅ Twilio SMS Test

1. **Go to JokerVision**
2. Upload test CSV with YOUR phone number
3. Enable AI for that lead
4. Text yourself from another phone
5. Verify: AI responds (check AI Inbox first if testing with trial account)

**Expected Result:**
- You receive SMS from Twilio number
- AI responds intelligently using CRISP method

---

### ✅ Facebook Integration Test

1. **Go to Facebook Marketplace Auto Poster**
2. Select one test vehicle
3. Click "Post to Marketplace"
4. Check Facebook Marketplace - listing should appear

**Expected Result:**
- Vehicle appears on Marketplace
- Has photos, description, price
- If groups enabled, appears in groups too

---

### ✅ Chrome Extension Test

1. **Go to Facebook Messages** (with extension active)
2. Open a conversation
3. Extension should show "Capture Lead" button
4. Click it
5. Check All Leads Dashboard - lead should appear

**Expected Result:**
- Lead captured from Facebook
- Shows in dashboard with "Facebook Messenger" source
- Has contact info from Facebook profile

---

### ✅ Social Media Posting Test

1. **Go to Social Media Hub**
2. Create test post
3. Select Facebook, Instagram, Twitter
4. Schedule for immediate posting
5. Check each platform

**Expected Result:**
- Post appears on all selected platforms
- Images included
- Links working

---

## 🎯 FINAL CONFIGURATION FILE

After completing all setups, your `/app/backend/.env` should look like:

```env
# ============================================
# JOKERVISION AUTOFOLLOW - PRODUCTION CONFIG
# ============================================

# MongoDB
MONGO_URL=mongodb://localhost:27017/joker_vision_db

# Backend URL
REACT_APP_BACKEND_URL=https://autofollowpro.preview.emergentagent.com

# AI Configuration (Emergent LLM - Already configured)
EMERGENT_LLM_KEY=your_emergent_key_here

# Twilio SMS (PRIORITY 1)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+12345678900

# Facebook API (PRIORITY 2 - If using API method)
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_PAGE_ACCESS_TOKEN=your_token
FACEBOOK_PAGE_ID=your_page_id

# OpenAI (Optional - if not using Emergent LLM)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx

# Instagram (Optional)
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_id
INSTAGRAM_ACCESS_TOKEN=your_token

# Twitter (Optional)
TWITTER_API_KEY=your_key
TWITTER_API_SECRET=your_secret
TWITTER_BEARER_TOKEN=your_token

# LinkedIn (Optional)
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_secret

# Other Settings
TENANT_ID=default_dealership
ENVIRONMENT=production
DEBUG=false
```

---

## 🚨 TROUBLESHOOTING

### Twilio Issues

**Problem:** "SMS not sending"
- **Check:** Twilio account is verified
- **Check:** Phone numbers are verified (trial accounts)
- **Check:** Credentials in .env are correct
- **Check:** Backend restarted after adding credentials

**Problem:** "Authentication failed"
- **Check:** Account SID starts with "AC"
- **Check:** No extra spaces in .env file
- **Check:** Auth Token is correct (not API Key)

---

### Facebook Issues

**Problem:** "Extension not working"
- **Check:** Logged into Facebook in Chrome
- **Check:** Extension enabled in chrome://extensions
- **Check:** Backend URL in extension settings is correct

**Problem:** "Can't post to Marketplace"
- **Check:** Facebook Business Page exists
- **Check:** Marketplace enabled on page
- **Check:** Page has selling privileges
- **Check:** Not violating Facebook commerce policies

---

### General Issues

**Problem:** "Can't see changes"
- **Solution:** Restart backend: `sudo supervisorctl restart backend`
- **Solution:** Clear browser cache: Ctrl+Shift+R
- **Solution:** Check logs: `tail -f /var/log/supervisor/backend.err.log`

**Problem:** "API key not working"
- **Solution:** Check .env file has no extra quotes
- **Solution:** Verify key is active in provider dashboard
- **Solution:** Check for typos or missing characters

---

## ✅ COMPLETION CHECKLIST

Before testing with real leads:

### Minimum Required:
- [ ] Twilio account created
- [ ] Twilio credentials added to .env
- [ ] Backend restarted
- [ ] Test SMS sent successfully
- [ ] Chrome Extension installed
- [ ] Extension connected to backend
- [ ] Facebook account logged in
- [ ] Test vehicle posted to Marketplace

### Recommended:
- [ ] All verified phone numbers added to Twilio
- [ ] Facebook Business Page set up
- [ ] Facebook groups joined
- [ ] Test lead captured from Facebook
- [ ] AI SMS bot tested with your number
- [ ] Social media accounts connected

### Optional:
- [ ] OpenAI API key added (if not using Emergent LLM)
- [ ] Instagram connected
- [ ] Twitter connected
- [ ] LinkedIn connected
- [ ] Custom domain configured

---

## 🎉 YOU'RE READY!

Once you've completed the "Minimum Required" checklist, you're ready to start testing with real leads!

**Recommended First Test:**
1. Upload 3-5 test leads (including YOUR contact info)
2. Enable AI for all
3. Text yourself from another phone
4. Verify AI responds correctly
5. Check AI Inbox to see the conversation
6. If all good → upload your full lead database!

---

**Need Help?** 
- Check logs: `tail -f /var/log/supervisor/backend.err.log`
- Review documentation: `PRODUCTION_READY_GUIDE.md`
- Test each integration independently before combining

**Good luck with your testing!** 🚀
