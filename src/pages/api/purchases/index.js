import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 50, search } = req.query;
      const skip = (page - 1) * limit;
      
      const where = search ? {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { supplier: { name: { contains: search, mode: 'insensitive' } } },
        ]
      } : {};

      const [total, items] = await Promise.all([
        prisma.purchase.count({ where }),
        prisma.purchase.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { purchaseDate: 'desc' },
          include: {
            supplier: true,
            items: {
              include: {
                inventoryItem: true
              }
            }
          }
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
      const {
        invoiceNumber,
        supplierId,
        purchaseDate,
        paymentMethod,
        paymentStatus,
        deliveryStatus,
        invoiceUrl,
        notes,
        subtotal,
        discount,
        tax,
        shippingCharges,
        grandTotal,
        paidAmount,
        dueAmount,
        items // Array of items
      } = req.body;

      const result = await prisma.$transaction(async (tx) => {
        // 1. Create Purchase and PurchaseItems
        const purchase = await tx.purchase.create({
          data: {
            invoiceNumber: invoiceNumber || `PINV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            supplierId,
            purchaseDate: new Date(purchaseDate),
            paymentMethod,
            paymentStatus,
            deliveryStatus,
            invoiceUrl,
            notes,
            subtotal: parseFloat(subtotal || 0),
            discount: parseFloat(discount || 0),
            tax: parseFloat(tax || 0),
            shippingCharges: parseFloat(shippingCharges || 0),
            grandTotal: parseFloat(grandTotal || 0),
            paidAmount: parseFloat(paidAmount || 0),
            dueAmount: parseFloat(dueAmount || 0),
            items: {
              create: items.map(item => ({
                inventoryItemId: item.inventoryItemId,
                purchaseUnit: item.purchaseUnit,
                quantity: parseFloat(item.quantity),
                unitPrice: parseFloat(item.unitPrice),
                discount: parseFloat(item.discount || 0),
                tax: parseFloat(item.tax || 0),
                total: parseFloat(item.total)
              }))
            }
          },
          include: { items: true }
        });

        // 2. If DELIVERED, update Inventory
        if (deliveryStatus === 'DELIVERED') {
          for (const pItem of purchase.items) {
            const invItem = await tx.inventoryItem.findUnique({ where: { id: pItem.inventoryItemId } });
            if (!invItem) continue;

            const newBaseQty = parseFloat(pItem.quantity) * parseFloat(invItem.unitsPerPurchase);
            const currentStock = parseFloat(invItem.stockQty);
            const currentAvgCost = parseFloat(invItem.averageCost);
            
            const lineCost = parseFloat(pItem.total);
            const newStockQty = currentStock + newBaseQty;
            const newLastPurchasePrice = newBaseQty > 0 ? (lineCost / newBaseQty) : 0;
            
            let newAvgCost = currentAvgCost;
            if (newStockQty > 0) {
              const currentTotalValue = currentStock * currentAvgCost;
              newAvgCost = (currentTotalValue + lineCost) / newStockQty;
            }

            await tx.inventoryItem.update({
              where: { id: invItem.id },
              data: {
                stockQty: newStockQty,
                lastPurchasePrice: newLastPurchasePrice,
                averageCost: newAvgCost
              }
            });

            await tx.stockTransaction.create({
              data: {
                inventoryItemId: invItem.id,
                type: 'PURCHASE',
                quantity: newBaseQty,
                unitPrice: newLastPurchasePrice,
                referenceId: purchase.id,
                note: `Purchase Invoice: ${invoiceNumber}`
              }
            });
          }
        }

        return purchase;
      }, {
        maxWait: 15000,
        timeout: 20000
      });

      return res.status(201).json({ success: true, message: 'Purchase recorded successfully', data: result });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
