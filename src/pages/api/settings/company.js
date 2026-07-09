import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      let settings = await prisma.companySettings.findUnique({ where: { id: "1" } });
      if (!settings) {
        settings = await prisma.companySettings.create({
          data: {
            id: "1",
            companyName: "Glowison ERP",
          }
        });
      }
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  if (req.method === "PUT" || req.method === "POST") {
    try {
      const data = { ...req.body };
      delete data.id;
      delete data.updatedAt;

      const settings = await prisma.companySettings.upsert({
        where: { id: "1" },
        update: data,
        create: { id: "1", ...data },
      });
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
