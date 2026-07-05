const prisma = require('./server/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log('Admin already exists');
    return;
  }

  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Glowison Admin',
      email: 'admin@glowison.com',
      passwordHash,
      role: 'ADMIN'
    }
  });

  console.log('Admin seeded:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
