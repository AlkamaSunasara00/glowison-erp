const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Altering column type...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ALTER COLUMN "orderNumber" TYPE TEXT USING "orderNumber"::text;`);
    console.log("Successfully altered orderNumber to text.");
  } catch (e) {
    console.error("Error altering column:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
