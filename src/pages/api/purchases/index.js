import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { generateDocumentNumber } from '@/lib/generateNumber';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search, paymentStatus, status, month } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      if (search) {
        where.OR = [
          { purchaseNumber: { contains: search, mode: 'insensitive' } },
          { supplier: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }
      if (paymentStatus && paymentStatus !== 'all') {
        where.paymentStatus = paymentStatus;
      }
      if (status && status !== 'all') {
        where.status = status;
      }
      if (month) {
        const startDate = new Date(`${month}-01T00:00:00.000Z`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        where.purchaseDate = {
          gte: startDate,
          lt: endDate,
        };
      }

      const [total, items, pendingPaid, paid, pendingDeliveryCount] = await Promise.all([
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
        }),
        prisma.purchase.aggregate({
          where: { ...where, paymentStatus: 'PENDING' },
          _sum: { grandTotal: true }
        }),
        prisma.purchase.aggregate({
          where: { ...where, paymentStatus: 'PAID' },
          _sum: { grandTotal: true }
        }),
        prisma.purchase.count({
          where: { ...where, status: 'PENDING' }
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
        },
        stats: {
          totalPurchases: total,
          totalPaid: Number(paid._sum.grandTotal || 0),
          totalOutstanding: Number(pendingPaid._sum.grandTotal || 0),
          pendingDeliveries: pendingDeliveryCount
        }
      });
    }

    if (req.method === 'POST') {
      const {
        purchaseNumber,
        referenceNumber,
        purchaseType,
        supplierId,
        purchaseDate,
        paymentMethod,
        paymentStatus,
        status, // replaces deliveryStatus
        invoiceUrl,
        notes,
        subtotal,
        discount,
        tax,
        shippingCharges,
        grandTotal,
        paidAmount,
        dueAmount,
        paidBy,
        paymentMethodOther,
        items // Array of items
      } = req.body;

      const result = await prisma.$transaction(async (tx) => {
        // 0. Auto-create Inventory Items for manual entries
        const processedItems = [];
        for (const item of items) {
          if (!item.inventoryItemId && item.itemName) {
            const newItem = await tx.inventoryItem.create({
              data: {
                name: item.itemName,
                category: 'RAW_MATERIAL',
                purchaseUnit: item.purchaseUnit || 'Piece',
                usageUnit: item.usageUnit || 'Piece',
                conversionFactor: (parseFloat(item.usageQuantity) / parseFloat(item.purchaseQuantity)) || 1,
                lastPurchasePrice: parseFloat(item.purchasePrice || 0),
                averageCost: parseFloat(item.unitCost || 0),
                currentPurchaseStock: 0,
                currentUsageStock: 0
              }
            });
            item.inventoryItemId = newItem.id;
            item.itemName = null;
          }
          processedItems.push(item);
        }

        // 1. Create Purchase and PurchaseItems
        const generatedPurchaseNumber = await generateDocumentNumber(prisma.purchase, 'PUR');
        const purchase = await tx.purchase.create({
          data: {
            purchaseNumber: generatedPurchaseNumber,
            referenceNumber,
            purchaseType: purchaseType || 'CASH',
            supplierId: supplierId || null,
            purchaseDate: new Date(purchaseDate),
            paymentMethod: paymentMethod || 'CASH',
            paymentStatus: paymentStatus || 'PENDING',
            status: status || 'PENDING',
            invoiceUrl,
            notes,
            subtotal: parseFloat(subtotal || 0),
            discount: parseFloat(discount || 0),
            tax: parseFloat(tax || 0),
            shippingCharges: parseFloat(shippingCharges || 0),
            grandTotal: parseFloat(grandTotal || 0),
            paidAmount: parseFloat(paidAmount || 0),
            dueAmount: parseFloat(dueAmount || 0),
            paidBy: paidBy || 'Company',
            paymentMethodOther: paymentMethod === 'OTHER' ? paymentMethodOther : null,
            items: {
              create: processedItems.map(item => ({
                inventoryItemId: item.inventoryItemId || null,
                itemName: item.inventoryItemId ? null : item.itemName,
                purchaseQuantity: parseFloat(item.purchaseQuantity),
                purchaseUnit: item.purchaseUnit,
                usageQuantity: parseFloat(item.usageQuantity),
                usageUnit: item.usageUnit,
                purchasePrice: parseFloat(item.purchasePrice),
                unitCost: parseFloat(item.unitCost),
                discount: parseFloat(item.discount || 0),
                tax: parseFloat(item.tax || 0),
                total: parseFloat(item.total)
              }))
            }
          },
          include: { items: true }
        });

        // 2. If RECEIVED, update Inventory
        if (status === 'RECEIVED') {
          for (const pItem of purchase.items) {
            if (!pItem.inventoryItemId) continue;
            
            const invItem = await tx.inventoryItem.findUnique({ where: { id: pItem.inventoryItemId } });
            if (!invItem) continue;

            const newPurchaseStock = parseFloat(invItem.currentPurchaseStock) + parseFloat(pItem.purchaseQuantity);
            const newUsageStock = parseFloat(invItem.currentUsageStock) + (parseFloat(pItem.purchaseQuantity) * parseFloat(invItem.conversionFactor));
            const currentAvgCost = parseFloat(invItem.averageCost);
            
            const lineCost = parseFloat(pItem.total);
            const newLastPurchasePrice = parseFloat(pItem.purchasePrice);
            
            let newAvgCost = currentAvgCost;
            if (newPurchaseStock > 0) {
              // Calculate avg cost based on purchase stock
              const currentTotalValue = parseFloat(invItem.currentPurchaseStock) * currentAvgCost;
              newAvgCost = (currentTotalValue + lineCost) / newPurchaseStock;
            }

            await tx.inventoryItem.update({
              where: { id: invItem.id },
              data: {
                currentPurchaseStock: newPurchaseStock,
                currentUsageStock: newUsageStock,
                lastPurchasePrice: newLastPurchasePrice,
                averageCost: newAvgCost
              }
            });

            await tx.stockTransaction.create({
              data: {
                inventoryItemId: invItem.id,
                type: 'IN',
                reason: 'PURCHASE',
                referenceType: 'PURCHASE',
                referenceId: purchase.id,
                purchaseQuantity: parseFloat(pItem.purchaseQuantity),
                purchaseUnit: pItem.purchaseUnit,
                usageQuantity: parseFloat(pItem.purchaseQuantity) * parseFloat(invItem.conversionFactor),
                usageUnit: pItem.usageUnit,
                unitCost: parseFloat(pItem.unitCost),
                totalCost: lineCost,
                note: `Purchase Number: ${purchase.purchaseNumber}`
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
