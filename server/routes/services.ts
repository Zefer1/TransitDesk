import { Router } from "express";
import { Prisma, type Service } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { serviceCreateSchema, serviceUpdateSchema, serviceStatusSchema } from "../schemas/services.schema.js";
import {
    findOverlapConflicts,
    findOngoingConflicts,
    overlapMessage,
    ongoingMessage,
    snapshotId,
} from "../lib/scheduling.js";

const router = Router();

const VALID_TRANSITIONS: Record<string, string[]> = {
    scheduled: ["ongoing", "cancelled"],
    ongoing: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};

const includeUsers = {
    createdBy: { select: { id: true, name: true } },
    updatedBy: { select: { id: true, name: true } },
};

type ServiceWithUsers = Service & {
    createdBy: { id: number; name: string } | null;
    updatedBy: { id: number; name: string } | null;
};

function mapToService(record: ServiceWithUsers) {
    const { vehicleSnapshot, driverSnapshot, guideSnapshot, createdById, updatedById, createdBy, updatedBy, ...rest } = record;
    return {
        ...rest,
        vehicle: vehicleSnapshot,
        driver: driverSnapshot,
        guide: guideSnapshot ?? undefined,
        createdBy,
        updatedBy,
    };
}

router.get("/services", requireAuth, async (req, res) => {
    try {
        const records = await prisma.service.findMany({
            orderBy: { scheduledAt: "desc" },
            include: includeUsers,
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
            include: includeUsers,
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
        const userId = req.user!.id;

        if (rest.passengerQuantity > vehicle.passengerCapacity) {
            res.status(422).json({
                success: false,
                error: `Passenger quantity (${rest.passengerQuantity}) exceeds the vehicle capacity (${vehicle.passengerCapacity}).`,
            });
            return;
        }

        if (vehicle.active === false) {
            res.status(422).json({
                success: false,
                error: "This vehicle is inactive and cannot be assigned to a service.",
            });
            return;
        }

        const resourceIds = {
            vehicleId: snapshotId(vehicle),
            driverId: snapshotId(driver),
            guideId: snapshotId(guide),
        };

        const overlaps = await findOverlapConflicts({
            ...resourceIds,
            scheduledAt: new Date(rest.scheduledAt),
            durationMin: rest.estimatedDurationMin ?? null,
        });
        if (overlaps.length > 0) {
            res.status(422).json({ success: false, error: overlapMessage(overlaps) });
            return;
        }

        if (rest.status === "ongoing") {
            const ongoing = await findOngoingConflicts(resourceIds);
            if (ongoing.length > 0) {
                res.status(422).json({ success: false, error: ongoingMessage(ongoing) });
                return;
            }
        }

        const record = await prisma.service.create({
            data: {
                ...rest,
                vehicleSnapshot: vehicle,
                driverSnapshot: driver,
                guideSnapshot: guide ?? undefined,
                createdById: userId,
            },
            include: includeUsers,
        });
        res.status(201).json({ success: true, data: mapToService(record) });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.put("/services/:id", requireAuth, validate(serviceUpdateSchema), async (req, res) => {
    try {
        const { vehicle, driver, guide, ...rest } = req.body;
        const userId = req.user!.id;
        const id = Number(req.params.id);

        const current = await prisma.service.findUnique({ where: { id } });
        if (!current) {
            res.status(404).json({ success: false, error: "Service not found" });
            return;
        }

        const changingAssignment = rest.passengerQuantity !== undefined || vehicle !== undefined;
        if (changingAssignment) {
            const effectivePassengers = rest.passengerQuantity ?? current.passengerQuantity;
            const effectiveCapacity = (vehicle ?? (current.vehicleSnapshot as { passengerCapacity?: number }))?.passengerCapacity;
            if (effectivePassengers != null && effectiveCapacity != null && effectivePassengers > effectiveCapacity) {
                res.status(422).json({
                    success: false,
                    error: `Passenger quantity (${effectivePassengers}) exceeds the vehicle capacity (${effectiveCapacity}).`,
                });
                return;
            }
        }

        if (vehicle && vehicle.active === false) {
            res.status(422).json({
                success: false,
                error: "This vehicle is inactive and cannot be assigned to a service.",
            });
            return;
        }

        const data: Prisma.ServiceUncheckedUpdateInput = { ...rest, updatedById: userId };
        if (vehicle !== undefined) data.vehicleSnapshot = vehicle;
        if (driver !== undefined) data.driverSnapshot = driver;
        if (guide !== undefined) data.guideSnapshot = guide;

        const effectiveStatus = rest.status ?? current.status;
        if (effectiveStatus === "scheduled" || effectiveStatus === "ongoing") {
            const overlaps = await findOverlapConflicts({
                excludeId: id,
                scheduledAt: new Date(rest.scheduledAt ?? current.scheduledAt),
                durationMin:
                    rest.estimatedDurationMin !== undefined
                        ? rest.estimatedDurationMin
                        : current.estimatedDurationMin,
                vehicleId: snapshotId(vehicle ?? current.vehicleSnapshot),
                driverId: snapshotId(driver ?? current.driverSnapshot),
                guideId: snapshotId(guide ?? current.guideSnapshot),
            });
            if (overlaps.length > 0) {
                res.status(422).json({ success: false, error: overlapMessage(overlaps) });
                return;
            }
        }

        const record = await prisma.service.update({
            where: { id },
            data,
            include: includeUsers,
        });
        res.json({ success: true, data: mapToService(record) });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.patch("/services/:id/status", requireAuth, validate(serviceStatusSchema), async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.user!.id;

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

        if (status === "ongoing") {
            const ongoing = await findOngoingConflicts({
                excludeId: current.id,
                vehicleId: snapshotId(current.vehicleSnapshot),
                driverId: snapshotId(current.driverSnapshot),
                guideId: snapshotId(current.guideSnapshot),
            });
            if (ongoing.length > 0) {
                res.status(422).json({ success: false, error: ongoingMessage(ongoing) });
                return;
            }
        }

        const record = await prisma.service.update({
            where: { id: Number(req.params.id) },
            data: { status, updatedById: userId },
            include: includeUsers,
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
