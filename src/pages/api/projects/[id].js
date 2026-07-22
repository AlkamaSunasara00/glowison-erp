import prisma from '@/lib/prisma';
import { assertServerEnv } from '@/lib/server-env';

export default async function handler(req, res) {
  assertServerEnv();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          associates: {
            include: {
              associate: true
            }
          },
          costItems: true,
          payments: true,
          order: true
        }
      });
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      console.error('Fetch project error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch project' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, customerName, location, description, date, status, totalAmount, paidAmount, dueAmount, paymentStatus } = req.body;
      
      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          name,
          customerName,
          location,
          description,
          status,
          date: date ? new Date(date) : undefined,
          totalAmount,
          paidAmount,
          dueAmount,
          paymentStatus,
        }
      });
      return res.status(200).json({ success: true, data: updatedProject, message: 'Project updated successfully' });
    } catch (error) {
      console.error('Update project error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update project' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.project.delete({
        where: { id }
      });
      return res.status(200).json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Delete project error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete project' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
