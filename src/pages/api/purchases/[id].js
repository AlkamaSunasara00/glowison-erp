import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const item = await prisma.purchase.findUnique({ 
        where: { id },
        include: {
          supplier: true,
          items: {
            include: {
              inventoryItem: true
            }
          }
        }
      });
      if (!item) return res.status(404).json({ success: false, message: 'Not found' });
      return res.status(200).json({ success: true, data: item });
    }

    if (req.method === 'PUT') {
      // For simplicity in this v1 ERP: We allow updating basic details.
      // If they are moving from PENDING -> DELIVERED, we apply stock.
      // Modifying line items of an already DELIVERED purchase is not permitted.
      const existing = await prisma.purchase.findUnique({ 
        where: { id },
        include: { items: true }
      });

      if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

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
        items
      } = req.body;

      if (existing.status === 'RECEIVED' && status === 'PENDING') {
        return res.status(400).json({ success: false, message: 'Cannot revert a RECEIVED purchase to PENDING.' });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Reverse old stock if it was previously RECEIVED
        if (existing.status === 'RECEIVED') {
          for (const pItem of existing.items) {
            if (!pItem.inventoryItemId) continue;
            const invItem = await tx.inventoryItem.findUnique({ where: { id: pItem.inventoryItemId } });
            if (!invItem) continue;

            const newPurchaseStock = parseFloat(invItem.currentPurchaseStock) - parseFloat(pItem.purchaseQuantity);
            const newUsageStock = parseFloat(invItem.currentUsageStock) - parseFloat(pItem.usageQuantity);

            await tx.inventoryItem.update({
              where: { id: invItem.id },
              data: {
                currentPurchaseStock: Math.max(0, newPurchaseStock),
                currentUsageStock: Math.max(0, newUsageStock)
              }
            });

            await tx.stockTransaction.create({
              data: {
                inventoryItemId: invItem.id,
                type: 'OUT',
                reason: 'CORRECTION',
                referenceType: 'PURCHASE',
                referenceId: existing.id,
                purchaseQuantity: -parseFloat(pItem.purchaseQuantity),
                purchaseUnit: pItem.purchaseUnit,
                usageQuantity: -parseFloat(pItem.usageQuantity),
                usageUnit: pItem.usageUnit,
                unitCost: 0,
                totalCost: 0,
                note: `Purchase Edited (Reversal): ${existing.purchaseNumber}`
              }
            });
          }
        }

        // Delete old items and recreate
        await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });

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

        const purchase = await tx.purchase.update({
          where: { id },
          data: {
            purchaseNumber,
            referenceNumber,
            purchaseType,
            supplierId: supplierId || null,
            purchaseDate: new Date(purchaseDate),
            paymentMethod,
            paymentStatus,
            status,
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

        // If the new status is RECEIVED, apply the new items to stock
        if (status === 'RECEIVED') {
          for (const pItem of purchase.items) {
            if (!pItem.inventoryItemId) continue;
            const invItem = await tx.inventoryItem.findUnique({ where: { id: pItem.inventoryItemId } });
            if (!invItem) continue;

            const newPurchaseStock = parseFloat(invItem.currentPurchaseStock) + parseFloat(pItem.purchaseQuantity);
            const newUsageStock = parseFloat(invItem.currentUsageStock) + parseFloat(pItem.usageQuantity);
            const currentAvgCost = parseFloat(invItem.averageCost);
            
            const lineCost = parseFloat(pItem.total);
            const newLastPurchasePrice = parseFloat(pItem.purchasePrice);
            
            let newAvgCost = currentAvgCost;
            if (newUsageStock > 0) {
              const currentTotalValue = parseFloat(invItem.currentUsageStock) * currentAvgCost;
              newAvgCost = (currentTotalValue + lineCost) / newUsageStock;
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
                usageQuantity: parseFloat(pItem.usageQuantity),
                usageUnit: pItem.usageUnit,
                unitCost: parseFloat(pItem.unitCost),
                totalCost: lineCost,
                note: `Purchase Edited (New Qty): ${purchaseNumber}`
              }
            });
          }
        }

        return purchase;
      }, {
        maxWait: 15000,
        timeout: 20000
      });

      return res.status(200).json({ success: true, message: 'Updated successfully', data: result });
    }

    if (req.method === 'DELETE') {
      const existing = await prisma.purchase.findUnique({ 
        where: { id },
        include: { items: true }
      });
      if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

      await prisma.$transaction(async (tx) => {
        if (existing.status === 'RECEIVED') {
          // Reverse stock
          for (const pItem of existing.items) {
            const invItem = await tx.inventoryItem.findUnique({ where: { id: pItem.inventoryItemId } });
            if (!invItem) continue;

            const newPurchaseStock = parseFloat(invItem.currentPurchaseStock) - parseFloat(pItem.purchaseQuantity);
            const newUsageStock = parseFloat(invItem.currentUsageStock) - parseFloat(pItem.usageQuantity);

            await tx.inventoryItem.update({
              where: { id: invItem.id },
              data: {
                currentPurchaseStock: Math.max(0, newPurchaseStock),
                currentUsageStock: Math.max(0, newUsageStock)
              }
            });

            // Create negative transaction
            await tx.stockTransaction.create({
              data: {
                inventoryItemId: invItem.id,
                type: 'OUT',
                reason: 'CORRECTION',
                referenceType: 'PURCHASE',
                referenceId: existing.id,
                purchaseQuantity: -parseFloat(pItem.purchaseQuantity),
                purchaseUnit: pItem.purchaseUnit,
                usageQuantity: -parseFloat(pItem.usageQuantity),
                usageUnit: pItem.usageUnit,
                unitCost: 0,
                totalCost: 0,
                note: `Purchase Deleted: ${existing.purchaseNumber}`
              }
            });
          }
        }
        await tx.purchase.delete({ where: { id } });
      }, {
        maxWait: 15000,
        timeout: 20000
      });

      return res.status(200).json({ success: true, message: 'Deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
