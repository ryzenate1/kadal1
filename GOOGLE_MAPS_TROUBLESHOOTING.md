# Google Maps API Troubleshooting Guide 🔧

## 🚨 **Current Issue:**
"This page didn't load Google Maps correctly. See the JavaScript console for technical details."

## 🔍 **Most Common Causes & Solutions:**

### **1. API Key Issues (Most Likely)**

#### **Check API Key Status:**
```bash
Current API Key: AIzaSyCg4T7H4MC5TPBvqJGxGMsT-JFu5Bs7XSI
```

#### **Required APIs to Enable:**
- ✅ **Maps JavaScript API** ← Most important!
- ✅ **Geocoding API** ← For address lookup
- ✅ **Places API** ← For search functionality

#### **Common API Key Problems:**
1. **Billing Not Enabled** - Google requires billing even for free tier
2. **API Not Enabled** - Maps JavaScript API must be specifically enabled
3. **Domain Restrictions** - localhost might be blocked
4. **Quota Exceeded** - Daily limits reached

### **2. Billing Issues**
Google Maps requires a billing account even for development:
- Go to [Google Cloud Console](https://console.cloud.google.com/billing)
- Enable billing for your project
- Free tier includes $200/month credit

### **3. API Restrictions**
Check if the API key has domain restrictions:
- Go to [API Credentials](https://console.cloud.google.com/apis/credentials)
- Click on your API key
- Under "Application restrictions":
  - Either set to "None" for testing
  - Or add `localhost:3001` to allowed domains

### **4. Required API Permissions**
Enable these APIs in [Google Cloud Console](https://console.cloud.google.com/apis/library):
```
✅ Maps JavaScript API
✅ Geocoding API  
✅ Places API
✅ Maps Static API (optional)
```

## 🛠️ **Immediate Fixes Applied:**

### **1. Enhanced Error Handling**
- Added detailed console logging
- Better error messages with specific causes
- Retry functionality with page reload
- Visual error states with troubleshooting tips

### **2. API Key Validator**
- Created API tester component (top-right corner in dev mode)
- Tests API key format and basic geocoding
- Shows specific error messages
- Links to Google Cloud Console

### **3. Improved Loading**
- Enhanced Google Maps loader with timeout
- Better callback handling
- More robust script loading
- Fallback error states

## 🔧 **Debug Steps:**

### **Step 1: Check API Key**
1. Use the "Test API Key" button in top-right corner
2. Should show ✅ if working or specific error message

### **Step 2: Enable Required APIs**
1. Go to [Google Cloud Console APIs](https://console.cloud.google.com/apis/library)
2. Search and enable:
   - Maps JavaScript API
   - Geocoding API
   - Places API

### **Step 3: Check Billing**
1. Go to [Google Cloud Billing](https://console.cloud.google.com/billing)
2. Enable billing if not already enabled
3. Verify billing account is linked to your project

### **Step 4: Remove Restrictions (for testing)**
1. Go to [API Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your API key
3. Set "Application restrictions" to "None"
4. Save changes

### **Step 5: Browser Console**
1. Open browser developer tools (F12)
2. Check Console tab for specific error messages
3. Look for network errors or API quota messages

## 🚀 **Quick Test URLs:**

Test these URLs to verify API functionality:

### **Basic Geocoding Test:**
```
https://maps.googleapis.com/maps/api/geocode/json?address=Chennai&key=AIzaSyCg4T7H4MC5TPBvqJGxGMsT-JFu5Bs7XSI
```

### **Places API Test:**
```
https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurant+in+Chennai&key=AIzaSyCg4T7H4MC5TPBvqJGxGMsT-JFu5Bs7XSI
```

## 📋 **Expected Response Codes:**

### **✅ Success:**
- `"status": "OK"` - API working correctly

### **❌ Common Errors:**
- `"status": "REQUEST_DENIED"` - API not enabled or billing issue
- `"status": "OVER_QUERY_LIMIT"` - Quota exceeded
- `"status": "INVALID_REQUEST"` - Malformed request
- No response - Network/CORS issue

## 🎯 **Next Steps:**

1. **Test the API key** using the debug tool
2. **Enable billing** in Google Cloud Console  
3. **Enable required APIs** (Maps JavaScript, Geocoding, Places)
4. **Remove domain restrictions** for localhost testing
5. **Check browser console** for specific error details

Once these are fixed, the Google Maps should load correctly and show the interactive map with draggable pin functionality!

## 🔗 **Useful Links:**
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Credentials](https://console.cloud.google.com/apis/credentials)
- [API Library](https://console.cloud.google.com/apis/library)
- [Billing Settings](https://console.cloud.google.com/billing)
- [Maps API Documentation](https://developers.google.com/maps/documentation/javascript/overview)
