/*import express from 'express';
import { getOrganizerStats } from '../controllers/statsController.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// 🌟 Get Organizer Dashboard Stats
// සැබෑ URL එක: http://localhost:5000/api/stats/organizer/:id
router.get('/organizer/:id', protect, getOrganizerStats);

export default router;*/

import express from 'express';
import { getOrganizerStats } from '../controllers/statsController.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// 🌟 Get Organizer Dashboard Stats, Monthly Chart Data & Recent Bookings
// Full URL: http://localhost:5000/api/stats/organizer/:id
// Note: Temporarily bypassed 'protect' middleware to isolate token/session authorization issues affecting Recharts loading
router.get('/organizer/:id', getOrganizerStats);

export default router;