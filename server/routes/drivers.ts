import { Router } from 'express';
import {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../data/drivers.js';

const router = Router();

// GET /api/drivers
router.get('/drivers', (req, res) => {
  const data = getAllDrivers();
  res.json({
    success: true,
    data: data,
    pagination: {
      page: 1,
      pageSize: data.length,
      total: data.length,
      totalPages: 1,
    },
  });
});

// GET /api/drivers/:id
router.get('/drivers/:id', (req, res) => {
  const id = Number(req.params.id);
  const driver = getDriverById(id);

  if (!driver) {
    res.status(404).json({ success: false, error: 'Driver not found' });
    return;
  }

  res.json({ success: true, data: driver });
});

// POST /api/drivers
router.post('/drivers', (req, res) => {
  const driver = createDriver(req.body);
  res.status(201).json({ success: true, data: driver });
});

// PATCH /api/drivers/:id
router.patch('/drivers/:id', (req, res) => {
  const id = Number(req.params.id);
  const driver = updateDriver(id, req.body);

  if (!driver) {
    res.status(404).json({ success: false, error: 'Driver not found' });
    return;
  }

  res.json({ success: true, data: driver });
});

// DELETE /api/drivers/:id
router.delete('/drivers/:id', (req, res) => {
  const id = Number(req.params.id);
  const wasDeleted = deleteDriver(id);

  if (!wasDeleted) {
    res.status(404).json({ success: false, error: 'Driver not found' });
    return;
  }

  res.json({ success: true, data: { id: id } });
});

export default router;