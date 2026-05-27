import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';
import driversRouter from './routes/drivers.js';
import authRouter from './routes/auth.js';
import vehiclesRouter from './routes/vehicles.js';
import guidesRouter from './routes/guides.js';
import servicesRouter from './routes/services.js';
import usersRouter from './routes/users.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api', driversRouter);
app.use('/api', vehiclesRouter);
app.use('/api', guidesRouter);
app.use('/api', servicesRouter);
app.use('/api', usersRouter);

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    void next;
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
