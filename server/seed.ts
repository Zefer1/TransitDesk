import bcrypt from 'bcrypt';
import prisma from './lib/prisma.js';

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: { role: 'SUPER_ADMIN' },
        create: {
            username: 'admin',
            password: hashedPassword,
            name: 'Administrator',
            role: 'SUPER_ADMIN',
        },
    });

    console.log('Admin user created:', admin.username);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());