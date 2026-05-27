import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = (result.error as ZodError).issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));
            res.status(422).json({ success: false, errors });
            return;
        }
        req.body = result.data;
        next();
    };
}
