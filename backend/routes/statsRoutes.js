import express from 'express';
import { getOrganizerStats } from '../controllers/statsController.js';
import { protect } from '../middlewares/authMiddleware.js'; // ඔයා ලොගින් ආරක්ෂාවට දාලා තියෙන middleware එක

const router = express.Router();

// Protect middleware is installed so that only an organizer can see stats.
router.get('/organizer-stats', protect, getOrganizerStats);

export default router;