import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search, status, includeStats } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { mobile: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (status) {
        where.status = status;
      }

      const [total, items] = await Promise.all([
        prisma.supplier.count({ where }),
        prisma.supplier.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { name: 'asc' }
        })
      ]);

      let stats = null;
      if (includeStats === 'true') {
        const allItems = await prisma.supplier.findMany({
          where,
          select: { status: true }
        });
        const activeCount = allItems.filter(s => s.status === 'ACTIVE').length;
        const inactiveCount = allItems.filter(s => s.status === 'INACTIVE').length;
        stats = { totalSuppliers: allItems.length, activeCount, inactiveCount };
      }

      return res.status(200).json({
        success: true,
        data: items,
        stats,
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
