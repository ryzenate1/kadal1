# Choose Location Implementation Progress

## 📋 Project Overview
Implementing a fully functional Swiggy-style location selection system with Google Maps integration for the Kadal Thunai seafood delivery app.

## 🎯 Requirements Summary
- **Search Functionality**: Auto-complete with Google Places API
- **GPS Integration**: Current location detection with geolocation API
- **Map Interface**: Interactive map with pin placement
- **Address Management**: Save/load addresses with full CRUD operations
- **User Experience**: Mobile-first, seamless navigation between pages

## 📊 Current Project Structure Analysis

### ✅ Existing Infrastructure
- **Database**: Prisma with SQLite
- **Location Context**: Basic localStorage-based storage
- **Google Maps**: Dependencies installed (`@googlemaps/js-api-loader`, `@react-google-maps/api`)
- **API Endpoints**: Basic address endpoints in `/api/user/addresses`
- **Authentication**: AuthContext available
- **UI Components**: Basic UI components with Tailwind CSS

### 🔧 Technical Decisions Made
1. **Google Maps Integration**: Use `@googlemaps/js-api-loader` (official)
2. **API Key Management**: Move to `.env.local` (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
3. **Database Schema**: Extend existing Address model with lat/lng and detailed fields
4. **State Management**: Extend LocationContext with Google Maps integration
5. **Search**: 5 results max, 400ms debounce, localStorage recent searches
6. **Error Handling**: Graceful fallbacks with toast notifications

### 📋 Database Schema Requirements
```typescript
{
  id: string;
  userId?: string; // optional for guest users
  label: "Home" | "Work" | "Friends and Family" | "Other";
  fullAddress: string;
  flat: string;
  apartment: string;
  directionsNote?: string;
  voiceNoteUrl?: string;
  lat: number;
  lng: number;
  isSelected: boolean;
  createdAt: string;
}
```

### 🗺️ Page Flow Architecture
| From | Action | Redirect To |
|------|--------|-------------|
| `/` | Click location bar | `/choose-location` |
| `/choose-location` | "Use Current Location" | `/choose-on-map?mode=current` |
| `/choose-location` | "Add New Address" | `/choose-on-map?mode=new` |
| `/choose-on-map` | "Confirm & Proceed" | `/add-new-address?lat=..&lng=..&address=..` |
| `/add-new-address` | Save address | `/choose-location` |

### 🚀 Implementation Plan
- **Phase 1**: Core Google Maps integration and environment setup ✅ CURRENT
- **Phase 2**: Database schema and API endpoint updates
- **Phase 3**: LocationContext enhancement with Google Maps
- **Phase 4**: UI components with real functionality
- **Phase 5**: End-to-end testing and optimization

## 🔥 Current Task: Phase 1 - Core Implementation
Starting with the choose location page functionality:

### 1. Environment Setup
- Move API key to `.env.local`
- Install required dependencies if missing

### 2. Core Components to Create
- **GoogleMap Component**: Reusable map with pin placement
- **LocationSearch Component**: Auto-complete search with Google Places
- **AddressForm Component**: Detailed address entry form
- **LocationPicker Component**: Map interface for pin placement

### 3. Features to Implement
- **Search with auto-complete**: Google Places API integration
- **GPS location detection**: Browser geolocation API
- **Real-time reverse geocoding**: Google Geocoding API
- **Address persistence**: Enhanced LocationContext
- **Mobile-optimized UI**: Touch-friendly map interactions

## 📝 Implementation Notes
- Use mobile-first approach
- Implement 400ms debounce for search
- Cache geocoded results for 1 hour
- Support both logged-in and guest users
- Graceful error handling for API failures
- Store recent searches in localStorage

## 🎨 UI Reference
Based on provided screenshots:
1. Choose Location page with search, saved addresses, recent searches
2. Map view with center pin and real-time address updates
3. Address form with voice directions and tag selection
4. Mobile-optimized touch interactions

## 🚧 Next Steps
1. Set up environment variables
2. Create core Google Maps components
3. Implement search functionality
4. Add GPS location detection
5. Create address form with validation
6. Connect all components with proper navigation

---
*Last Updated: July 5, 2025*
