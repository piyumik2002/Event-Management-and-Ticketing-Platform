import Booking from '../models/Booking.js'; 
import Event from '../models/Event.js';

export const getOrganizerStats = async (req, res) => {
  try {
    // Extract organizer ID from the authenticated user object
    const organizerId = req.user._id;

    // All bookings related to this organizer are retrieved from the database.
    // Populated 'user' and 'event' details for the Recent Bookings live table feed.
    const bookings = await Booking.find({ organizer: organizerId })
      .populate('user', 'name email')
      .populate('event', 'title')
      .sort({ createdAt: -1 }); // Sort by latest to easily slice recent bookings

    let totalRevenue = 0;
    let ticketsSold = 0;

    // Each booking is looped to calculate Revenue and Tickets
    bookings.forEach((booking) => {
      let currentBookingRevenue = 0;
      let currentBookingTickets = 0;

      // 🚨 [PRESERVED FIELD] - Database එකේ තියෙන්නේ paidAmount නිසා totalAmount වෙනුවට paidAmount භාවිත කළා
      if (booking.paidAmount) {
        currentBookingRevenue = Number(booking.paidAmount);
        totalRevenue += currentBookingRevenue;
      } else if (booking.totalAmount) { 
        // ආරක්ෂාවට (Fallback) totalAmount තිබුණොත් ඒකත් එකතු වෙන්න හැදුවා
        currentBookingRevenue = Number(booking.totalAmount);
        totalRevenue += currentBookingRevenue;
      }

      // Since 'seats' is an array, we add its length. If it's a number (for non-movie events), we add that number directly.
      if (booking.seats && Array.isArray(booking.seats)) {
        currentBookingTickets = booking.seats.length;
        ticketsSold += currentBookingTickets;
      } else if (typeof booking.seats === 'number') {
        currentBookingTickets = booking.seats;
        ticketsSold += currentBookingTickets;
      }
    });

    // Slice the first 5 entries from the sorted bookings array for the Recent Bookings feed
    const recentBookings = bookings.slice(0, 5);

    // The total number of active events created by the organizer is retrieved from the database.
    const activeEvents = await Event.countDocuments({ organizer: organizerId });

    // The final data package is sent to the Frontend matching the custom UI structure (Without monthlyData)
    res.status(200).json({
      success: true,
      metrics: {
        totalRevenue,
        ticketsSold,
        activeEventsCount: activeEvents,
      },
      recentBookings,   // Array containing the 5 most recent ticket transactions
    });
  } catch (error) {
    console.error('Error fetching organizer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error while fetching stats',
    });
  }
};