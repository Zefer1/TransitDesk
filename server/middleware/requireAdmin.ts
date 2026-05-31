import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req.user;

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        res.status(403).json({ success: false, error: "Admin access required" });
        return;
    }

    next();
}