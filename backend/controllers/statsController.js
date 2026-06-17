import Booking from '../models/Booking.js'; 
import Event from '../models/Event.js';

export const getOrganizerStats = async (req, res) => {
  try {
    const organizerId = req.user._id;

    // All bookings related to this organizer are retrieved from the database.
    const bookings = await Booking.find({ organizer: organizerId });

    let totalRevenue = 0;
    let ticketsSold = 0;

    // Each booking is looped to calculate Revenue and Tickets.
    bookings.forEach((booking) => {
      //Adding the 'totalAmount' in your DB to the totalRevenue. (If it's there, if not, it will be skipped)
      if (booking.totalAmount) {
        totalRevenue += Number(booking.totalAmount);
      }

      // Since 'seats' is an array, we add its length. If it's a number (for non-movie events), we add that number directly.
      if (booking.seats && Array.isArray(booking.seats)) {
        ticketsSold += booking.seats.length;
      } else if (typeof booking.seats === 'number') {
        // If 'seats' is a number (for non-movie events), add it directly
        ticketsSold += booking.seats;
      }
    });

    // The total number of active events created by the organizer is retrieved from the database.
    const activeEvents = await Event.countDocuments({ organizer: organizerId });

    // The final data package is sent to the Frontend.
    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        ticketsSold,
        activeEvents,
      },
    });
  } catch (error) {
    console.error('Error fetching organizer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error while fetching stats',
    });
  }
};