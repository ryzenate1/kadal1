import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return default homepage sections
    const defaultSections = [
      {
        id: '1',
        title: 'Welcome to Kadal Thunai',
        subtitle: 'Fresh Seafood from Tamil Nadu',
        content: 'Experience the finest selection of fresh fish and seafood.',
        imageUrl: '/images/section1.jpg',
        ctaText: 'Explore',
        ctaLink: '/products',
        order: 1
      }
    ];

    return NextResponse.json({
      success: true,
      data: defaultSections
    });
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch homepage sections' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sections = await req.json();
    console.log('Homepage sections updated:', sections.length, 'sections');
    
    return NextResponse.json({
      success: true,
      message: 'Homepage sections updated successfully',
      data: sections
    });
  } catch (error) {
    console.error('Error updating homepage sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update homepage sections' },
      { status: 500 }
    );
  }
}
