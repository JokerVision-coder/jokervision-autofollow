# Facebook Marketplace Auto Poster - Complete Testing Guide

## Overview
JokerVision's Facebook Marketplace Auto Poster enables automated inventory posting to Facebook Marketplace with AI-powered optimization, competitor analysis, and CRISP-aligned messaging.

---

## 🚀 System Status

### Web Application
- ✅ **URL**: https://autoleads-engine.preview.emergentagent.com/facebook-marketplace
- ✅ **Features Active**:
  - Dashboard with real-time stats
  - Inventory Manager (67 mock vehicles)
  - Posting Queue management
  - AI Settings configuration
  - Competitor comparison (12.7x more posts)

### Chrome Extension
- ✅ **Version**: 2.0.0 (Manifest V3)
- ✅ **Name**: JokerVision AutoDealer Pro - Facebook Marketplace AI
- ✅ **Location**: `/app/chrome-extension/`
- ✅ **Status**: Ready for installation

---

## 📦 Chrome Extension Setup

### Step 1: Load Extension in Chrome

1. **Open Chrome Extensions Page**:
   - Navigate to `chrome://extensions/`
   - Or: Menu → Extensions → Manage Extensions

2. **Enable Developer Mode**:
   - Toggle "Developer mode" switch in top-right corner

3. **Load Unpacked Extension**:
   - Click "Load unpacked" button
   - Navigate to: `/app/chrome-extension/`
   - Click "Select Folder"

4. **Verify Installation**:
   - Extension icon should appear in toolbar
   - Name: "JokerVision AutoDealer Pro"
   - Version: 2.0.0

### Step 2: Configure Extension

The extension automatically connects to:
- **API Base URL**: `https://autoleads-engine.preview.emergentagent.com/api`
- **Website URL**: `https://autoleads-engine.preview.emergentagent.com`

Configuration is handled by `/app/chrome-extension/config.js`

---

## 🧪 Testing Workflow

### Test 1: Web Application Dashboard

1. **Navigate to**: https://autoleads-engine.preview.emergentagent.com/facebook-marketplace

2. **Verify Dashboard Tab**:
   - ✅ Stats showing: Posts Today (67), Views (3,420), Inquiries (89)
   - ✅ AI Success Rate: 94.2%
   - ✅ Competitor comparison: "12.7x MORE POSTS than competitors"
   - ✅ Performance chart visible
   - ✅ AI Rep assignments visible

3. **Check Tabs**:
   - ✅ Dashboard
   - ✅ Inventory Manager
   - ✅ Posting Queue
   - ✅ AI Settings

### Test 2: Inventory Manager

1. **Click "Inventory Manager" tab**

2. **Verify Features**:
   - ✅ 67 vehicles displayed in cards
   - ✅ Vehicle details: Make, model, year, price, mileage, VIN
   - ✅ Hover effect on cards
   - ✅ Smooth animations

3. **Test Actions**:
   - View vehicle details
   - Check posting status
   - Verify images load

### Test 3: Posting Queue

1. **Click "Posting Queue" tab**

2. **Verify**:
   - ✅ Scheduled posts listed
   - ✅ Post time and vehicle details
   - ✅ Status indicators
   - ✅ Action buttons (Edit, Delete, Post Now)

### Test 4: AI Settings

1. **Click "AI Settings" tab**

2. **Configure**:
   - ✅ Toggle switches for each AI feature
   - ✅ Auto-Post Scheduling
   - ✅ AI Description Enhancement
   - ✅ SEO Optimization
   - ✅ Price Analysis
   - ✅ Photo Enhancement
   - ✅ Competitor Monitoring
   - ✅ Lead Response
   - ✅ Performance Analytics

3. **Save Settings**:
   - Click any toggle to test state change
   - Verify settings persist

### Test 5: Chrome Extension - Basic Functionality

1. **Navigate to Facebook Marketplace**:
   - Go to: https://www.facebook.com/marketplace

2. **Click Extension Icon** in toolbar:
   - Popup should open
   - Shows JokerVision branding
   - Connection status visible

3. **Check Extension Features**:
   - ✅ Connected to backend
   - ✅ Inventory sync status
   - ✅ Quick post button
   - ✅ Settings access

### Test 6: Extension Content Script

1. **On Facebook Marketplace page**:
   - Extension injects custom elements
   - JokerVision branding may appear
   - Enhanced UI elements added

2. **Check Console** (F12):
   - Look for: "JokerVision AutoDealer Pro: Background service worker initialized"
   - No errors should appear

3. **Test Context Menu**:
   - Right-click on marketplace page
   - Should see JokerVision options (if implemented)

### Test 7: Background Sync

1. **Extension should automatically**:
   - Sync inventory every 15 minutes
   - Monitor competitor posts
   - Update stats in real-time

2. **Check Background Activity**:
   - Open `chrome://extensions/`
   - Click "Service worker" under extension
   - Console shows sync activity

### Test 8: Appointment Scheduling Integration

1. **When lead inquires on Facebook**:
   - Extension detects message
   - Suggests CRISP-aligned responses
   - Offers appointment booking

2. **Book Appointment**:
   - Click appointment button
   - Fill time slot
   - Syncs with main app calendar

---

## 🔧 Configuration Files

### Chrome Extension Config
**File**: `/app/chrome-extension/config.js`

```javascript
development: {
  apiBaseUrl: 'https://autoleads-engine.preview.emergentagent.com/api',
  websiteUrl: 'https://autoleads-engine.preview.emergentagent.com'
}
```

### Extension Permissions
**File**: `/app/chrome-extension/manifest.json`

