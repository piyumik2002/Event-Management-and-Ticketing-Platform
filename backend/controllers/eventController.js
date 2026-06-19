import Event from '../models/Event.js';

// @desc    Create a new event
// @route   POST /api/events
export const createEvent = async (req, res) => {
  // The two new data items, showTimes and availableSeats, sent from the frontend have been destroyed.
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
    // Setting a fallback if the organizer ID is not received from the frontend or from the middleware (in case of testing with Postman).
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
      // If it's a movie, the seats and showtimes sent from the frontend are saved to the database.
      availableSeats: Number(availableSeats) || Number(totalSeats), // If available seats are not sent, the total seats value will be the same.
      showTimes: showTimes || [], // If it's not a movie, an empty array will be saved.
      image: image || '',
      organizer: eventOrganizer, // The correct ID of the organizer who created the event goes here.
    });

    // When successfully created, the JSON is sent to the Frontend.
    res.status(201).json(event);
  } catch (error) {
    // If Mongoose validation errors or other errors occur, the message is passed to the frontend correctly.
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

// =========================================================================
// Update and Delete Functions for event management
// =========================================================================

// @desc    Get events created ONLY by the logged-in organizer
// @route   GET /api/events/organizer/my-events
export const getOrganizerEvents = async (req, res) => {
  try {
    // Fetch only the events where the organizer ID matches the logged-in user's ID
    const organizerId = req.user?._id;
    
    if (!organizerId) {
      return res.status(401).json({ message: 'Not authorized, login session identity missing' });
    }

    const events = await Event.find({ organizer: organizerId }).populate('organizer', 'name email');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Security Check: Verify if the logged-in user is the actual creator of this event
    const userId = req.user?._id?.toString();
    const organizerId = event.organizer?.toString();

    if (userId !== organizerId) {
      return res.status(403).json({ message: 'Access Denied: You can only update events created by yourself.' });
    }

    // (showTimes, availableSeats )
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } 
    ).populate('organizer', 'name email');

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Security Check: Verify if the logged-in user is the actual creator of this event
    const userId = req.user?._id?.toString();
    const organizerId = event.organizer?.toString();

    if (userId !== organizerId) {
      return res.status(403).json({ message: 'Access Denied: You can only delete events created by yourself.' });
    }

    // delete event from Database 
    await event.deleteOne();
    res.json({ message: 'Event removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};