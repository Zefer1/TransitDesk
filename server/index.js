// Entry point for the TransitDesk Express backend.
// Phase 1: basic server with one health-check route.
// Run with: node index.js (from inside the server/ folder)

import express from 'express';
import cors from 'cors';

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
