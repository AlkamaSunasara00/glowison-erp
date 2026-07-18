import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { projectId } = req.query;

  try {
    if (req.method === 'GET') {
      const project = await prisma.associateProject.findUnique({
        where: { id: projectId },
        include: {
          associate: { select: { id: true, name: true, phone: true, category: true } },
          order: { select: { id: true, orderNumber: true } },
          costItems: { orderBy: { type: 'asc' } },
          payments: { orderBy: { date: 'desc' } }
        }
      });
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      return res.status(200).json({ success: true, data: project });
    }

    if (req.method === 'PUT') {
      const { projectName, orderId, customerName, location, description, date, status } = req.body;

      const project = await prisma.associateProject.update({
        where: { id: projectId },
        data: {
          projectName: projectName || undefined,
          orderId: orderId !== undefined ? (orderId || null) : undefined,
          customerName: customerName !== undefined ? (customerName || null) : undefined,
          location: location !== undefined ? (location || null) : undefined,
          description: description !== undefined ? (description || null) : undefined,
          date: date ? new Date(date) : undefined,
          status: status || undefined
        }
      });

      return res.status(200).json({ success: true, message: 'Project updated', data: project });
    }

    if (req.method === 'DELETE') {
      // Cascade deletes cost items and payments due to onDelete: Cascade
      await prisma.associateProject.delete({ where: { id: projectId } });
      return res.status(200).json({ success: true, message: 'Project deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
