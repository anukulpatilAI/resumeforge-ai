import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'anukul.patil.seo@gmail.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log(`Admin user already exists: ${adminEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash('admin123', 12);

  const user = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      fullName: 'Anukul Patil',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log(`Created admin user: ${user.email} (ID: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
