import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const defaultAboutContent = {
      title: 'About Kadal Thunai',
      subtitle: 'Your trusted seafood partner since 2020',
      mainContent: 'Founded by passionate fishermen from Tamil Nadu, we bring you the freshest seafood directly from our coastal waters. Our commitment to quality and sustainability ensures that every catch meets the highest standards.',
      mission: 'To provide the freshest, highest quality seafood while supporting local fishing communities and sustainable practices.',
      vision: 'To become the leading seafood provider in South India, known for freshness, quality, and customer satisfaction.',
      teamMembers: [
        {
          id: '1',
          name: 'Ravi Kumar',
          position: 'Founder & CEO',
          bio: 'A third-generation fisherman with 20 years of experience in the seafood industry.',
          imageUrl: '/images/team/ravi.jpg'
        },
        {
          id: '2',
          name: 'Priya Devi',
          position: 'Quality Manager',
          bio: 'Ensures every product meets our stringent quality standards.',
          imageUrl: '/images/team/priya.jpg'
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: defaultAboutContent
    });
  } catch (error) {
    console.error('Error fetching about us content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch about us content' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const aboutContent = await req.json();
    console.log('About us content updated:', Object.keys(aboutContent));
    
    return NextResponse.json({
      success: true,
      message: 'About us content updated successfully',
      data: aboutContent
    });
  } catch (error) {
    console.error('Error updating about us content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update about us content' },
      { status: 500 }
    );
  }
}
