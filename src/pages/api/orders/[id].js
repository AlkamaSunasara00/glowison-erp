import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const order = await prisma.order.findUnique({
        where: { id },
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
      await prisma.orderItem.deleteMany({ where: { orderId: id } });
      const order = await prisma.order.update({
        where: { id },
        data: {
          ...orderData,
          items: {
            create: items
          }
        },
        include: { items: true, customer: true }
      });
      return res.status(200).json({ success: true, message: 'Order updated successfully', data: order });
    }

    if (req.method === 'DELETE') {
      await prisma.order.delete({ where: { id } });
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
