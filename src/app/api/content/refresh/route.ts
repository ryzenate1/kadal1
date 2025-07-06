import { NextRequest, NextResponse } from 'next/server';
import { fetchHomepageComponents, getActiveComponents } from '@/services/contentService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Fetch the latest components from the admin API
    const components = await fetchHomepageComponents();
    
    // Get only the active components for the frontend
    const activeComponents = getActiveComponents(components);
    
    return NextResponse.json({
      success: true,
      components,
      activeComponents,
      totalComponents: Object.keys(components).length,
      activeCount: Object.keys(activeComponents).length,
    });
  } catch (error) {
    console.error('[API] Failed to fetch homepage components:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch components',
        components: {}
      },
      { status: 500 }
    );
  }
}
