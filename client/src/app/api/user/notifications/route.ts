import { NextRequest, NextResponse } from 'next/server';

interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newsletters: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDeals: boolean;
  newArrivals: boolean;
  recommendations: boolean;
  securityAlerts: boolean;
}

// Define the notification settings keys as a type
type NotificationSettingKey = keyof NotificationSettings;

// Mock notification settings data
const mockNotificationSettings: NotificationSettings = {
  orderUpdates: true,
  promotions: true,
  newsletters: true,
  smsNotifications: false,
  emailNotifications: true,
  pushNotifications: true,
  weeklyDeals: true,
  newArrivals: true,
  recommendations: true,
  securityAlerts: true
} as const;

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would:
    // 1. Verify the user's authentication
    // 2. Fetch notification settings from the database using user ID
    // 3. Return the user's notification preferences

    // For now, return mock data
    return NextResponse.json(mockNotificationSettings);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validSettings = [
      'orderUpdates', 'promotions', 'newsletters', 'smsNotifications',
      'emailNotifications', 'pushNotifications', 'weeklyDeals',
      'newArrivals', 'recommendations', 'securityAlerts'
    ];

    for (const [key, value] of Object.entries(body)) {
      if (!validSettings.includes(key) || typeof value !== 'boolean') {
        return NextResponse.json(
          { error: `Invalid setting: ${key}` },
          { status: 400 }
        );
      }
    }

    // Handle the "enabled" field which toggles all notifications
    if ('enabled' in body) {
      const enabled = Boolean(body.enabled);
      const updatedSettings = Object.fromEntries(
        Object.entries(mockNotificationSettings).map(([key]) => [key, enabled])
      ) as unknown as NotificationSettings;
      
      // In a real app, you would update the database here
      // For now, update our mock data
      Object.assign(mockNotificationSettings, updatedSettings);
      
      return NextResponse.json({ 
        ...updatedSettings,
        notificationsEnabled: enabled 
      });
    }

    // In a real app, you would:
    // 1. Verify the user's authentication
    // 2. Update the notification settings in the database
    // 3. Return the updated settings

    // For now, merge with mock data and return
    const updatedSettings = { ...mockNotificationSettings, ...body };
    
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validSettings = [
      'orderUpdates', 'promotions', 'newsletters', 'smsNotifications',
      'emailNotifications', 'pushNotifications', 'weeklyDeals',
      'newArrivals', 'recommendations', 'securityAlerts'
    ];

    for (const [key, value] of Object.entries(body)) {
      if (!validSettings.includes(key) || typeof value !== 'boolean') {
        return NextResponse.json(
          { error: `Invalid setting: ${key}` },
          { status: 400 }
        );
      }
    }

    // Handle the "enabled" field which toggles all notifications
    if ('enabled' in body) {
      const enabled = Boolean(body.enabled);
      const updatedSettings = Object.fromEntries(
        Object.entries(mockNotificationSettings).map(([key]) => [key, enabled])
      ) as unknown as NotificationSettings;
      
      // In a real app, you would update the database here
      // For now, update our mock data
      Object.assign(mockNotificationSettings, updatedSettings);
      
      return NextResponse.json({ 
        ...updatedSettings,
        notificationsEnabled: enabled 
      });
    }

    // In a real app, you would:
    // 1. Verify the user's authentication
    // 2. Update the notification settings in the database
    // 3. Return the updated settings

    // For now, merge with mock data and return
    const updatedSettings = { ...mockNotificationSettings, ...body };
    
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}
