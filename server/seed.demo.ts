import bcrypt from 'bcrypt';
import prisma from './lib/prisma.js';

function at(daysFromNow: number, hour: number, minute = 0): Date {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, minute, 0, 0);
    return d;
}

function json(value: unknown) {
    return JSON.parse(JSON.stringify(value));
}

async function main() {
    await prisma.service.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.guide.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            password: hashedPassword,
            name: 'Administrator',
            role: 'SUPER_ADMIN',
        },
    });

    const sprinter = await prisma.vehicle.create({
        data: { licensePlate: 'AA-12-BB', brand: 'Mercedes', model: 'Sprinter', year: 2022, passengerCapacity: 16, type: 'Minibus', color: 'White' },
    });
    const hiace = await prisma.vehicle.create({
        data: { licensePlate: 'CC-34-DD', brand: 'Toyota', model: 'HiAce', year: 2020, passengerCapacity: 8, type: 'Van', color: 'Silver' },
    });
    const coach = await prisma.vehicle.create({
        data: { licensePlate: 'EE-56-FF', brand: 'Volvo', model: '9700', year: 2019, passengerCapacity: 50, type: 'Bus', color: 'Blue' },
    });
    const sedan = await prisma.vehicle.create({
        data: { licensePlate: 'GG-78-HH', brand: 'Mercedes', model: 'E-Class', year: 2023, passengerCapacity: 4, type: 'Taxi', color: 'Black' },
    });
    const suv = await prisma.vehicle.create({
        data: { licensePlate: 'II-90-JJ', brand: 'Nissan', model: 'Qashqai', year: 2021, passengerCapacity: 5, type: 'SUV', color: 'Grey' },
    });
    await prisma.vehicle.create({
        data: { licensePlate: 'KK-12-LL', brand: 'Ford', model: 'Transit', year: 2017, passengerCapacity: 9, type: 'Van', color: 'White', active: false, notes: 'Off the road for maintenance.' },
    });

    const joao = await prisma.driver.create({
        data: { name: 'João Silva', gender: 'Male', license: 'D', entitledToDrive: 'Bus', phone: '+351912345001' },
    });
    const maria = await prisma.driver.create({
        data: { name: 'Maria Santos', gender: 'Female', license: 'D1', entitledToDrive: 'Minibus', phone: '+351912345002' },
    });
    const carlos = await prisma.driver.create({
        data: { name: 'Carlos Pereira', gender: 'Male', license: 'B', entitledToDrive: 'Van', phone: '+351912345003' },
    });
    const ana = await prisma.driver.create({
        data: { name: 'Ana Costa', gender: 'Female', license: 'B', entitledToDrive: 'SUV', phone: '+351912345004' },
    });
    const rui = await prisma.driver.create({
        data: { name: 'Rui Tavares', gender: 'Male', license: 'B', entitledToDrive: 'Taxi', phone: '+351912345005' },
    });

    const sofia = await prisma.guide.create({
        data: { name: 'Sofia Almeida', gender: 'Female', languages: ['Portuguese', 'English', 'Spanish'], phone: '+351913000001' },
    });
    const miguel = await prisma.guide.create({
        data: { name: 'Miguel Rocha', gender: 'Male', languages: ['Portuguese', 'English', 'French'], phone: '+351913000002' },
    });
    const rita = await prisma.guide.create({
        data: { name: 'Rita Fernandes', gender: 'Female', languages: ['Portuguese', 'German'], phone: '+351913000003' },
    });

    const services = [
        {
            scheduledAt: at(2, 10, 0), description: 'Funchal to Santana Tour', agencyName: 'Madeira Explorer',
            stops: ['Funchal', 'Faial', 'Santana'], distanceKm: 41, estimatedDurationMin: 75, status: 'scheduled', type: 'Tour',
            passengerQuantity: 12, vehicleSnapshot: sprinter, driverSnapshot: maria, guideSnapshot: sofia, notes: 'Hotel pickup at 08:30.',
        },
        {
            scheduledAt: at(1, 8, 0), description: 'Airport Transfer', agencyName: 'Atlantic Travel',
            stops: ['Madeira Airport', 'Funchal Hotel'], distanceKm: 18, estimatedDurationMin: 30, status: 'scheduled', type: 'Transfer',
            passengerQuantity: 6, vehicleSnapshot: hiace, driverSnapshot: carlos,
        },
        {
            scheduledAt: new Date(Date.now() - 60 * 60 * 1000), description: 'West Island Full Day', agencyName: 'Madeira Explorer',
            stops: ['Funchal', 'Câmara de Lobos', 'Porto Moniz', 'São Vicente'], distanceKm: 120, estimatedDurationMin: 480, status: 'ongoing', type: 'Full Day',
            passengerQuantity: 40, vehicleSnapshot: coach, driverSnapshot: joao, guideSnapshot: miguel,
        },
        {
            scheduledAt: at(-1, 9, 0), description: 'Hotel to Marina', stops: ['Savoy Hotel', 'Funchal Marina'],
            distanceKm: 5, estimatedDurationMin: 15, status: 'completed', type: 'Taxi',
            passengerQuantity: 3, vehicleSnapshot: sedan, driverSnapshot: rui,
        },
        {
            scheduledAt: at(-3, 14, 0), description: 'Cabo Girão Half Day', agencyName: 'Atlantic Travel',
            stops: ['Funchal', 'Cabo Girão', 'Câmara de Lobos'], distanceKm: 25, estimatedDurationMin: 240, status: 'completed', type: 'Half Day',
            passengerQuantity: 4, vehicleSnapshot: suv, driverSnapshot: ana, guideSnapshot: rita,
        },
        {
            scheduledAt: at(-2, 7, 0), description: 'City Shuttle', stops: ['City Center', 'Madeira Airport'],
            distanceKm: 18, estimatedDurationMin: 30, status: 'cancelled', type: 'Shuttle',
            passengerQuantity: 8, vehicleSnapshot: hiace, driverSnapshot: carlos, notes: 'Cancelled: client rescheduled for next week.',
        },
        {
            scheduledAt: at(3, 16, 30), description: 'Evening Airport Transfer', agencyName: 'Atlantic Travel',
            stops: ['Madeira Airport', 'Funchal'], distanceKm: 18, estimatedDurationMin: 30, status: 'scheduled', type: 'Transfer',
            passengerQuantity: 2, vehicleSnapshot: sedan, driverSnapshot: rui,
        },
        {
            scheduledAt: at(5, 9, 30), description: 'Pico do Arieiro Sunrise', agencyName: 'Madeira Explorer',
            stops: ['Funchal', 'Poiso', 'Pico do Arieiro'], distanceKm: 35, estimatedDurationMin: 180, status: 'scheduled', type: 'Tour',
            passengerQuantity: 14, vehicleSnapshot: sprinter, driverSnapshot: maria, guideSnapshot: sofia,
        },
    ];

    for (const service of services) {
        await prisma.service.create({
            data: {
                ...service,
                vehicleSnapshot: json(service.vehicleSnapshot),
                driverSnapshot: json(service.driverSnapshot),
                guideSnapshot: service.guideSnapshot ? json(service.guideSnapshot) : undefined,
                createdById: admin.id,
            },
        });
    }

    console.log('Demo seed complete.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
