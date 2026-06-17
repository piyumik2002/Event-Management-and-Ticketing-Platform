import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { generateQRAndSendEmail } from '../utils/ticketHelper.js';
import Stripe from 'stripe';

// Initialize Stripe instance using the secret key from the environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create a new booking & send ticket (With Stripe Payment Integration)
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  // The frontend correctly retrieves the data 'user', 'event', 'showTime', and the new 'paymentMethodId'.
  const { user: userId, event: eventId, seats, totalAmount, showTime, paymentMethodId } = req.body;

  try {
    // Checking if the event and user exist in the database before creating the booking
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      return res.status(404).json({ message: 'Event or User not found' });
    }

    // 🌟 [STRIPE INTEGRATION] - Handle secure payment transaction
    // Stripe charges in cents/smallest currency unit. For LKR: 3500.00 becomes 3500 * 100
    const amountInCents = Math.round(totalAmount * 100);

    // Create and confirm the payment intent immediately
    const payment = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'lkr', // Sri Lankan Rupee
      payment_method: paymentMethodId,
      confirm: true, // Auto-confirm the payment
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // API-based integration requires avoiding redirects
      },
    });

    // If the payment charge fails, stop the booking process immediately
    if (payment.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment failed! Transaction declined.' });
    }

    // Preparing the booking (Payment Succeeded! Safe to save the booking data)
    const booking = new Booking({
      user: userId,
      event: eventId,
      organizer: event.organizer, // 🌟 [PRESERVED] - Organizer ID linked to the booking for dashboard updates
      seats,
      totalAmount,
      showTime, // If it's a movie, the selected show time (Show Time) is added to the Schema here.
      paymentIntentId: payment.id, // Store the payment ID to track transactions
      status: 'Confirmed'
    });

    // Generate the QR Code and send it via email.
    const qrCodeBase64 = await generateQRAndSendEmail(booking, user.email, event.title);
    
    // The generated QR code is entered into the booking itself and saved to the database.
    booking.qrCode = qrCodeBase64;
    
    // The latest data saved to the database along with the QR (Updated Booking Object)
    // It is retrieved again into the variable 'savedBooking'.
    const savedBooking = await booking.save();

    // The QR Code sends the 'savedBooking' to the Frontend.
    res.status(201).json({
      message: 'Payment Successful! Booking confirmed and ticket email sent.',
      booking: savedBooking,
    });
  } catch (error) {
    console.error("Booking Error:", error.message);
    res.status(500).json({ message: `Payment processing or booking failed: ${error.message}` });
  }
};

// @desc    Get all booked seats for a specific event and show time
// @route   GET /api/bookings/booked-seats/:eventId
export const getBookedSeats = async (req, res) => {
  const { eventId } = req.params;
  const { time } = req.query; 

  try {
    // Only confirmed bookings that have occurred for this specific Event ID and the selected Show Time will be retrieved from the database.
    const bookings = await Booking.find({
      event: eventId,
      showTime: time || '', 
      status: 'Confirmed' 
    });

    // All the seats (Arrays) in each booking are added to a single list (Array) called 'bookedSeats'.
    let bookedSeats = [];
    bookings.forEach(booking => {
      bookedSeats = bookedSeats.concat(booking.seats);
    });

    // The bookedSeats Array, which is required to disable seats in the Seat Map on the frontend, is sent as a response.
    res.status(200).json({ bookedSeats });
  } catch (error) {
    console.error("Error fetching booked seats:", error);
    res.status(500).json({ message: 'Server error while fetching booked seats' });
  }
};

// ─── 📊 NEW FEATURE: ORGANIZER DASHBOARD METRICS & RECENT BOOKINGS ───
// @desc    Get recent bookings and analytics metrics for a specific organizer
// @route   GET /api/bookings/organizer/:organizerId
export const getOrganizerAnalytics = async (req, res) => {
  try {
    const { organizerId } = req.params;

    // 1. Fetch all confirmed bookings belonging to this specific organizer
    const bookings = await Booking.find({ organizer: organizerId, status: 'Confirmed' })
      .populate('event', 'title price')
      .populate('user', 'name email')
      .sort({ createdAt: -1 }); // Sort by newest first

    // 2. Calculate Total Revenue and Total Tickets Sold from database data
    let totalRevenue = 0;
    let ticketsSold = 0;

    bookings.forEach(booking => {
      totalRevenue += booking.totalAmount || 0;
      ticketsSold += booking.seats ? booking.seats.length : 0;
    });

    // 3. Count total active events created by this organizer
    const activeEventsCount = await Event.countDocuments({ organizer: organizerId });

    // 4. Extract only the last 5 bookings for the dashboard live activity feed table
    const recentBookings = bookings.slice(0, 5);

    // 5. Send optimized analytics structure to the frontend dashboard
    res.status(200).json({
      success: true,
      metrics: {
        totalRevenue,
        ticketsSold,
        activeEventsCount
      },
      recentBookings
    });
  } catch (error) {
    console.error("Analytics Error:", error.message);
    res.status(500).json({ success: false, message: `Server Error fetching analytics: ${error.message}` });
  }
};