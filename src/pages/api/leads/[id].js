import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const lead = await prisma.lead.findUnique({ where: { id } });
      if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
      return res.status(200).json({ success: true, data: lead });
    }

    if (req.method === 'PUT') {
      const lead = await prisma.lead.update({
        where: { id },
        data: req.body
      });
      return res.status(200).json({ success: true, message: 'Lead updated successfully', data: lead });
    }

    if (req.method === 'DELETE') {
      await prisma.lead.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'Lead deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
