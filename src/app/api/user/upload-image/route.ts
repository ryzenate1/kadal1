import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

// POST /api/user/upload-image - Upload profile image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('profileImage') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `profile-${timestamp}${extension}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    
    try {
      await writeFile(path.join(uploadsDir, filename), buffer);
    } catch (error) {
      // Create directory if it doesn't exist
      const fs = require('fs');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        await writeFile(path.join(uploadsDir, filename), buffer);
      } else {
        throw error;
      }
    }

    // Return the image URL
    const imageUrl = `/uploads/profiles/${filename}`;
    
    // TODO: Update user profile in database
    // const userId = await getUserIdFromAuth(request);
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { profileImage: imageUrl }
    // });
    
    return NextResponse.json({ 
      imageUrl, 
      message: 'Image uploaded successfully',
      success: true 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ 
      error: 'Failed to upload image. Please try again.',
      success: false 
    }, { status: 500 });
  }
}
