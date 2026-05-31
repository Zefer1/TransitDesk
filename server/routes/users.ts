import { Router } from "express";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { userCreateSchema, userUpdateSchema } from "../schemas/users.schema.js";

const router = Router();

const SALT_ROUNDS = 10;

router.get("/users", requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: { id: true, username: true, name: true, role: true, createdAt: true, updatedAt: true },
        });
        res.json({ success: true, data: users });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.post("/users", requireAuth, requireAdmin, validate(userCreateSchema), async (req, res) => {
    try {
        const { username, password, name, role } = req.body;

        if (role === "SUPER_ADMIN" && req.user!.role !== "SUPER_ADMIN") {
            res.status(403).json({ success: false, error: "Only a Super Admin can create a Super Admin." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await prisma.user.create({
            data: { username, password: hashedPassword, name, role },
            select: { id: true, username: true, name: true, role: true, createdAt: true, updatedAt: true },
        });
        res.status(201).json({ success: true, data: user });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.patch("/users/:id", requireAuth, requireAdmin, validate(userUpdateSchema), async (req, res) => {
    try {
        const { name, password } = req.body;
        const data: Prisma.UserUncheckedUpdateInput = {};

        if (name !== undefined) data.name = name;
        if (password !== undefined) data.password = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await prisma.user.update({
            where: { id: Number(req.params.id) },
            data,
            select: { id: true, username: true, name: true, role: true, createdAt: true, updatedAt: true },
        });
        res.json({ success: true, data: user });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);

        const target = await prisma.user.findUnique({ where: { id } });
        if (!target) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        if (target.role === "SUPER_ADMIN") {
            res.status(403).json({ success: false, error: "A Super Admin cannot be deleted." });
            return;
        }

        await prisma.user.delete({ where: { id } });
        res.json({ success: true, data: { id } });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;
