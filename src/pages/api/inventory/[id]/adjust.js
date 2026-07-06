import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'POST') {
      const { quantity, note } = req.body;
      
      if (typeof quantity !== 'number' || isNaN(quantity)) {
        return res.status(400).json({ success: false, message: 'Invalid quantity' });
      }

      const item = await prisma.inventoryItem.findUnique({ where: { id } });
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }

      await prisma.stockTransaction.create({
        data: {
          inventoryItemId: id,
          type: 'ADJUSTMENT',
          quantity: quantity,
          unitPrice: item.averageCost || item.lastPurchasePrice || 0,
          note: note || 'Manual adjustment'
        }
      });

      const updatedItem = await prisma.inventoryItem.update({
        where: { id },
        data: {
          stockQty: {
            increment: quantity
          }
        }
      });

      return res.status(200).json({ success: true, message: 'Stock adjusted successfully', data: updatedItem });
    }

    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
