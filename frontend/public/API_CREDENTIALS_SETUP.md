# 🔐 API Credentials Setup Guide

## Required API Keys for Full Functionality

### ✅ ALREADY CONFIGURED

#### 1. **AI Communication (Text & Voice)**
```
Service: Emergent LLM + OpenAI Realtime Voice
Status: ✅ Active
Purpose: AI SMS bot and Voice AI
Configuration: Already in backend/.env
```

---

### ⚠️ REQUIRES SETUP FOR REAL USAGE

#### 2. **Twilio (SMS Sending)**
**Why needed:** To send real SMS messages to leads

**Where to get:**
1. Go to https://www.twilio.com/
2. Sign up for free trial ($15 credit)
3. Get your credentials:
   - Account SID
   - Auth Token
   - Phone Number

**How to add:**
1. Open JokerVision
2. Go to Settings → Integrations
3. Find "Twilio SMS" section
4. Enter:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```
5. Click "Save & Test"

**Testing:**
- Free trial allows 500 messages
- Works with verified numbers only initially
- Upgrade account to remove restrictions

---

#### 3. **Facebook Integration**
**Why needed:** For Facebook Marketplace auto-posting and lead capture

**Two Options:**

##### Option A: Chrome Extension (Recommended)
1. Go to `/chrome-extension/` folder
2. Load extension in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `/chrome-extension/` folder
3. Extension will use your logged-in Facebook session
4. No API keys needed!

##### Option B: Facebook App (Advanced)
1. Go to https://developers.facebook.com/
2. Create new app
3. Add "Facebook Login" product
4. Get credentials:
   - App ID
   - App Secret
   - Page Access Token (from Graph API Explorer)

**How to add (Option B):**
```
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_PAGE_ACCESS_TOKEN=your_token
```

---

#### 4. **OpenAI Voice API (Optional - Already Configured)**
**Status:** ✅ Using Emergent LLM Key
**Note:** If you want to use your own OpenAI key instead:

**Where to get:**
1. Go to https://platform.openai.com/
2. Create API key
3. Add to backend/.env:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

**Cost:** ~$0.06 per minute of voice call

---

### 🆓 OPTIONAL INTEGRATIONS

#### 5. **Social Media Platforms**

##### Instagram Business
- Requires Facebook Business account
- Use Facebook Graph API token
- Free to set up

##### Twitter/X API
- Apply at https://developer.twitter.com/
- Free tier: 1,500 tweets/month
- Requires app approval (~1-2 days)

##### LinkedIn API
- Apply at https://www.linkedin.com/developers/
- Requires company page
- Free for basic posting

---

## 🚀 Quick Start (Minimum Required)

To test with real leads, you ONLY need:

### Minimum Setup:
1. ✅ **AI Communication** - Already working!
2. ⚠️ **Twilio SMS** - Get free trial account
3. ⚠️ **Facebook Chrome Extension** - Load in browser

### Time Required:
- Twilio setup: 5 minutes
- Chrome Extension: 2 minutes
- **Total: 7 minutes to be fully operational!**

---

## 💡 Testing Without API Keys

You can test the system without real API keys:

### What Works Without Keys:
- ✅ CSV lead upload
- ✅ Lead management dashboard
- ✅ AI enablement (settings saved)
- ✅ Lead tracking and analytics
- ✅ UI/UX testing
- ✅ Workflow automation setup

### What Needs Keys:
- ❌ Actual SMS sending (will see in AI Inbox what would be sent)
- ❌ Real voice calls (can test with mock numbers)
- ❌ Facebook auto-posting (use manual posting first)

---

## 📝 Credentials Checklist

### Before Going Live:
- [ ] Twilio Account SID added
- [ ] Twilio Auth Token added
- [ ] Twilio Phone Number added
- [ ] Facebook Chrome Extension installed
- [ ] Test SMS sent successfully
- [ ] Test voice call completed
- [ ] Facebook auto-post tested
- [ ] AI responses verified

### Optional but Recommended:
- [ ] Instagram connected
- [ ] Twitter connected
- [ ] LinkedIn connected
- [ ] Custom domain configured
- [ ] Email notifications set up

---

## 🆘 Getting Help

### Twilio Support:
- Free trial: https://www.twilio.com/console
- Docs: https://www.twilio.com/docs/sms/quickstart
- Support: https://support.twilio.com/

### Facebook Developer:
- Help Center: https://developers.facebook.com/support/
- Graph API Explorer: https://developers.facebook.com/tools/explorer/
- Community: https://stackoverflow.com/questions/tagged/facebook-graph-api

### JokerVision Support:
- Check logs: `/var/log/supervisor/backend.err.log`
- Test endpoints: See `PRODUCTION_READY_GUIDE.md`
- Documentation: All `.md` files in root folder

---

## 🎯 Priority Setup Order

1. **Week 1:** Get Twilio working (SMS only)
2. **Week 2:** Add Facebook integration
3. **Week 3:** Enable voice AI
4. **Week 4:** Add social media platforms

**Start small, test thoroughly, then scale up!**

---

**Pro Tip:** Use Twilio's free trial to test with 5-10 leads first before upgrading to paid plan. This ensures everything works before investing in credits.
