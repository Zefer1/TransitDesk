// In-memory store for drivers.
// Mirrors the frontend mock seed data exactly.
// Will be replaced by Prisma DB calls in Phase 3.

export interface Driver {
  id: number;
  name: string;
  gender: string;
  license: string;
  entitledToDrive: string;
  phone?: string;
}

const initialDrivers: Driver[] = [
  {
    id: 1,
    name: "Joao Silva",
    gender: "Male",
    license: "D",
    entitledToDrive: "Van",
    phone: "+351910000000",
  },
  {
    id: 2,
    name: "Pedro Costa",
    gender: "Male",
    license: "D1",
    entitledToDrive: "Minibus",
    phone: "+351910000001",
  },
  {
    id: 3,
    name: "Ana Freitas",
    gender: "Female",
    license: "B",
    entitledToDrive: "Light Vehicle",
    phone: "+351910000002",
  },
];

// The live store — mutated by create/update/delete operations
let driversStore: Driver[] = [...initialDrivers];

export function getAllDrivers(): Driver[] {
  return driversStore;
}

export function getDriverById(id: number): Driver | undefined {
  return driversStore.find((d) => d.id === id);
}

export function createDriver(payload: Omit<Driver, 'id'>): Driver {
  const id = driversStore.length
    ? Math.max(...driversStore.map((d) => d.id)) + 1
    : 1;
  const driver: Driver = { id, ...payload };
  driversStore = [driver, ...driversStore];
  return driver;
}

export function updateDriver(id: number, payload: Partial<Omit<Driver, 'id'>>): Driver | undefined {
  const index = driversStore.findIndex((d) => d.id === id);
  if (index < 0) return undefined;
  driversStore[index] = { ...driversStore[index], ...payload };
  return driversStore[index];
}

export function deleteDriver(id: number): boolean {
  const exists = driversStore.some((d) => d.id === id);
  driversStore = driversStore.filter((d) => d.id !== id);
  return exists;
}
