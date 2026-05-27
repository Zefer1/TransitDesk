import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { serviceCreateSchema, serviceUpdateSchema, serviceStatusSchema } from "../schemas/services.schema.js";

const router = Router();

const VALID_TRANSITIONS: Record<string, string[]> = {
    scheduled: ["ongoing", "cancelled"],
    ongoing: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};

function mapToService(record: any) {
    const { vehicleSnapshot, driverSnapshot, guideSnapshot, createdById, updatedById, ...rest } = record;
    return {
        ...rest,
        vehicle: vehicleSnapshot,
        driver: driverSnapshot,
        guide: guideSnapshot ?? undefined,
    };
}

router.get("/services", requireAuth, async (req, res) => {
    try {
        const records = await prisma.service.findMany({
            orderBy: { scheduledAt: "desc" },
        });
        res.json({ success: true, data: records.map(mapToService) });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.get("/services/:id", requireAuth, async (req, res) => {
    try {
        const record = await prisma.service.findUnique({
            where: { id: Number(req.params.id) },
        });
        if (!record) {
            res.status(404).json({ success: false, error: "Service not found" });
            return;
        }
        res.json({ success: true, data: mapToService(record) });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.post("/services", requireAuth, validate(serviceCreateSchema), async (req, res) => {
    try {
        const { vehicle, driver, guide, ...rest } = req.body;
        const userId = (req as any).user.id;

        const record = await prisma.service.create({
            data: {
                ...rest,
                vehicleSnapshot: vehicle,
                driverSnapshot: driver,
                guideSnapshot: guide ?? undefined,
                createdById: userId,
            },
        });
        res.status(201).json({ success: true, data: mapToService(record) });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.put("/services/:id", requireAuth, validate(serviceUpdateSchema), async (req, res) => {
    try {
        const { vehicle, driver, guide, ...rest } = req.body;
        const userId = (req as any).user.id;

        const data: any = { ...rest, updatedById: userId };
        if (vehicle !== undefined) data.vehicleSnapshot = vehicle;
        if (driver !== undefined) data.driverSnapshot = driver;
        if (guide !== undefined) data.guideSnapshot = guide;

        const record = await prisma.service.update({
            where: { id: Number(req.params.id) },
            data,
        });
        res.json({ success: true, data: mapToService(record) });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.patch("/services/:id/status", requireAuth, validate(serviceStatusSchema), async (req, res) => {
    try {
        const { status } = req.body;
        const userId = (req as any).user.id;

        const current = await prisma.service.findUnique({
            where: { id: Number(req.params.id) },
        });
        if (!current) {
            res.status(404).json({ success: false, error: "Service not found" });
            return;
        }

        const allowed = VALID_TRANSITIONS[current.status] ?? [];
        if (!allowed.includes(status)) {
            res.status(422).json({
                success: false,
                error: `Cannot transition from '${current.status}' to '${status}'`,
            });
            return;
        }

        const record = await prisma.service.update({
            where: { id: Number(req.params.id) },
            data: { status, updatedById: userId },
        });
        res.json({ success: true, data: mapToService(record) });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.delete("/services/:id", requireAuth, async (req, res) => {
    try {
        await prisma.service.delete({
            where: { id: Number(req.params.id) },
        });
        res.json({ success: true, data: { id: Number(req.params.id) } });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;
