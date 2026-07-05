import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true }
    });
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default withAuth(handler);
