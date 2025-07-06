# Fish Catalog Cleanup - Removing Non-Seafood Items

## Overview

This document explains the changes made to the fish catalog to ensure that only pure seafood items are displayed in the Categories page, removing all prepared dishes and non-seafood items.

## Changes Made

1. Created a new version of `additionalFishData.ts` that includes only pure seafood items and excludes all prepared dishes.

2. Removed the following types of items:
   - Pasta dishes with seafood (e.g., Octopus Pasta, Salmon Pasta)
   - Sashimi dishes (e.g., Octopus Sashimi, Salmon Sashimi)
   - Prepared dishes (e.g., Fish and Chips, Grilled Salmon)
   - Cooked items (e.g., Seafood Paella, Lobster Mac & Cheese)
   - Non-seafood items (e.g., Frog Legs, Snails)
   - Prepared Indian dishes (e.g., Fish Tikka, Prawn Curry, Fish Biryani)

3. Retained and enhanced all pure seafood items:
   - Fish (Salmon, Tuna, Cod, etc.)
   - Shellfish (Clams, Mussels, etc.)
   - Crustaceans (Crabs, Lobster, etc.)
   - Cephalopods (Octopus, Squid, etc.)
   - Preserved seafood (Smoked Salmon, Pickled Herring, etc.)
   - Seafood delicacies (Caviar, Sea Urchin, etc.)

4. Added several new seafood items that weren't in the original data:
   - Barramundi
   - Octopus (as a standalone item)
   - Clams
   - Mussels
   - Scallops
   - King Crab
   - Chilean Sea Bass
   - Orange Roughy
   - Rock Salt Fish
   - Smoked Salmon
   - Pickled Herring
   - Caviar
   - Sea Urchin
   - Pollock
   - Sole
   - Snapper

## Benefits of This Change

1. **Improved User Experience**: The Categories page now shows only pure seafood items, making it easier for users to find the raw ingredients they want to purchase.

2. **Clearer Product Differentiation**: Clear separation between raw seafood products and prepared dishes/recipes.

3. **More Focused Catalog**: By focusing only on seafood items, we can provide more detailed information about each product.

4. **Better Organization**: The catalog is now more logically organized with similar seafood types grouped together.

## Implementation

The changes are implemented in a new file `additionalFishData.ts.new`, which should replace the current `additionalFishData.ts` file.

The new file maintains the same data structure as the original, ensuring compatibility with the existing code in `categories/page.tsx`.

## Next Steps

1. Replace the current `additionalFishData.ts` with the new version.

2. Consider creating a separate section or page for prepared seafood dishes and recipes.

3. Update product images to ensure all new seafood items have appropriate images.

4. Add a filter on the Categories page to allow users to filter by seafood type (fish, shellfish, etc.).
