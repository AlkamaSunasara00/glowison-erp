import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const item = await prisma.supplier.findUnique({
        where: { id },
        include: {
          purchases: {
            orderBy: { purchaseDate: 'desc' },
            take: 10
          }
        }
      });
      if (!item) return res.status(404).json({ success: false, message: 'Supplier not found' });
      return res.status(200).json({ success: true, data: item });
    }

    if (req.method === 'PUT') {
      const {
        name,
        companyName,
        contactPerson,
        mobile,
        alternateMobile,
        email,
        gstNumber,
        panNumber,
        address,
        city,
        state,
        country,
        pincode,
        paymentTerms,
        openingBalance,
        status,
        notes
      } = req.body;

      const item = await prisma.supplier.update({
        where: { id },
        data: {
          name,
          companyName,
          contactPerson,
          mobile,
          alternateMobile,
          email,
          gstNumber,
          panNumber,
          address,
          city,
          state,
          country,
          pincode,
          paymentTerms: paymentTerms || 'Cash',
          openingBalance: openingBalance ? parseFloat(openingBalance) : 0,
          status: status || 'ACTIVE',
          notes
        }
      });
      return res.status(200).json({ success: true, message: 'Supplier updated successfully', data: item });
    }

    if (req.method === 'DELETE') {
      await prisma.supplier.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
