import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const context = formData.get('context') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // In a real application, you would upload this to cloud storage
    // For demo purposes, we'll just return a sample image from Unsplash
    
    // Choose appropriate sample image based on context
    let sampleImageUrl = "https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?q=80&w=1974&auto=format&fit=crop";
    
    // Different sample images for different contexts
    if (context === 'trusted-badges' || context.includes('fish')) {
      sampleImageUrl = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop";
    } else if (context === 'categories' || context.includes('category')) {
      sampleImageUrl = "https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?q=80&w=1974&auto=format&fit=crop";
    } else if (context === 'prawns' || context.includes('prawn')) {
      sampleImageUrl = "https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop";
    }

    // Generate a unique filename (in real app would save to storage)
    const fileName = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;
    
    // For demo, log file info
    console.log("File received:", file.name, file.size, file.type, "Context:", context);
    
    // Return both the URL we would generate and a sample image for demo purposes
    return NextResponse.json({
      url: sampleImageUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      mimeType: file.type
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 