import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const item = await prisma.inventoryItem.findUnique({
        where: { id },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      if (!item) return res.status(404).json({ success: false, message: 'Not found' });
      return res.status(200).json({ success: true, data: item });
    }

    if (req.method === 'PUT') {
      const { 
        currentPurchaseStock, currentUsageStock, openingPurchaseStock, openingUsageStock, ...updateData 
      } = req.body;
      
      if (updateData.conversionFactor) {
        updateData.conversionFactor = parseFloat(updateData.conversionFactor);
      }
      if (updateData.minimumStock) updateData.minimumStock = parseFloat(updateData.minimumStock);
      if (updateData.maximumStock) updateData.maximumStock = parseFloat(updateData.maximumStock);
      if (updateData.reorderLevel) updateData.reorderLevel = parseFloat(updateData.reorderLevel);
      if (updateData.lastPurchasePrice) {
        const lastPurchasePrice = updateData.lastPurchasePrice;
        const conversionFactor = updateData.conversionFactor;
        updateData.lastPurchasePrice = parseFloat(lastPurchasePrice || 0);
        updateData.averageCost = lastPurchasePrice ? parseFloat(lastPurchasePrice) / parseFloat(conversionFactor || 1) : 0;
      }

      const item = await prisma.inventoryItem.update({
        where: { id },
        data: updateData
      });
      return res.status(200).json({ success: true, message: 'Updated successfully', data: item });
    }

    if (req.method === 'DELETE') {
      await prisma.inventoryItem.delete({ where: { id } });
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
