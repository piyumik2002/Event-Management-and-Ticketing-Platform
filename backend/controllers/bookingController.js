import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { generateQRAndSendEmail } from '../utils/ticketHelper.js';

// @desc    Create a new booking & send ticket
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  //The frontend correctly retrieves the data 'user', 'event', and 'showTime'.
  const { user: userId, event: eventId, seats, totalAmount, showTime } = req.body;

  try {
    // Checking if the event and user exist in the database before creating the booking
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      return res.status(404).json({ message: 'Event or User not found' });
    }

    //Preparing the booking (I also added the organizer ID from the event here to update the dashboard) )
    const booking = new Booking({
      user: userId,
      event: eventId,
      organizer: event.organizer, // 🌟 [FIXED] - Organizer ID එක බුකින් එකටම ලින්ක් කළා!
      seats,
      totalAmount,
      showTime, //If it's a movie, the selected show time (Show Time) is added to the Schema here.
    });

    // Generate the QR Code and send it via email.
    const qrCodeBase64 = await generateQRAndSendEmail(booking, user.email, event.title);
    
    //The generated QR code is entered into the booking itself and saved to the database.
    booking.qrCode = qrCodeBase64;
    
    // The latest data saved to the database along with the QR (Updated Booking Object)
    // It is retrieved again into the variable 'savedBooking'.
    const savedBooking = await booking.save();

    // The QR Code sends the 'savedBooking' to the Frontend.
    res.status(201).json({
      message: 'Booking successful! Ticket email sent.',
      booking: savedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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