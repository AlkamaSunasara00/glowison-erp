import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search, category, includeStats } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (category) {
        where.category = category;
      }

      const [total, items] = await Promise.all([
        prisma.priceListItem.count({ where }),
        prisma.priceListItem.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        })
      ]);

      let stats = null;
      if (includeStats === 'true') {
        const allItems = await prisma.priceListItem.findMany({
          where,
          select: { category: true, clientPrice: true, b2bPrice: true, price: true }
        });
        const totalItems = allItems.length;
        const uniqueCategories = new Set(allItems.map(i => i.category)).size;
        const avgClientPrice = totalItems > 0 ? allItems.reduce((acc, curr) => acc + Number(curr.clientPrice || curr.price || 0), 0) / totalItems : 0;
        const avgB2BPrice = totalItems > 0 ? allItems.reduce((acc, curr) => acc + Number(curr.b2bPrice || 0), 0) / totalItems : 0;
        
        stats = { totalItems, uniqueCategories, avgClientPrice, avgB2BPrice };
      }

      return res.status(200).json({
        success: true,
        data: items,
        stats,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    if (req.method === 'POST') {
      const item = await prisma.priceListItem.create({ data: req.body });
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
