import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query; // associateId

  try {
    if (req.method === 'GET') {
      const projectAssociates = await prisma.projectAssociate.findMany({
        where: { associateId: id },
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            include: {
              order: { select: { id: true, orderNumber: true } }
            }
          }
        }
      });
      
      const projects = projectAssociates.map(pa => ({
        ...pa,
        projectName: pa.project.name,
        customerName: pa.project.customerName,
        location: pa.project.location,
        description: pa.project.description,
        date: pa.project.date,
        status: pa.project.status,
        orderId: pa.project.orderId,
        order: pa.project.order
      }));

      return res.status(200).json({ success: true, data: projects });
    }

    if (req.method === 'POST') {
      const { projectName, orderId, customerName, location, description, date, status } = req.body;

      if (!projectName || !projectName.trim()) {
        return res.status(400).json({ success: false, message: 'Project name is required' });
      }

      const project = await prisma.project.create({
        data: {
          name: projectName.trim(),
          orderId: orderId || null,
          customerName: customerName || null,
          location: location || null,
          description: description || null,
          date: date ? new Date(date) : new Date(),
          status: status || 'PENDING',
          associates: {
            create: {
              associateId: id,
              totalAmount: 0,
              paidAmount: 0,
              dueAmount: 0,
              paymentStatus: 'UNPAID'
            }
          }
        },
        include: { associates: true }
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
