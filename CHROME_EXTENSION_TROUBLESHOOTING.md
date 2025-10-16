# 🔧 Chrome Extension - Troubleshooting Checklist

## ✅ What I Fixed (Version 2.0.2)

### **Fix #1: Removed Invalid Permissions**
❌ Removed: `"background"`, `"webRequest"`, `"identity"`
✅ These are not valid in Manifest V3

### **Fix #2: Removed Non-Existent File References**
❌ Removed: `"ai-optimizer.js"`, `"marketplace-injector.js"`
✅ These files don't exist in the extension folder

### **Current Manifest Status:**
✅ All permissions are valid for Manifest V3
✅ All referenced files exist
✅ JSON syntax is valid
✅ All icons are present

---

## 📋 Installation Checklist

Please follow these steps **exactly** to ensure successful installation:

### **Step 1: Clean Up Old Versions**
```
1. Go to chrome://extensions/
2. Find any "JokerVision" extensions
3. Click "Remove" on each one
4. Delete any old chrome-extension folders from your computer
```

### **Step 2: Download Fresh Copy**
```
1. Go to: https://autofollowpro.preview.emergentagent.com/JokerVision-Chrome-Extension.zip
2. Save to Downloads folder
3. If you downloaded before, make sure you're getting the NEW version
   (Check file timestamp - should be Oct 16, 2025 4:43 PM or later)
```

### **Step 3: Extract the ZIP**
```
1. Double-click the ZIP file (Mac)
2. You should get a folder called "chrome-extension"
3. Move this folder somewhere permanent (Desktop or Documents)
4. DO NOT DELETE THIS FOLDER after installation
```

### **Step 4: Verify Extracted Files**
```
Check that the chrome-extension folder contains:
✅ manifest.json
✅ background.js
✅ content.js
✅ popup.html
✅ popup.js
✅ popup.css
✅ config.js
✅ injection.js
✅ styles.css
✅ appointment-popup.html
✅ icons folder (with icon16.png, icon32.png, icon48.png, icon128.png)
✅ INSTALLATION.txt
```

### **Step 5: Load in Chrome**
```
1. Open Chrome
2. Type in address bar: chrome://extensions/
3. Toggle "Developer mode" ON (top-right corner)
4. Click "Load unpacked"
5. Navigate to and SELECT the "chrome-extension" folder
   (NOT a ZIP file, not individual files - the FOLDER itself)
6. Click "Select" or "Open"
```

### **Step 6: Verify Installation**
```
✅ Extension appears in the list
✅ NO red error text
✅ NO yellow warning icons
✅ Toggle switch is BLUE (enabled)
✅ Version shows "2.0.0"
```

---

## 🚨 If You Still See Errors

### **Get the Exact Error Message**
1. Look at the extension card in chrome://extensions/
2. Read the EXACT error message
3. Take a screenshot if possible

### **Common Errors and Solutions**

#### **Error: "Manifest file is missing or unreadable"**
- **Cause**: Wrong folder selected
- **Fix**: Make sure you select the `chrome-extension` FOLDER, not a file inside it

#### **Error: "Required value 'manifest_version' is missing"**
- **Cause**: Corrupted extraction or wrong folder
- **Fix**: Re-extract the ZIP file and try again

#### **Error: "Manifest version 3 is not supported"**
- **Cause**: Chrome version too old
- **Fix**: Update Chrome to latest version (Settings → About Chrome)

#### **Error: "Could not load icon 'icons/icon16.png'"**
- **Cause**: Incomplete extraction
- **Fix**: Delete folder, re-extract ZIP, verify all files are present

#### **Error: "Permission 'xxx' is unknown or URL pattern is malformed"**
- **Cause**: Old version of the extension
- **Fix**: Download the LATEST version from the link above

#### **Error: References to non-existent files**
- **Cause**: Old version (before fix #2)
- **Fix**: Download the version created Oct 16, 2025 4:43 PM or later

---

## 🔍 Chrome Extension Validation Tool

Use this command to validate the manifest (if you have access to terminal):

```bash
cd /path/to/chrome-extension
python3 -m json.tool manifest.json
```

If this shows any errors, the manifest.json is corrupted.

---

## 📊 File Checklist

Run this to verify all files:

```bash
cd /path/to/chrome-extension

# Check manifest
ls -la manifest.json

# Check scripts
ls -la background.js content.js popup.js config.js injection.js

# Check HTML/CSS
ls -la popup.html appointment-popup.html popup.css styles.css

# Check icons
ls -la icons/
```

All commands should show files, not "No such file" errors.

---

## 🆘 What Error Are You Seeing?

**Please tell me:**

1. **Exact error message** from Chrome
2. **Where the error appears** (during load, after installation, etc.)
3. **Screenshot** if possible
4. **Chrome version** (chrome://settings/help)

With this info, I can give you the exact fix!

---

## 📞 Quick Test

After installation, test the extension:

1. Click the extension icon in toolbar
2. Popup should open (even if showing "No lead detected")
3. Go to: https://www.facebook.com/marketplace
4. Extension icon should still be clickable
5. No console errors (press F12, check Console tab)

---

## ✅ Latest Version Info

**Version**: 2.0.2 (Fixed)
**Date**: October 16, 2025 4:43 PM
**Changes**: 
- Removed invalid permissions
- Removed non-existent file references
- All files verified to exist

**Download**: https://autofollowpro.preview.emergentagent.com/JokerVision-Chrome-Extension.zip

---

*This version should install without any errors. If you still see issues, please share the exact error message!*
