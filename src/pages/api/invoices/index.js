import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      if (search) {
        where.invoiceNumber = { contains: search, mode: 'insensitive' };
      }

      const [total, items] = await Promise.all([
        prisma.invoice.count({ where }),
        prisma.invoice.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: { customer: true, order: true }
        })
      ]);

      return res.status(200).json({
        success: true,
        data: items,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    if (req.method === 'POST') {
      const { items, ...invoiceData } = req.body;
      
      // Auto-generate Invoice Number
      const lastInvoice = await prisma.invoice.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      
      let nextNumber = 1;
      if (lastInvoice && lastInvoice.invoiceNumber) {
        const lastNumMatch = lastInvoice.invoiceNumber.match(/\d+$/);
        if (lastNumMatch) {
          nextNumber = parseInt(lastNumMatch[0]) + 1;
        }
      }
      
      const invoiceNumber = `INV-${String(nextNumber).padStart(6, '0')}`;
      
      // Prepare invoice data
      const dataToSave = {
        ...invoiceData,
        invoiceNumber,
        items: items && items.length > 0 ? {
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
      };

      const invoice = await prisma.invoice.create({ 
        data: dataToSave,
        include: { items: true, customer: true }
      });
      
      return res.status(201).json({ success: true, message: 'Created successfully', data: invoice });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

export default withAuth(handler);
