// Entry point for the TransitDesk Express backend.
// Phase 1 complete: server running, routes extracted into server/routes/.
// Run with: npm run dev (from inside the server/ folder)

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import driversRouter from './routes/drivers.js';

const app = express();
const PORT = 3001;

// Parse incoming JSON request bodies (needed for POST/PUT routes later)
app.use(express.json());

// Allow requests from the Vite dev server running on localhost:5173
app.use(cors({ origin: 'http://localhost:5173' }));

// Health check — hit this to confirm the server is running
// GET http://localhost:3001/api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', driversRouter);

// Global error handler — catches any error passed to next(err)
// Must have 4 parameters so Express recognises it as an error handler
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  void next;
  console.error(err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
