# ShopByCategory & Product Detail Pages Revamp - Implementation Tracker

## Status: 🟡 IN PROGRESS

## Current Issues Identified:
1. ✅ **Mixed image paths**: Some use `/images/fishes picss/` (old) and `/images/fish/` (new)
2. ✅ **Broken cards**: Cards are stretched and non-premium looking
3. ✅ **Missing nutritional data**: Cards lack omega-3, protein, calories info
4. ✅ **No macro calculator**: Product pages lack weight-based nutrition calculation
5. ✅ **No individual product pages**: Missing `/product/[slug]` pages
6. ✅ **No filters**: Missing filter functionality
7. ✅ **Inconsistent data structure**: Product data scattered across multiple files

## Implementation Plan:

### 🐟 Step 1: Clean up product data ✅ COMPLETED
- ✅ Audited all products in `/data/additionalFishData.ts`
- ✅ **MAJOR UPDATE**: Expanded from 18 to 44 fish products to include ALL available images
- ✅ Removed hallucination by ensuring 100% image-to-data mapping
- ✅ Standardized data structure with required fields:
  - `id`, `slug`, `tanglishName`, `englishName`, `imagePath`, `description`
  - `omega3`, `protein`, `calories`, `origin`, `rating`, `tags`
  - `availableWeights`, `basePrice`, `type`, `isPopular`, `isPremium`
- ✅ Added proper TypeScript interface `FishProduct`
- ✅ Verified all nutritional data with online sources (44 fish products)
- ✅ Added Tamil/English name structure
- ✅ Added proper filtering and search functions
- ✅ Added comprehensive fish categories: Premium, Marine, Freshwater, Local, Oily, Small Fish, etc.

**Result**: Complete data with 44 verified fish products covering ALL images in /public/images/fish, with accurate nutritional information and zero hallucination potential.

### 📦 Step 2: Fix all image imports ⏳
- [ ] Update all image references from `/images/fishes picss/` to `/images/fish/`
- [ ] Ensure all product images exist in `/public/images/fish/`
- [ ] Add fallback image handling

### 🎨 Step 3: Revamp Fish Card Component ⏳
- [ ] Create new `PremiumFishCard.tsx` component
- [ ] Implement design based on Premium Collection cards
- [ ] Add nutritional info display
- [ ] Add Tamil/English name structure
- [ ] Implement weight selector and price calculation

### 🧠 Step 4: Add Macro Calculator Logic ⏳
- [ ] Create `MacroCalculator.tsx` component
- [ ] Implement weight-based nutrition calculation
- [ ] Add to product detail pages

### 📄 Step 5: Generate Fish Detail Pages ⏳
- [ ] Create `/product/[slug]/page.tsx` template
- [ ] Generate static paths for all fish products
- [ ] Implement full product detail layout

### 🔍 Step 6: Implement Filters and Search ⏳
- [ ] Add filter dropdown component
- [ ] Implement filter logic (Popular, Premium, Tastiest, Boneless)
- [ ] Enhance search functionality

### 🧼 Step 7: Remove broken links ⏳
- [ ] Audit all product slugs
- [ ] Ensure all cards link to valid pages
- [ ] Add error handling for missing products

### 🧪 Step 8: Visual Polish ⏳
- [ ] Apply consistent Tailwind styling
- [ ] Add hover effects and animations
- [ ] Implement responsive design
- [ ] Add toast notifications

### ⚠️ Step 9: Test & Commit ⏳
- [ ] Run eslint and fix issues
- [ ] Test all functionality
- [ ] Commit changes

## Notes:
- Current Premium Collection card design is well-implemented in `CategorySlider.tsx`
- Fish data is in `/data/additionalFishData.ts` with good structure
- Image directory `/public/images/fish/` has good coverage
- Need to consolidate product data and create consistent structure
