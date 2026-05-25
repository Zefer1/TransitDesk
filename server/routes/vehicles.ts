import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/vehicles", requireAuth, async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, data: vehicles });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.get("/vehicles/:id", requireAuth, async (req, res) => {
    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: Number(req.params.id) },
        });
        if (!vehicle) {
            res.status(404).json({ success: false, error: "Vehicle not found" });
            return;
        }
        res.json({ success: true, data: vehicle });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.post("/vehicles", requireAuth, async (req, res) => {
    try {
        const vehicle = await prisma.vehicle.create({ data: req.body });
        res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.put("/vehicles/:id", requireAuth, async (req, res) => {
    try {
        const vehicle = await prisma.vehicle.update({
            where: { id: Number(req.params.id) },
            data: req.body,
        });
        res.json({ success: true, data: vehicle });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.delete("/vehicles/:id", requireAuth, async (req, res) => {
    try {
        await prisma.vehicle.delete({
            where: { id: Number(req.params.id) },
        });
        res.json({ success: true, data: { id: Number(req.params.id) } });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;