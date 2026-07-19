import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    // Support lookups by orderNumber string (ORD-190726-1, GLW-5, ORD-000005) or by UUID id
    const isOrderNum = typeof id === 'string' && (id.toLowerCase().startsWith('ord-') || id.toLowerCase().startsWith('glw-'));
    let whereClause;
    if (isOrderNum) {
      // Try as a string first (new format: ORD-190726-1)
      whereClause = { orderNumber: id };
      // If it's an old GLW- format, convert to the stored integer string
      if (id.toLowerCase().startsWith('glw-')) {
        whereClause = { orderNumber: id.replace(/glw-/i, '') };
      }
    } else {
      whereClause = { id };
    }

    if (req.method === 'GET') {
      const order = await prisma.order.findUnique({
        where: whereClause,
        include: {
          customer: true,
          items: true,
          invoices: true
        }
      });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.status(200).json({ success: true, data: order });
    }

    if (req.method === 'PUT') {
      const { items, ...orderData } = req.body;
      const existingOrder = await prisma.order.findUnique({ where: whereClause, select: { id: true } });
      if (!existingOrder) return res.status(404).json({ success: false, message: 'Order not found' });
      
      const updateData = { ...orderData };
      if (items !== undefined) {
        await prisma.orderItem.deleteMany({ where: { orderId: existingOrder.id } });
        updateData.items = { create: items };
      }

      const order = await prisma.order.update({
        where: { id: existingOrder.id },
        data: updateData,
        include: { items: true, customer: true }
      });
      return res.status(200).json({ success: true, message: 'Order updated successfully', data: order });
    }

    if (req.method === 'DELETE') {
      await prisma.order.delete({ where: whereClause });
      return res.status(200).json({ success: true, message: 'Order deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
