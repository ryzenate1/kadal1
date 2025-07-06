# Multi-Step Dynamic Address Form Implementation

This guide explains how the dynamic multi-step address form works in the Kadal Thunai application.

## Overview

The address form is implemented as a multi-step wizard that guides users through the process of adding or editing an address:

1. **Step 1:** Choose address type (Home, Work, or Other)
2. **Step 2:** Enter personal details (Name and Phone Number)
3. **Step 3:** Enter address details (Street Address, City, Pincode, State)
   - Option to use map for location selection
   - Option to set as default address

## Component Structure

The implementation uses the following components:

- `AddressFormDialog.tsx` from `components/address/` - The main multi-step form component
- `improved-page.tsx` - Desktop address management page that uses the form
- `mobile-page.tsx` - Mobile-optimized address management

## Key Features

### 1. Multi-Step Navigation

- Each step is displayed in a separate view with smooth animations
- Back button to navigate to previous steps
- Progress is maintained throughout the flow

### 2. Type Selection (Step 1)

Users can select the type of address (Home, Work, or Other) with visual indicators:

```jsx
<div className="grid grid-cols-3 gap-4">
  {[{ type: 'home', icon: Home, label: 'Home' }, 
    { type: 'work', icon: Briefcase, label: 'Work' }, 
    { type: 'other', icon: MapPinned, label: 'Other' }].map((item) => {
    // Implementation details
  })}
</div>
```

### 3. Personal Details (Step 2)

Collects user's name and phone number with validation:

```jsx
<div className="space-y-3">
  <label className="block text-sm font-medium text-gray-700">Full Name</label>
  <Input
    id="name"
    placeholder="Enter your full name"
    className="w-full"
    {...register('name', { required: 'Name is required' })}
  />
  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
</div>

<div className="space-y-3">
  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
  <Input
    id="phoneNumber"
    placeholder="10-digit mobile number"
    className="w-full"
    {...register('phoneNumber', {
      required: 'Phone number is required',
      pattern: {
        value: /^[0-9]{10}$/,
        message: 'Please enter a valid 10-digit phone number',
      },
    })}
  />
  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
</div>
```

### 4. Address Details (Step 3)

Collects complete address information with validation:

```jsx
<div className="space-y-3">
  <div className="flex justify-between items-center">
    <label className="block text-sm font-medium text-gray-700">Address</label>
    <button
      type="button"
      onClick={() => setShowMap(true)}
      className="text-xs text-tendercuts-red hover:text-tendercuts-red/80 flex items-center"
    >
      <MapPin className="h-3 w-3 mr-1" />
      Use map
    </button>
  </div>
  <Input
    id="address"
    placeholder="House/Flat No., Building, Street"
    className="w-full"
    {...register('address', { required: 'Address is required' })}
  />
</div>

// Other form fields for city, pincode, state
```

### 5. Map Integration

Users can select their location on a map:

```jsx
<Dialog open={showMap} onOpenChange={setShowMap}>
  <DialogContent className="max-w-4xl h-[80vh] p-0">
    {/* Map implementation */}
  </DialogContent>
</Dialog>
```

## Data Flow

1. User completes the multi-step form
2. Form data is validated at each step
3. On submission, the data is:
   - Immediately used to update the UI (optimistic update)
   - Sent to the API in the background
   - In case of API failure, the UI remains updated (already showed success to user)

## API Integration

The address data is saved using this flow:

```javascript
// First, update the UI immediately for a responsive experience
if (isNew) {
  // Add new address logic
} else {
  // Update existing address logic
}

// Then, try to save to the API
const url = isNew 
  ? '/api/users/addresses' 
  : `/api/users/addresses/${address.id}`;

const method = isNew ? 'POST' : 'PUT';

fetch(url, {
  method,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(address),
})
  .then(response => {
    // Handle success
  })
  .catch(error => {
    // Handle error (UI remains updated)
  });
```

## Animation

The form uses Framer Motion for smooth transitions between steps:

```jsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.3 }}
  className="space-y-6"
>
  {/* Step content */}
</motion.div>
```

## Responsive Design

The form adapts to both desktop and mobile views:
- On desktop, it appears as a dialog
- On mobile, it's optimized for smaller screens with appropriate spacing

## Testing

To thoroughly test the multi-step form:

1. Test all validation rules (required fields, pattern matching)
2. Verify that the navigation between steps works correctly
3. Test the map integration functionality
4. Ensure the form works correctly for both new addresses and editing existing ones
5. Verify that setting an address as default works correctly
6. Test the responsive behavior on different screen sizes
