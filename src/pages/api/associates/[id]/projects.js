import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query; // associateId

  try {
    if (req.method === 'GET') {
      const projects = await prisma.associateProject.findMany({
        where: { associateId: id },
        orderBy: { date: 'desc' },
        include: {
          order: { select: { id: true, orderNumber: true } },
          _count: { select: { costItems: true, payments: true } }
        }
      });
      return res.status(200).json({ success: true, data: projects });
    }

    if (req.method === 'POST') {
      const { projectName, orderId, customerName, location, description, date, status } = req.body;

      if (!projectName || !projectName.trim()) {
        return res.status(400).json({ success: false, message: 'Project name is required' });
      }

      const project = await prisma.associateProject.create({
        data: {
          associateId: id,
          projectName: projectName.trim(),
          orderId: orderId || null,
          customerName: customerName || null,
          location: location || null,
          description: description || null,
          date: date ? new Date(date) : new Date(),
          status: status || 'PENDING',
          totalAmount: 0,
          paidAmount: 0,
          dueAmount: 0,
          paymentStatus: 'UNPAID'
        }
      });

      return res.status(201).json({ success: true, message: 'Project created successfully', data: project });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
