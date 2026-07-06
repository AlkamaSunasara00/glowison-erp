import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      // Customize where clause if needed

      const [total, items] = await Promise.all([
        prisma.inventoryItem.count({ where }),
        prisma.inventoryItem.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
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
      const { openingStock, lastPurchasePrice, ...rest } = req.body;
      
      const item = await prisma.inventoryItem.create({ 
        data: {
          ...rest,
          openingStock: openingStock || 0,
          stockQty: openingStock || 0,
          lastPurchasePrice: lastPurchasePrice || 0,
          averageCost: lastPurchasePrice || 0
        }
      });
      
      if (openingStock && Number(openingStock) > 0) {
        await prisma.stockTransaction.create({
          data: {
            inventoryItemId: item.id,
            type: 'OPENING_STOCK',
            quantity: Number(openingStock),
            unitPrice: lastPurchasePrice ? Number(lastPurchasePrice) : 0,
            note: 'Initial opening stock'
          }
        });
      }
      return res.status(201).json({ success: true, message: 'Created successfully', data: item });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
