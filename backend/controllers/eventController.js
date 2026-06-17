import Event from '../models/Event.js';

// @desc    Create a new event
// @route   POST /api/events
export const createEvent = async (req, res) => {
  //[UPDATED] - The two new data items, showTimes and availableSeats, sent from the frontend have been destroyed.
  const { 
    title, 
    description, 
    date, 
    venue, 
    category, 
    ticketPrice, 
    totalSeats, 
    availableSeats,
    showTimes,
    image, 
    organizer 
  } = req.body;

  try {
    //Setting a fallback if the organizer ID is not received from the frontend or from the middleware (in case of testing with Postman).
    const eventOrganizer = organizer || req.user?._id;

    if (!eventOrganizer) {
      return res.status(400).json({ message: 'Organizer ID is required to create an event.' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      category,
      ticketPrice: Number(ticketPrice), 
      totalSeats: Number(totalSeats),
      //If it's a movie, the seats and showtimes sent from the frontend are saved to the database.
      availableSeats: Number(availableSeats) || Number(totalSeats), // If available seats are not sent, the total seats value will be the same.
      showTimes: showTimes || [], // If it's not a movie, an empty array will be saved.
      image: image || '',
      organizer: eventOrganizer, // The correct ID of the organizer who created the event goes here.
    });

    // When successfully created, the JSON is sent to the Frontend.
    res.status(201).json(event);
  } catch (error) {
    //If Mongoose validation errors or other errors occur, the message is passed to the frontend correctly.
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate('organizer', 'name email'); // Take along the organizer's details.
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
export const getEventById = async (req, res) => {
  try {
    // Searches for the event by the ID from the URL, and also gets the organizer's details.
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};