import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 50, search } = req.query;
      const skip = (page - 1) * limit;
      
      const where = search ? {
        OR: [
          { purchaseNumber: { contains: search, mode: 'insensitive' } },
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
        const purchase = await tx.purchase.create({
          data: {
            purchaseNumber: purchaseNumber || `PUR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
