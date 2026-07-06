import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { search } = req.query;
      
      const where = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { mobile: { contains: search, mode: 'insensitive' } },
        ]
      } : {};

      const items = await prisma.supplier.findMany({
        where,
        orderBy: { name: 'asc' }
      });

      return res.status(200).json({
        success: true,
        data: items
      });
    }

    if (req.method === 'POST') {
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

      const item = await prisma.supplier.create({
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
      return res.status(201).json({ success: true, message: 'Supplier created successfully', data: item });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
