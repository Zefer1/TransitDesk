import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { vehicleCreateSchema, vehicleUpdateSchema } from "../schemas/vehicles.schema.js";
import { hasActiveServicesForVehicle } from "../lib/scheduling.js";

const router = Router();

router.get("/vehicles", requireAuth, async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" } });
        res.json({ success: true, data: vehicles });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.get("/vehicles/:id", requireAuth, async (req, res) => {
    try {
        const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(req.params.id) } });
        if (!vehicle) {
            res.status(404).json({ success: false, error: "Vehicle not found" });
            return;
        }
        res.json({ success: true, data: vehicle });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.post("/vehicles", requireAuth, validate(vehicleCreateSchema), async (req, res) => {
    try {
        const vehicle = await prisma.vehicle.create({ data: req.body });
        res.status(201).json({ success: true, data: vehicle });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.put("/vehicles/:id", requireAuth, validate(vehicleUpdateSchema), async (req, res) => {
    try {
        if (req.body.active === false) {
            const inUse = await hasActiveServicesForVehicle(Number(req.params.id));
            if (inUse) {
                res.status(422).json({
                    success: false,
                    error: "Cannot deactivate a vehicle that is assigned to a scheduled or ongoing service.",
                });
                return;
            }
        }

        const vehicle = await prisma.vehicle.update({
            where: { id: Number(req.params.id) },
            data: req.body,
        });
        res.json({ success: true, data: vehicle });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.delete("/vehicles/:id", requireAuth, async (req, res) => {
    try {
        await prisma.vehicle.delete({ where: { id: Number(req.params.id) } });
        res.json({ success: true, data: { id: Number(req.params.id) } });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;
