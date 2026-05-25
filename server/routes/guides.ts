import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/guides", requireAuth, async (req, res) => {
    try {
        const guides = await prisma.guide.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, data: guides });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.get("/guides/:id", requireAuth, async (req, res) => {
    try {
        const guide = await prisma.guide.findUnique({
            where: { id: Number(req.params.id) },
        });
        if (!guide) {
            res.status(404).json({ success: false, error: "Guide not found" });
            return;
        }
        res.json({ success: true, data: guide });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.post("/guides", requireAuth, async (req, res) => {
    try {
        const guide = await prisma.guide.create({ data: req.body });
        res.status(201).json({ success: true, data: guide });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.put("/guides/:id", requireAuth, async (req, res) => {
    try {
        const guide = await prisma.guide.update({
            where: { id: Number(req.params.id) },
            data: req.body,
        });
        res.json({ success: true, data: guide });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.delete("/guides/:id", requireAuth, async (req, res) => {
    try {
        await prisma.guide.delete({
            where: { id: Number(req.params.id) },
        });
        res.json({ success: true, data: { id: Number(req.params.id) } });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;
