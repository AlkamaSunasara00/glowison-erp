import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, customer: true }
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.customerId) return res.status(400).json({ success: false, message: 'Order must have a customer to generate an invoice' });

    const invoice = await prisma.invoice.create({
      data: {
        customerId: order.customerId,
        orderId: order.id,
        total: order.total,
        status: 'DRAFT',
        items: order.items.map(item => ({
          product: item.product,
          qty: item.qty,
          unitPrice: item.unitPrice,
          size: item.size
        }))
      }
    });

    return res.status(201).json({ success: true, message: 'Invoice generated successfully', data: invoice });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
