import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 50, search, category, status, includeStats } = req.query;
      const skip = (page - 1) * limit;

      const where = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (category) where.category = category;
      if (status) where.status = status;

      const [total, items] = await Promise.all([
        prisma.associate.count({ where }),
        prisma.associate.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            projects: {
              select: {
                id: true,
                totalAmount: true,
                paidAmount: true,
                dueAmount: true
              }
            }
          }
        })
      ]);

      // Map items with computed fields
      const data = items.map(a => ({
        ...a,
        totalProjects: a.projects.length,
        totalWorkAmount: a.projects.reduce((sum, p) => sum + parseFloat(p.totalAmount || 0), 0),
        totalPaid: a.projects.reduce((sum, p) => sum + parseFloat(p.paidAmount || 0), 0),
        totalDue: a.projects.reduce((sum, p) => sum + parseFloat(p.dueAmount || 0), 0),
      }));

      let stats = null;
      if (includeStats === 'true') {
        const allAssociates = await prisma.associate.findMany({
          where,
          select: {
            status: true,
            projects: {
              select: { totalAmount: true, paidAmount: true, dueAmount: true }
            }
          }
        });

        let totalAssociates = allAssociates.length;
        let activeAssociates = allAssociates.filter(a => a.status === 'ACTIVE').length;
        let totalPendingAmount = 0;
        let totalWorkValue = 0;

        allAssociates.forEach(a => {
          a.projects.forEach(p => {
            totalWorkValue += parseFloat(p.totalAmount || 0);
            totalPendingAmount += parseFloat(p.dueAmount || 0);
          });
        });

        stats = { totalAssociates, activeAssociates, totalPendingAmount, totalWorkValue };
      }

      return res.status(200).json({
        success: true,
        data,
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
      const { name, phone, address, category, status, notes } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Associate name is required' });
      }

      const item = await prisma.associate.create({
        data: {
          name: name.trim(),
          phone: phone || null,
          address: address || null,
          category: category || 'INSTALLER',
          status: status || 'ACTIVE',
          notes: notes || null
        }
      });

      return res.status(201).json({ success: true, message: 'Associate created successfully', data: item });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
