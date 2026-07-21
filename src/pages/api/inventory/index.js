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

      let stats = null;
      if (req.query.includeStats === 'true') {
        const allItems = await prisma.inventoryItem.findMany({
          where,
          select: {
            currentPurchaseStock: true,
            minimumStock: true,
            lastPurchasePrice: true,
            averageCost: true
          }
        });
        let lowStockCount = 0;
        let totalValue = 0;
        allItems.forEach(i => {
          const pStock = Number(i.currentPurchaseStock || 0);
          const minStock = Number(i.minimumStock || 0);
          if (pStock <= minStock) lowStockCount++;
          const price = Number(i.lastPurchasePrice || i.averageCost || 0);
          totalValue += pStock * price;
        });
        stats = { totalItems: allItems.length, lowStockCount, totalValue };
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
      const { openingPurchaseStock, openingUsageStock, conversionFactor, lastPurchasePrice, ...rest } = req.body;
      
      const item = await prisma.inventoryItem.create({ 
        data: {
          ...rest,
          conversionFactor: parseFloat(conversionFactor || 1),
          currentPurchaseStock: parseFloat(openingPurchaseStock || 0),
          currentUsageStock: parseFloat(openingUsageStock || 0),
          lastPurchasePrice: parseFloat(lastPurchasePrice || 0),
          averageCost: lastPurchasePrice ? parseFloat(lastPurchasePrice) / parseFloat(conversionFactor || 1) : 0
        }
      });
      
      if ((openingPurchaseStock && Number(openingPurchaseStock) > 0) || (openingUsageStock && Number(openingUsageStock) > 0)) {
        await prisma.stockTransaction.create({
          data: {
            inventoryItemId: item.id,
            type: 'IN',
            reason: 'MANUAL_ADJUSTMENT',
            referenceType: 'MANUAL',
            purchaseQuantity: Number(openingPurchaseStock || 0),
            purchaseUnit: rest.purchaseUnit,
            usageQuantity: Number(openingUsageStock || 0),
            usageUnit: rest.usageUnit,
            unitCost: lastPurchasePrice ? Number(lastPurchasePrice) / parseFloat(conversionFactor || 1) : 0,
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
