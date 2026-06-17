import express from 'express';
import { createBooking, getBookedSeats, getOrganizerAnalytics } from '../controllers/bookingController.js';

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking & send ticket
router.post('/', createBooking);

// @route   GET /api/bookings/booked-seats/:eventId
router.get('/booked-seats/:eventId', getBookedSeats);

// ─── 📊 NEW FEATURE ROUTE: ORGANIZER DASHBOARD METRICS ───
// @route   GET /api/bookings/organizer/:organizerId
// @desc    Get recent bookings & total metrics for a specific organizer
router.get('/organizer/:organizerId', getOrganizerAnalytics);

export default router;