Key permissions:
- `activeTab` - Access current tab
- `storage` - Save settings
- `scripting` - Inject scripts
- `notifications` - Push notifications
- `alarms` - Scheduled tasks

Host permissions:
- `https://www.facebook.com/*`
- `https://marketplace.facebook.com/*`
- `https://autoleads-engine.preview.emergentagent.com/*`

---

## 📡 Backend API Endpoints

### Facebook Integration APIs

1. **Get Inventory**
   - `GET /api/facebook/inventory`
   - Returns: List of vehicles for posting

2. **Create Post**
   - `POST /api/facebook/create-post`
   - Body: `{ vehicle_id, description, price, photos }`

3. **Get Posting Queue**
   - `GET /api/facebook/queue`
   - Returns: Scheduled posts

4. **Get AI Settings**
   - `GET /api/facebook/settings`
   - Returns: Current AI configuration

5. **Update AI Settings**
   - `PUT /api/facebook/settings`
   - Body: `{ setting_key, value }`

---

## 🎯 CRISP Integration

The Facebook Auto Poster integrates CRISP sales methodology:

### Automated Responses Use CRISP:

**Transition/Disrupt/Ask**:
```
"That makes sense! This 2024 Camry won't last long - 
already have 2 appointments scheduled. 
Can you come today at 3pm or tomorrow at 10am?"
```

**Urgency + Specific Times**:
```
"Just had another serious inquiry 30 minutes ago. 
I have availability today at 2pm or 5pm. 
Which works better for you?"
```

**Value + CTA**:
```
"This vehicle is priced $2,000 below market value. 
Free test drive takes 15 minutes. 
Available today 1-5pm. What time works?"
```

---

## 🐛 Troubleshooting

### Extension Not Loading
1. Check Developer Mode is enabled
2. Verify all files present in `/app/chrome-extension/`
3. Check console for errors: `chrome://extensions/` → Service worker

### Cannot Connect to Backend
1. Verify API URL in `config.js`
2. Check backend is running: `sudo supervisorctl status backend`
3. Test API manually: `curl https://autoleads-engine.preview.emergentagent.com/api/health`

### Posts Not Appearing on Facebook
1. Facebook API requires authentication (not yet implemented)
2. Currently uses mock data for testing
3. Production requires Facebook Business account setup

### Extension Console Errors
1. Open `chrome://extensions/`
2. Click "Service worker" under extension
3. Check console messages
4. Common issue: CORS errors (expected without FB auth)

---

## 📊 Expected Test Results

### Dashboard Metrics:
- ✅ Posts Today: 67
- ✅ Total Views: 3,420
- ✅ Inquiries: 89
- ✅ AI Success Rate: 94.2%

### Inventory:
- ✅ 67 vehicles loaded
- ✅ Mix of Toyota, Honda, Ford, Chevrolet, Nissan
- ✅ Prices: $12,995 - $67,995
- ✅ All have VIN numbers

### AI Features:
- ✅ 8 AI settings toggleable
- ✅ All start enabled
- ✅ Settings save on change

---

## 🚀 Production Deployment

### Requirements for Live Facebook Posting:

1. **Facebook Business Account**:
   - Create Business Manager account
   - Add dealership page
   - Enable Marketplace access

2. **Facebook API Access**:
   - Apply for Marketplace API access
   - Get App ID and App Secret
   - Configure OAuth flow

3. **Backend Configuration**:
   - Add Facebook credentials to `.env`
   - Implement OAuth callback
   - Test with Facebook Graph API

4. **Chrome Extension Publication**:
   - Package extension for Chrome Web Store
   - Submit for review
   - Provide privacy policy
   - Wait for approval (5-7 days)

---

## 🎓 User Training

### For Sales Reps:

1. **Install Extension** (one-time):
   - Follow installation steps above
   - Grant permissions when prompted

2. **Daily Usage**:
   - Extension auto-syncs inventory
   - Notifies when new leads inquire
   - Suggests CRISP-aligned responses

3. **Manual Posting**:
   - Click extension icon
   - Select vehicle to post
   - AI generates optimized description
   - Click "Post to Marketplace"

4. **Respond to Leads**:
   - Extension highlights new messages
   - Click to see suggested response
   - Edit if needed
   - Send with one click

---

## 📝 Testing Checklist

Before production:
- [ ] Extension loads without errors
- [ ] Dashboard displays all metrics
- [ ] Inventory syncs correctly
- [ ] AI settings save properly
- [ ] Queue shows scheduled posts
- [ ] Extension icon works
- [ ] Popup displays correctly
- [ ] No console errors
- [ ] Background service worker active
- [ ] CORS headers configured
- [ ] API endpoints respond
- [ ] Authentication works (when implemented)

---

## 🔐 Security Notes

1. **API Keys**: Never commit Facebook credentials to git
2. **CORS**: Backend configured for `autoleads-engine.preview.emergentagent.com`
3. **Permissions**: Extension requests minimum necessary permissions
4. **Data Storage**: Local storage only, no external tracking
5. **HTTPS**: All communication encrypted

---

## 📞 Support

For issues during testing:
1. Check console logs (F12)
2. Verify backend status
3. Test API endpoints manually
4. Review error messages
5. Check network tab for failed requests

---

## ✅ Current Status: READY FOR TESTING

- ✅ Web application functional
- ✅ Chrome extension ready
- ✅ Mock data populated
- ✅ UI/UX complete
- ✅ CRISP integration active
- ⏳ Facebook API integration pending (requires FB Business approval)

**You can now begin testing the system!**

Start with Test 1 (Web Dashboard) and progress through all test scenarios.
