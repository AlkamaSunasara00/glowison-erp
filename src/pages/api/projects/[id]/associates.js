import prisma from '@/lib/prisma';
import { assertServerEnv } from '@/lib/server-env';

export default async function handler(req, res) {
  assertServerEnv();

  const { id: projectId } = req.query;

  if (req.method === 'POST') {
    try {
      const { associateId, role } = req.body;
      const projectAssociate = await prisma.projectAssociate.create({
        data: {
          projectId,
          associateId,
          role,
        }
      });
      return res.status(201).json({ success: true, data: projectAssociate });
    } catch (error) {
      console.error('Add associate error:', error);
      return res.status(500).json({ success: false, message: 'Failed to add associate to project' });
    }
  }

  if (req.method === 'PUT') {
    // Expect associateId in the body to identify which mapping to update
    try {
      const { associateId, totalAmount, paidAmount, dueAmount, paymentStatus, role } = req.body;
      const projectAssociate = await prisma.projectAssociate.update({
        where: {
          projectId_associateId: {
            projectId,
            associateId
          }
        },
        data: {
          totalAmount,
          paidAmount,
          dueAmount,
          paymentStatus,
          role
        }
      });
      return res.status(200).json({ success: true, data: projectAssociate });
    } catch (error) {
      console.error('Update associate error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update associate on project' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { associateId } = req.body;
      await prisma.projectAssociate.delete({
        where: {
          projectId_associateId: {
            projectId,
            associateId
          }
        }
      });
      return res.status(200).json({ success: true, message: 'Associate removed from project' });
    } catch (error) {
      console.error('Remove associate error:', error);
      return res.status(500).json({ success: false, message: 'Failed to remove associate' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
