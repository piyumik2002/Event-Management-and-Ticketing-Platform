import express from 'express';
import { createBooking, getBookedSeats, getOrganizerAnalytics } from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js'; 
import Booking from '../models/Booking.js'; 
import mongoose from 'mongoose'; 

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


// ─── 📈 7 DAYS REVENUE ANALYTICS FOR CHART (UPDATED & FIXED) ───
// @route   GET /api/bookings/revenue-analytics
// @desc    Get last 7 days revenue structured for Recharts dashboard
router.get('/revenue-analytics', protect, async (req, res) => {
    try {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        // Collecting income by day
        const revenueData = await Booking.aggregate([
            {
                $match: {
                    // Filtering bookings only for logged-in organizers
                    organizer: new mongoose.Types.ObjectId(req.user._id),
                    createdAt: { $gte: last7Days }, 
                    
                    status: 'Confirmed' 
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
                    
                    totalRevenue: { $sum: "$totalAmount" } 
                }
            },
            { $sort: { _id: 1 } } 
        ]);

        // Recharts
        const formattedData = revenueData.map(item => ({
            date: item._id,
            revenue: item.totalRevenue
        }));

        res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;