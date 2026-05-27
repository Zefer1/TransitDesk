import bcrypt from 'bcrypt';
import prisma from './lib/prisma.js';

async function main() {
    await prisma.service.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.guide.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.create({
        data: {
            username: 'admin',
            password: hashedPassword,
            name: 'Administrator',
            role: 'ADMIN',
        },
    });

    await prisma.driver.create({
        data: {
            name: 'Test Driver',
            gender: 'Male',
            license: 'D',
            entitledToDrive: 'Van',
            phone: '+351912345678',
        },
    });

    await prisma.vehicle.create({
        data: {
            licensePlate: 'AA-00-BB',
            brand: 'Toyota',
            model: 'HiAce',
            year: 2020,
            passengerCapacity: 8,
            type: 'Van',
            color: 'White',
        },
    });

    await prisma.guide.create({
        data: {
            name: 'Test Guide',
            gender: 'Female',
            languages: ['Portuguese', 'English'],
        },
    });

    console.log('Test seed complete.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
