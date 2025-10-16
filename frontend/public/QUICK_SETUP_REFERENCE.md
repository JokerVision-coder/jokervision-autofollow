# 🚀 Quick Setup Reference Card

## PRIORITY 1: TWILIO SMS (15 min) ⚡

### Sign Up:
```
🌐 https://www.twilio.com/try-twilio
📧 Use your business email
💳 Credit card needed (verification only)
💰 Get $15 free credit
```

### Get Credentials:
```
1. Console Dashboard: https://console.twilio.com
2. Copy Account SID (starts with AC...)
3. Copy Auth Token (click "Show")
4. Get phone number (click "Get a trial number")
```

### Add to JokerVision:
```bash
# Edit .env file
nano /app/backend/.env

# Add these lines:
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+12345678900

# Restart backend
sudo supervisorctl restart backend
```

### Verify Numbers (Trial Account):
```
Console → Phone Numbers → Verified Caller IDs
Add your phone number for testing
```

---

## PRIORITY 2: CHROME EXTENSION (5 min) 📱

### Install:
```
1. Open Chrome
2. Go to: chrome://extensions/
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select: /app/chrome-extension/
6. Done!
```

### Configure:
```
1. Click extension icon in toolbar
2. Backend URL: https://autofollowpro.preview.emergentagent.com/api
3. Tenant ID: default_dealership
4. Click "Save"
```

### Test:
```
1. Log into Facebook
2. Go to Marketplace or Messages
3. Extension icon should show active
4. Green checkmark = working!
```

---

## PRIORITY 3: FACEBOOK SETUP (10 min) 📘

### Requirements:
- Facebook Business Page (create if needed)
- Chrome Extension installed
- Logged into Facebook

### Create Business Page (if needed):
```
🌐 https://www.facebook.com/pages/create
📝 Choose: Business or Brand
📍 Category: Automotive Dealership
✅ Enable Marketplace selling
```

### Enable Marketplace:
```
1. Go to your Business Page
2. Click "Sell" or "Marketplace"
3. Accept terms
4. Add payment method (if required)
```

### Join Groups (optional):
```
Search: "cars for sale [your city]"
Join 3-5 active groups
Note group names for posting settings
```

---

## TESTING SEQUENCE 🧪

### Test 1: Twilio SMS
```
1. Go to JokerVision → Marketing → Bulk Upload
2. Upload CSV with YOUR phone number
3. Go to All Leads → Filter by "Mass Marketing Import"
4. Click "Enable AI for Mass Marketing Import"
5. Text your lead's number (your number) from another phone
6. Check AI Inbox to see response
7. If trial: response won't send until phone verified
```

### Test 2: Facebook Extension
```
1. Log into Facebook (Chrome with extension)
2. Go to Facebook Marketplace
3. Browse some vehicles
4. Check extension icon - should show capture count
5. Go to JokerVision → All Leads
6. Look for leads with "Facebook Messenger" badge
```

### Test 3: Facebook Auto-Post
```
1. Go to JokerVision → Facebook Marketplace
2. Inventory Manager tab
3. Select 1 test vehicle
4. Click "Post to Marketplace"
5. Check Facebook Marketplace
6. Listing should appear within 2-3 minutes
```

---

## CREDENTIALS TEMPLATE 📝

Copy this and fill in as you go:

```
===========================================
JOKERVISION CREDENTIALS
===========================================

TWILIO:
- Account SID: AC_____________________________
- Auth Token: _________________________________
- Phone Number: +1____________________________
- Status: [ ] Active / [ ] Pending

FACEBOOK:
- Business Page: ______________________________
- Page ID: ____________________________________
- Extension Status: [ ] Installed / [ ] Not installed
- Groups Joined: ______________________________

OPENAI (Optional):
- API Key: sk-_________________________________
- Status: [ ] Active / [ ] Using Emergent LLM

BACKEND:
- URL: https://autofollowpro.preview.emergentagent.com
- Status: [ ] Running / [ ] Needs restart
- Last Updated: ___/___/___

TESTING:
- Test Phone Number: +1________________________
- Test Lead Email: _____________________________
- Last Successful Test: ___/___/___

===========================================
```

