import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { driverCreateSchema, driverUpdateSchema } from "../schemas/drivers.schema.js";

const router = Router();

router.get("/drivers", requireAuth, async (req, res) => {
    try {
        const drivers = await prisma.driver.findMany({ orderBy: { createdAt: "desc" } });
        res.json({ success: true, data: drivers });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.get("/drivers/:id", requireAuth, async (req, res) => {
    try {
        const driver = await prisma.driver.findUnique({ where: { id: Number(req.params.id) } });
        if (!driver) {
            res.status(404).json({ success: false, error: "Driver not found" });
            return;
        }
        res.json({ success: true, data: driver });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.post("/drivers", requireAuth, validate(driverCreateSchema), async (req, res) => {
    try {
        const driver = await prisma.driver.create({ data: req.body });
        res.status(201).json({ success: true, data: driver });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.put("/drivers/:id", requireAuth, validate(driverUpdateSchema), async (req, res) => {
    try {
        const driver = await prisma.driver.update({
            where: { id: Number(req.params.id) },
            data: req.body,
        });
        res.json({ success: true, data: driver });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.delete("/drivers/:id", requireAuth, async (req, res) => {
    try {
        await prisma.driver.delete({ where: { id: Number(req.params.id) } });
        res.json({ success: true, data: { id: Number(req.params.id) } });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;
