# 🚀 JokerVision Chrome Extension - Complete User Guide

## 📋 Table of Contents
1. [Installation](#installation)
2. [Facebook Marketplace Upload](#facebook-marketplace-upload)
3. [Inventory Management](#inventory-management)
4. [AI SEO Tools](#ai-seo-tools)
5. [Automation Features](#automation-features)
6. [Analytics Dashboard](#analytics-dashboard)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Installation

1. Download the extension ZIP file
2. Extract to a permanent location (DO NOT DELETE)
3. Open Chrome → `chrome://extensions/`
4. Enable "Developer mode" (top-right toggle)
5. Click "Load unpacked"
6. Select the `chrome-extension` folder
7. Extension should load with NO errors

---

## 📤 Facebook Marketplace Upload

### How It Works:

**Step 1: Scrape Vehicles**
1. Go to any of these sites:
   - Cars.com (dealer inventory page)
   - AutoTrader (dealer inventory page)
   - CarGurus (dealer page like: `/Cars/m-Dealer-Name-sp123456`)
2. Click the extension icon
3. Go to **📦 Inventory** tab
4. Click **"Bulk Upload"** button
5. Extension scrapes all vehicles on the page

**Step 2: Upload to Backend**
- Vehicles are sent to JokerVision backend
- Stored in `scraped_inventory` collection
- Queued in `facebook_posting_queue` collection

**Step 3: Facebook Posting (Configuration Required)**

⚠️ **IMPORTANT:** To actually post to Facebook Marketplace, you need:

**Prerequisites:**
1. **Facebook Business Account** - Create at business.facebook.com
2. **Facebook Page** - Your dealership page
3. **Marketplace Access** - Request access from Facebook
4. **Facebook App** - Create at developers.facebook.com
5. **API Access Tokens** - OAuth tokens for posting

**Configuration Steps:**
1. Create Facebook App at developers.facebook.com
2. Add "Marketplace API" permission
3. Get Page Access Token (long-lived)
4. Add token to backend `.env`:
   ```
   FACEBOOK_PAGE_ACCESS_TOKEN=your_token_here
   FACEBOOK_PAGE_ID=your_page_id_here
   ```
5. Backend will automatically post queued vehicles

**Current Status:**
- ✅ Scraping works
- ✅ Backend queuing works
- ⚠️ Facebook posting requires API setup (above)

---

## 📦 Inventory Management Tab

### Features:

**1. Sync Inventory**
- Syncs with your main JokerVision inventory
- Updates vehicle count
- Shows last sync time
- **How to use:** Click "🔄 Sync Inventory" button

**2. Bulk Upload**
- Scrapes vehicles from dealer websites
- Extracts: make, model, year, price, mileage, images, VIN
- Uploads to backend
- Queues for Facebook
- **How to use:** 
  1. Navigate to dealer inventory page
  2. Click "Bulk Upload"
  3. Wait for success message

**3. AI Pricing**
- Analyzes competitor pricing
- Suggests optimal prices
- **Status:** Placeholder - requires pricing algorithm integration

**4. Photo AI**
- Enhances vehicle photos
- Removes backgrounds
- Improves lighting
- **Status:** Placeholder - requires image processing API

**5. Spy Mode**
- Analyzes competitor listings
- Tracks their pricing changes
- Monitors their inventory
- **Status:** Placeholder - requires competitor tracking system

**6. Vehicle Queue**
- Shows pending uploads
- Displays processing status
- **Status:** Static demo data - needs backend integration

---

## 🔍 AI SEO Tools Tab

### Features:

**1. SEO Score (94%)**
- Shows listing optimization score
- Based on: keywords, description quality, image count
- **Status:** Static demo - needs SEO scoring algorithm

**2. Visibility Metrics (2.3x)**
- Tracks how often your listings appear in searches
- Compared to average
- **Status:** Static demo - needs search tracking

**3. Click Rate (68%)**
- Percentage of people who click your listings
- Industry benchmark comparison
- **Status:** Static demo - needs analytics integration

**4. Smart Descriptions Generator**
- Uses AI to write compelling vehicle descriptions
- SEO-optimized content
- **How to use:** Click "Generate" button
- **Status:** Placeholder - requires OpenAI/LLM integration

**Implementation Required:**
```javascript
// Example implementation needed
async function generateSEODescriptions() {
    const vehicles = await getSelectedVehicles();
    const response = await fetch(`${API_URL}/ai/generate-descriptions`, {
        method: 'POST',
        body: JSON.stringify({ vehicles })
    });
    const descriptions = await response.json();
    // Apply descriptions to listings
}
```

**5. Keyword Optimization**
- Finds high-converting keywords
- Analyzes search trends
- Suggests keyword placement
- **Status:** Placeholder - requires keyword research API

**6. A/B Testing**
- Tests different title variations
- Tests different descriptions
- Tracks which performs better
- **Status:** Placeholder - requires testing framework

**7. Performance Keywords**
- Shows top-performing keywords with color coding:
  - 🟢 **High** (green) - Strong performers
  - 🟡 **Medium** (yellow) - Moderate performers  
  - 🔴 **Low** (red) - Weak performers
- **Status:** Static demo tags

---

## ⚡ Automation Tab

### Features:

**1. Auto-Posting Toggle**
- Enables/disables automatic posting
- **How to use:** Click the toggle switch
- **What it does:** Tells backend to auto-post scraped vehicles
- **Status:** ✅ Working - saves preference

**2. Smart Scheduling**
- **Options:**
  - Immediate - Post right away
  - Every Hour - Hourly posting
  - Daily - Once per day
  - AI Optimal Times - Posts when most buyers are online
- **How to use:** Select from dropdown
- **Status:** UI works - backend scheduling needs cron jobs

**3. Daily Limit**
- Controls max posts per day
- Prevents flooding
- **How to use:** Set number (1-50)
- **Status:** UI works - backend enforcement needed

**4. Response Templates**
- Pre-written responses for common inquiries
- **Templates:**
  - Initial Inquiry - First contact response
  - Price Question - Pricing discussions
  - Appointment Request - Scheduling responses

**How to Use Response Templates:**
- Click "Edit" button next to template
- **Current Status:** Button shows message but doesn't open editor
- **Implementation Needed:** Template editor modal

**To Make Templates Work:**

You need to add this to your backend:

```python
# backend/server.py
@api_router.post("/templates/save")
async def save_template(template: dict):
    template_id = template.get('id')
    content = template.get('content')
    
    await db.response_templates.update_one(
        {"id": template_id},
        {"$set": {"content": content, "updated_at": datetime.now()}},
        upsert=True
    )
    return {"status": "success"}

@api_router.get("/templates")
async def get_templates():
    templates = await db.response_templates.find().to_list(length=100)
    return {"templates": templates}
```

---

## 📊 Analytics Tab

### Features:

**1. Performance Overview Cards**
- **Listings (247)** - Active listing count, +12% growth
- **Views (15.2K)** - Monthly view count, +28% growth
- **Inquiries (89)** - Weekly inquiry count, +45% growth
- **Conversion (5.8%)** - View-to-inquiry rate, +8% improvement

**Status:** Static demo numbers

**To Make It Real:**
- Connect to Google Analytics
- Track Facebook Marketplace views
- Track email/SMS inquiries
- Calculate conversion rates

**2. Top Performers**
- Shows best-selling vehicles
- Displays view count and inquiry count
- Shows performance score (1-10)
- **Status:** Static demo data

**Implementation Needed:**
```python
# backend/server.py
@api_router.get("/analytics/top-performers")
async def get_top_performers():
    # Query vehicles with most views/inquiries
    top_vehicles = await db.leads.aggregate([
        {"$group": {"_id": "$vehicle", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]).to_list(length=5)
    return {"vehicles": top_vehicles}
```

**3. Competitive Analysis**
- Market Position - #3 in area
- Price Competitiveness - 85% (Very Good)
- Response Time - 92% (Excellent)
- **Status:** Static demo metrics

---

## 🎯 Complete Workflow Example

### Scenario: Upload 50 Vehicles to Facebook Marketplace

**Step 1: Find Inventory**
1. Go to your dealership page on Cars.com or AutoTrader
2. Example: `https://www.cars.com/dealers/12345/`

**Step 2: Scrape**
1. Click JokerVision extension icon
2. Go to Inventory tab
3. Click "Bulk Upload"
4. Wait for "✅ 50 vehicles uploaded!"

**Step 3: Verify**
1. Check console (⌘ + Option + I)
2. Should see: "Upload success: {batch_id: '...', vehicle_count: 50}"
3. Go to your JokerVision dashboard
4. Check backend logs: `tail -f /var/log/supervisor/backend.*.log`

**Step 4: Configure Facebook (One-Time)**
1. Get Facebook Page Access Token
2. Add to backend `.env`
3. Restart backend: `sudo supervisorctl restart backend`

**Step 5: Post to Facebook**
- Backend automatically processes queue
- Posts 1 vehicle every few minutes (to avoid rate limits)
- Check Facebook Page → Marketplace to see listings

---

## 🔧 Troubleshooting

### Extension Won't Load
- Check Console for errors
- Make sure all files extracted
- Try reloading extension

### Scraping Returns 0 Vehicles
- Make sure you're on an inventory page (not homepage)
- Reload the page (⌘ + R)
- Check Console for "CarGurus: Found X listings"

### Upload Failed
- Check backend is running: `sudo supervisorctl status backend`
- Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
- Verify API URL in extension matches backend

### Features Not Working
- Some features are placeholders (marked above)
- Require additional implementation
- Backend API endpoints needed

---

## 📞 Support

For issues or questions:
1. Check Console logs (⌘ + Option + I)
2. Check backend logs
3. Review this guide
4. Contact support with:
   - What you were trying to do
   - Error messages from Console
   - Screenshots

---

**Last Updated:** October 17, 2025
**Version:** 2.0.0 (Premium Full-Featured)
