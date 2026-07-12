import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const updatedItem = await prisma.catalogItem.update({
        where: { id },
        data: req.body,
      });
      return res.status(200).json({ success: true, message: 'Catalog item updated', data: updatedItem });
    }

    if (req.method === 'DELETE') {
      await prisma.catalogItem.delete({
        where: { id },
      });
      return res.status(200).json({ success: true, message: 'Catalog item deleted successfully' });
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
