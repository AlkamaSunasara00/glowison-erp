import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const item = await prisma.associate.findUnique({
        where: { id },
        include: {
          projects: {
            orderBy: { date: 'desc' },
            include: {
              order: { select: { id: true, orderNumber: true } },
              costItems: true,
              payments: { orderBy: { date: 'desc' } }
            }
          }
        }
      });
      if (!item) return res.status(404).json({ success: false, message: 'Associate not found' });

      const totalProjects = item.projects.length;
      const totalWorkAmount = item.projects.reduce((s, p) => s + parseFloat(p.totalAmount || 0), 0);
      const totalPaid = item.projects.reduce((s, p) => s + parseFloat(p.paidAmount || 0), 0);
      const totalDue = item.projects.reduce((s, p) => s + parseFloat(p.dueAmount || 0), 0);

      return res.status(200).json({
        success: true,
        data: { ...item, totalProjects, totalWorkAmount, totalPaid, totalDue }
      });
    }

    if (req.method === 'PUT') {
      const { name, phone, address, category, status, notes } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Associate name is required' });
      }

      const item = await prisma.associate.update({
        where: { id },
        data: {
          name: name.trim(),
          phone: phone || null,
          address: address || null,
          category: category || 'INSTALLER',
          status: status || 'ACTIVE',
          notes: notes || null
        }
      });

      return res.status(200).json({ success: true, message: 'Updated successfully', data: item });
    }

    if (req.method === 'DELETE') {
      // Check for linked projects
      const projectCount = await prisma.associateProject.count({ where: { associateId: id } });
      if (projectCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete associate with ${projectCount} linked project(s). Delete projects first.`
        });
      }

      await prisma.associate.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'Deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
