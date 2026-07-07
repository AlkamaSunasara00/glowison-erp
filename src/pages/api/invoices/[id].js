import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const item = await prisma.invoice.findUnique({ 
        where: { id },
        include: { 
          items: true,
          customer: true,
          order: true
        }
      });
      if (!item) return res.status(404).json({ success: false, message: 'Not found' });
      return res.status(200).json({ success: true, data: item });
    }

    if (req.method === 'PUT') {
      const { items, ...invoiceData } = req.body;
      
      const item = await prisma.invoice.update({
        where: { id },
        data: {
          ...invoiceData,
          items: items ? {
            deleteMany: {}, // Delete all existing items
            create: items.map(item => ({
              product: item.product,
              description: item.description || null,
              quantity: Number(item.quantity) || 1,
              unit: item.unit || "Piece",
              unitPrice: Number(item.unitPrice) || 0,
              discount: Number(item.discount) || 0,
              taxRate: Number(item.taxRate) || 0,
              taxAmount: Number(item.taxAmount) || 0,
              lineTotal: Number(item.lineTotal) || 0
            }))
          } : undefined
        },
        include: { items: true, customer: true }
      });
      return res.status(200).json({ success: true, message: 'Updated successfully', data: item });
    }

    if (req.method === 'DELETE') {
      await prisma.invoice.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'Deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

export default withAuth(handler);
