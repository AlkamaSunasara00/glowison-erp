import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const customer = await prisma.customer.findUnique({ 
        where: { id },
        include: {
          orders: { orderBy: { createdAt: 'desc' }, take: 5 },
          invoices: { orderBy: { createdAt: 'desc' }, take: 5 }
        }
      });
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
      return res.status(200).json({ success: true, data: customer });
    }

    if (req.method === 'PUT') {
      const customer = await prisma.customer.update({
        where: { id },
        data: req.body
      });
      return res.status(200).json({ success: true, message: 'Customer updated successfully', data: customer });
    }

    if (req.method === 'DELETE') {
      await prisma.customer.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
