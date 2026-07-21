import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search, status, source } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (status && status !== 'all') where.status = status;
      if (source && source !== 'all') where.source = source;

      const [total, leads, statsAggr] = await Promise.all([
        prisma.lead.count({ where }),
        prisma.lead.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.lead.groupBy({
          by: ['status'],
          where,
          _count: { _all: true }
        })
      ]);

      const newLeads = statsAggr.find(s => s.status === 'NEW')?._count._all || 0;
      const wonLeads = statsAggr.find(s => s.status === 'CLOSED_WON')?._count._all || 0;
      const lostLeads = statsAggr.find(s => s.status === 'CLOSED_LOST')?._count._all || 0;
      
      const openLeads = statsAggr
        .filter(s => s.status !== 'CLOSED_WON' && s.status !== 'CLOSED_LOST')
        .reduce((sum, s) => sum + s._count._all, 0);

      return res.status(200).json({
        success: true,
        data: leads,
        stats: {
          totalLeads: total,
          newLeads,
          wonLeads,
          lostLeads,
          openLeads
        },
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    if (req.method === 'POST') {
      const lead = await prisma.lead.create({ data: req.body });
      return res.status(201).json({ success: true, message: 'Lead added successfully', data: lead });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