---

## COMMON COMMANDS 💻

### Check Backend Status:
```bash
sudo supervisorctl status backend
```

### Restart Backend:
```bash
sudo supervisorctl restart backend
```

### View Logs:
```bash
tail -f /var/log/supervisor/backend.err.log
```

### Edit Environment:
```bash
nano /app/backend/.env
```

### Test Backend Endpoint:
```bash
curl https://autofollowpro.preview.emergentagent.com/api/health
```

---

## COST BREAKDOWN 💰

### Twilio (SMS):
```
📊 Free Trial: $15 credit (~500 SMS)
💵 After trial: $0.0075 per SMS
📱 Phone number: $1.15/month
💡 Estimate: $50-100/month for 1000+ leads
```

### Facebook:
```
✅ Business Page: FREE
✅ Marketplace: FREE
✅ Group posting: FREE
✅ Chrome Extension: FREE
💡 Total Cost: $0/month
```

### OpenAI (if used):
```
💬 GPT-4 Turbo: ~$0.01 per conversation
🎤 Voice AI: ~$0.06 per minute
💡 Estimate: $50-200/month depending on usage
```

### Total Monthly Cost:
```
Minimum: $50-100 (Twilio only)
Recommended: $100-200 (Twilio + voice)
Maximum: $200-400 (all features, high volume)
```

---

## TROUBLESHOOTING QUICK FIXES 🔧

### "SMS not sending"
```bash
# Check credentials
cat /app/backend/.env | grep TWILIO
# Restart backend
sudo supervisorctl restart backend
# Check logs
tail -n 50 /var/log/supervisor/backend.err.log
```

### "Extension not working"
```
1. chrome://extensions/ → check enabled
2. Click extension → verify backend URL
3. Log out & back into Facebook
4. Try incognito mode
```

### "Can't post to Facebook"
```
1. Check Facebook Page exists
2. Verify Marketplace enabled
3. Check internet connection
4. Try manual post first
5. Review Facebook commerce policies
```

### "Backend won't start"
```bash
# Check for errors
tail -n 100 /var/log/supervisor/backend.err.log
# Check .env syntax (no extra quotes)
nano /app/backend/.env
# Force restart
sudo supervisorctl restart all
```

---

## SUPPORT RESOURCES 📚

### Documentation:
- `EXTERNAL_SETUP_COMPLETE_GUIDE.md` - Full setup guide
- `PRODUCTION_READY_GUIDE.md` - Testing guide
- `API_CREDENTIALS_SETUP.md` - API key details

### External Help:
- Twilio Docs: https://www.twilio.com/docs
- Facebook Dev: https://developers.facebook.com/docs
- Chrome Extensions: https://developer.chrome.com/docs/extensions

### Logs & Debugging:
```bash
# Backend logs
tail -f /var/log/supervisor/backend.err.log

# Frontend logs  
# Open browser console (F12)

# Check services
sudo supervisorctl status
```

---

## NEXT STEPS AFTER SETUP ✅

1. ✅ Complete Twilio setup (15 min)
2. ✅ Install Chrome Extension (5 min)
3. ✅ Set up Facebook (10 min)
4. ✅ Test each integration independently
5. ✅ Upload 3-5 test leads with YOUR contact info
6. ✅ Enable AI for test leads
7. ✅ Test SMS bot with your phone
8. ✅ Test Facebook auto-post with 1 vehicle
9. ✅ Review AI responses in AI Inbox
10. ✅ Scale up to full lead database

---

## EMERGENCY CONTACTS 🆘

If something breaks:

```
1. Check logs first (see commands above)
2. Restart backend
3. Clear browser cache
4. Check external service status pages:
   - Twilio: https://status.twilio.com
   - Facebook: https://developers.facebook.com/status
5. Review setup guide
6. Test in isolation (one service at a time)
```

---

**Print this page and keep it handy during setup!** 📄

**Estimated Total Setup Time: 30-45 minutes**

**Required: Credit card, Business email, Phone number**

**Go to: `EXTERNAL_SETUP_COMPLETE_GUIDE.md` for detailed steps**
