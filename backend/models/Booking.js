import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    seats: {
      type: [String], 
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    qrCode: {
      type: String, 
    },
    showTime: {
      type: String,
      default: '', 
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      default: 'Confirmed', // Keeps confirmed as default when booking is successful
    },
    // Stores the unique Stripe Payment Transaction ID for tracking purposes
    paymentIntentId: {
      type: String,
      required: false, // Set to false so it doesn't break if any legacy test bookings exist
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;