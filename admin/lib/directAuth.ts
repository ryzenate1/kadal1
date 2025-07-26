import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// This is a direct database authentication utility that bypasses the API
// Use this when there are issues with the API connection
export async function authenticateDirectly(phoneNumber: string, password: string) {
  try {
    console.log('Attempting direct database authentication for:', phoneNumber);
    
    // Find user directly in the database
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });
    
    if (!user) {
      console.error('User not found in direct database lookup');
      return null;
    }
    
    // Verify the password
    const passwordValid = await bcrypt.compare(password, user.password);
    
    if (!passwordValid) {
      console.error('Password invalid in direct database lookup');
      return null;
    }
    
    // Only return admin users
    if (user.role !== 'admin') {
      console.error('User is not an admin, role:', user.role);
      return null;
    }
    
    // Don't include the password in the returned object
    const { password: _, ...userWithoutPassword } = user;
    
    // Generate a simple token (in a real app, this would use JWT)
    const token = Buffer.from(`${user.id}:${user.role}:${Date.now()}`).toString('base64');
    
    return {
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('Error in direct authentication:', error);
    return null;
  }
}
