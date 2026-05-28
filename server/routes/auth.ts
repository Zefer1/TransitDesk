import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { changePasswordSchema } from "../schemas/auth.schema.js";

const router = Router();

const SALT_ROUNDS = 10;

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ success: false, error: "Username and password are required" });
        return;
    }

    try {
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            res.status(401).json({ success: false, error: "Invalid credentials" });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            res.status(401).json({ success: false, error: "Invalid credentials" });
            return;
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "8h" }
        );

        res.json({
            success: true,
            data: {
                token,
                user: { id: user.id, username: user.username, name: user.name, role: user.role }
            }
        });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.patch("/change-password", requireAuth, validate(changePasswordSchema), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user!.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            res.status(400).json({ success: false, error: "Current password is incorrect" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

        res.json({ success: true });
    } catch {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;