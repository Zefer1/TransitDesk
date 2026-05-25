import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import driversRouter from './routes/drivers.js';

const app = express();
const PORT = 3001;


app.use(express.json());


app.use(cors({ origin: 'http://localhost:5173' }));


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', driversRouter);


app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  void next;
  console.error(err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
