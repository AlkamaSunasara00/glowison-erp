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
        items
      } = req.body;

      if (existing.deliveryStatus === 'DELIVERED' && deliveryStatus === 'PENDING') {
        return res.status(400).json({ success: false, message: 'Cannot revert a DELIVERED purchase to PENDING.' });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Reverse old stock if it was previously DELIVERED
        if (existing.deliveryStatus === 'DELIVERED') {
          for (const pItem of existing.items) {
            const invItem = await tx.inventoryItem.findUnique({ where: { id: pItem.inventoryItemId } });
            if (!invItem) continue;

            const baseQtyToDeduct = parseFloat(pItem.quantity) * parseFloat(invItem.unitsPerPurchase);
            const newStockQty = parseFloat(invItem.stockQty) - baseQtyToDeduct;

            await tx.inventoryItem.update({
              where: { id: invItem.id },
              data: {
                stockQty: Math.max(0, newStockQty)
              }
            });

            await tx.stockTransaction.create({
              data: {
                inventoryItemId: invItem.id,
                type: 'ADJUSTMENT',
                quantity: -baseQtyToDeduct,
                unitPrice: 0,
                referenceId: existing.id,
                note: `Purchase Invoice Edited (Reversal): ${existing.invoiceNumber}`
              }
            });
          }
        }

        // Delete old items and recreate
        await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });

        const purchase = await tx.purchase.update({
          where: { id },
          data: {
            invoiceNumber,
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

        // If the new status is DELIVERED, apply the new items to stock
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
                note: `Purchase Invoice Edited (New Qty): ${invoiceNumber}`
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
        if (existing.deliveryStatus === 'DELIVERED') {
          // Reverse stock
          for (const pItem of existing.items) {
            const invItem = await tx.inventoryItem.findUnique({ where: { id: pItem.inventoryItemId } });
            if (!invItem) continue;

            const baseQtyToDeduct = parseFloat(pItem.quantity) * parseFloat(invItem.unitsPerPurchase);
            const newStockQty = parseFloat(invItem.stockQty) - baseQtyToDeduct;

            await tx.inventoryItem.update({
              where: { id: invItem.id },
              data: {
                stockQty: Math.max(0, newStockQty) // Prevent negative for simplicity
              }
            });

            // Create negative transaction
            await tx.stockTransaction.create({
              data: {
                inventoryItemId: invItem.id,
                type: 'ADJUSTMENT',
                quantity: -baseQtyToDeduct,
                unitPrice: 0,
                referenceId: existing.id,
                note: `Purchase Invoice Deleted: ${existing.invoiceNumber}`
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
