import prisma from '@/lib/prisma';
import { assertServerEnv } from '@/lib/server-env';

export default async function handler(req, res) {
  assertServerEnv();

  // Here, projectId from the URL actually refers to the ProjectAssociate ID
  const { projectId: projectAssociateId } = req.query;

  try {
    if (req.method === 'GET') {
      const pa = await prisma.projectAssociate.findUnique({
        where: { id: projectAssociateId },
        include: {
          associate: true,
          project: {
            include: {
              order: { select: { id: true, orderNumber: true } }
            }
          }
        }
      });
      if (!pa) return res.status(404).json({ success: false, message: 'Assignment not found' });

      // Fetch cost items and payments for THIS associate on THIS project
      const costItems = await prisma.projectCostItem.findMany({
        where: { projectId: pa.projectId, associateId: pa.associateId }
      });
      
      const payments = await prisma.projectPayment.findMany({
        where: { projectId: pa.projectId, associateId: pa.associateId },
        orderBy: { date: 'desc' }
      });
      
      const projectData = {
        ...pa,
        projectName: pa.project.name,
        customerName: pa.project.customerName,
        location: pa.project.location,
        description: pa.project.description,
        date: pa.project.date,
        status: pa.project.status,
        orderId: pa.project.orderId,
        order: pa.project.order,
        costItems,
        payments
      };
      
      return res.status(200).json({ success: true, data: projectData });
    }

    if (req.method === 'PUT') {
      const { status, totalAmount } = req.body;

      // When saving edit from assignment detail
      const currentPa = await prisma.projectAssociate.findUnique({ where: { id: projectAssociateId } });
      if (!currentPa) return res.status(404).json({ success: false, message: 'Not found' });

      const newTotal = totalAmount !== undefined ? parseFloat(totalAmount) : parseFloat(currentPa.totalAmount);
      const totalPaid = parseFloat(currentPa.paidAmount);
      const dueAmount = Math.max(0, newTotal - totalPaid);
      let paymentStatus = 'UNPAID';
      if (totalPaid >= newTotal && newTotal > 0) paymentStatus = 'PAID';
      else if (totalPaid > 0) paymentStatus = 'PARTIAL';

      const updatedPa = await prisma.projectAssociate.update({
        where: { id: projectAssociateId },
        data: {
          totalAmount: newTotal,
          dueAmount: dueAmount,
          paymentStatus: paymentStatus
        }
      });
      
      // Optionally update project status if passed
      if (status) {
        await prisma.project.update({
          where: { id: currentPa.projectId },
          data: { status }
        });
      }

      return res.status(200).json({ success: true, message: 'Assignment updated', data: updatedPa });
    }

    if (req.method === 'DELETE') {
      await prisma.projectAssociate.delete({ where: { id: projectAssociateId } });
      return res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
