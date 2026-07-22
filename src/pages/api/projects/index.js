import prisma from '@/lib/prisma';
import { assertServerEnv } from '@/lib/server-env';

export default async function handler(req, res) {
  assertServerEnv();

  if (req.method === 'GET') {
    try {
      const projects = await prisma.project.findMany({
        include: {
          associates: {
            include: {
              associate: true
            }
          },
          order: true
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ success: true, data: projects });
    } catch (error) {
      console.error('Fetch projects error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, customerName, location, description, date, orderId, totalAmount } = req.body;
      
      const newProject = await prisma.project.create({
        data: {
          name,
          customerName,
          location,
          description,
          date: date ? new Date(date) : new Date(),
          orderId: orderId || null,
          totalAmount: totalAmount || 0,
        },
      });
      return res.status(201).json({ success: true, data: newProject, message: 'Project created successfully' });
    } catch (error) {
      console.error('Create project error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create project' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
