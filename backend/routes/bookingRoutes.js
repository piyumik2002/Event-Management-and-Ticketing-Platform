import express from 'express';
import { createBooking, getBookedSeats } from '../controllers/bookingController.js';

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking & send ticket
router.post('/', createBooking);

// @route   GET /api/bookings/booked-seats/:eventId
router.get('/booked-seats/:eventId', getBookedSeats);

export default router;