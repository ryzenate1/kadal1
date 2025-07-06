import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock data for development - in production this would come from database
let homepageContent = {
  hero: {
    id: 'hero',
    title: 'Fresh Seafood Delivered to Your Doorstep',
    subtitle: 'Discover the finest and freshest seafood, sourced directly from the coast of Tamil Nadu.',
    content: 'Experience premium quality seafood delivered fresh to your home. Our commitment to quality ensures you get the best catch of the day.',
    imageUrl: '/images/banners/hero-banner.jpg',
    ctaText: 'Shop Now',
    ctaLink: '/category/seafood',
    order: 1,
    isActive: true,
  },
  sections: [
    {
      id: 'trust-badges',
      title: 'Trust Badges',
      subtitle: 'Why Choose Us',
      content: 'Quality, Freshness, and Trust - Our Promise to You',
      imageUrl: '',
      ctaText: '',
      ctaLink: '',
      order: 2,
      isActive: true,
      type: 'trust-badges'
    },
    {
      id: 'categories',
      title: 'Categories',
      subtitle: 'Explore Our Selection',
      content: 'Browse through our popular categories of fresh seafood.',
      imageUrl: '',
      ctaText: 'View All',
      ctaLink: '/categories',
      order: 3,
      isActive: true,
      type: 'categories'
    },
    {
      id: 'featured-products',
      title: 'Featured Products',
      subtitle: 'Customer Favorites',
      content: 'Our most popular seafood selections that customers love.',
      imageUrl: '/images/banners/featured.jpg',
      ctaText: 'Shop Featured',
      ctaLink: '/products/featured',
      order: 4,
      isActive: true,
      type: 'featured-products'
    },
    {
      id: 'fresh-delivery',
      title: 'Fresh Delivery',
      subtitle: 'Fast & Fresh Delivery',
      content: 'We ensure your seafood reaches you fresh with our cold chain delivery system.',
      imageUrl: '/images/banners/delivery.jpg',
      ctaText: 'Learn More',
      ctaLink: '/delivery-info',
      order: 5,
      isActive: true,
      type: 'fresh-delivery'
    },
    {
      id: 'sustainability',
      title: 'Sustainability',
      subtitle: 'Sustainable Fishing Practices',
      content: 'We are committed to sustainable fishing practices to protect our oceans.',
      imageUrl: '/images/banners/sustainability.jpg',
      ctaText: 'Our Mission',
      ctaLink: '/sustainability',
      order: 6,
      isActive: true,
      type: 'sustainability'
    },
    {
      id: 'blog-posts',
      title: 'Blog Posts',
      subtitle: 'Latest News & Tips',
      content: 'Stay updated with seafood recipes, cooking tips, and industry news.',
      imageUrl: '',
      ctaText: 'Read More',
      ctaLink: '/blog',
      order: 7,
      isActive: true,
      type: 'blog-posts'
    },
    {
      id: 'about',
      title: 'About Section',
      subtitle: 'Our Story',
      content: 'Learn about our journey from coastal waters to your dinner table.',
      imageUrl: '/images/banners/about.jpg',
      ctaText: 'About Us',
      ctaLink: '/about',
      order: 8,
      isActive: true,
      type: 'about'
    },
    {
      id: 'testimonials',
      title: 'Testimonials',
      subtitle: 'What Our Customers Say',
      content: 'Read reviews from our satisfied customers across India.',
      imageUrl: '',
      ctaText: '',
      ctaLink: '',
      order: 9,
      isActive: true,
      type: 'testimonials'
    }
  ]
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: homepageContent
    });
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch homepage content' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { sectionId, updateData } = body;

    if (sectionId === 'hero') {
      homepageContent.hero = { ...homepageContent.hero, ...updateData };
    } else {
      const sectionIndex = homepageContent.sections.findIndex(s => s.id === sectionId);
      if (sectionIndex !== -1) {
        homepageContent.sections[sectionIndex] = { 
          ...homepageContent.sections[sectionIndex], 
          ...updateData 
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Content updated successfully',
      data: homepageContent
    });
  } catch (error) {
    console.error('Error updating homepage content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update homepage content' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sectionData } = body;

    const newSection = {
      id: `section-${Date.now()}`,
      order: homepageContent.sections.length + 1,
      isActive: true,
      ...sectionData
    };

    homepageContent.sections.push(newSection);

    return NextResponse.json({
      success: true,
      message: 'Section added successfully',
      data: newSection
    });
  } catch (error) {
    console.error('Error adding homepage section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add homepage section' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');

    if (!sectionId) {
      return NextResponse.json(
        { success: false, error: 'Section ID is required' },
        { status: 400 }
      );
    }

    if (sectionId === 'hero') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete hero section' },
        { status: 400 }
      );
    }

    homepageContent.sections = homepageContent.sections.filter(s => s.id !== sectionId);

    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting homepage section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete homepage section' },
      { status: 500 }
    );
  }
}
