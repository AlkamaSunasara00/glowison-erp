import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 50, search } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [total, items, avgAggr] = await Promise.all([
        prisma.catalogItem.count({ where }),
        prisma.catalogItem.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.catalogItem.aggregate({
          where,
          _avg: { retailPrice: true }
        })
      ]);

      const categoriesCount = 0;
      const avgRetail = avgAggr._avg.retailPrice || 0;

      return res.status(200).json({
        success: true,
        data: items,
        stats: {
          totalItems: total,
          categoriesCount,
          avgRetail
        },
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    if (req.method === 'POST') {
      const item = await prisma.catalogItem.create({ data: req.body });
      return res.status(201).json({ success: true, message: 'Item added to catalog successfully', data: item });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
