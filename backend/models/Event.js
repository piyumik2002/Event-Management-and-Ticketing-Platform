import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
    },
    description: {
      type: String,
      required: [true, 'Please add an event description'],
    },
    date: {
      type: Date,
      required: [true, 'Please add an event date'],
    },
    venue: {
      type: String,
      required: [true, 'Please add a venue'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['Music', 'Sports', 'Theater', 'Movie', 'Other'],
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Please add a ticket price'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Please add total available seats'],
    },
    
    availableSeats: {
      type: Number,
      default: function () {
        return this.totalSeats;
      }
    },
    showTimes: [
      {
        date: { type: String, required: true },
        time: { type: String, required: true }
      }
    ],
    image: {
      type: String,
      default: 'https://via.placeholder.com/400x250',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;