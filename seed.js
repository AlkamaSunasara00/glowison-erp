require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('glowison@123', 10);

  const existing = await prisma.user.findFirst();
  let admin;

  if (existing) {
    admin = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: 'Glowison Admin',
        email: 'glowison@gmail.com',
        passwordHash,
        role: 'ADMIN',
      }
    });
    console.log('Admin updated');
  } else {
    admin = await prisma.user.create({
      data: {
        name: 'Glowison Admin',
        email: 'glowison@gmail.com',
        passwordHash,
        role: 'ADMIN',
      },
    });
  }

  console.log('Admin seeded:', admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
