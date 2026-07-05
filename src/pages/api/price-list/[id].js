import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const item = await prisma.priceListItem.findUnique({ where: { id } });
      if (!item) return res.status(404).json({ success: false, message: 'Not found' });
      return res.status(200).json({ success: true, data: item });
    }

    if (req.method === 'PUT') {
      const item = await prisma.priceListItem.update({
        where: { id },
        data: req.body
      });
      return res.status(200).json({ success: true, message: 'Updated successfully', data: item });
    }

    if (req.method === 'DELETE') {
      await prisma.priceListItem.delete({ where: { id } });
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
