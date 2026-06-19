import express from 'express';
import { 
    createEvent, 
    getEvents, 
    getEventById, 
    updateEvent,  
    deleteEvent,
    getOrganizerEvents // Imported the new controller function
} from '../controllers/eventController.js';
import { protect } from '../middlewares/authMiddleware.js'; // Imported auth middleware to check user login session

const router = express.Router();

// Base route: '/'
router.route('/')
  .get(getEvents)
  .post(protect, createEvent); // Protected to ensure only logged-in users can create events

// Specific route for organizer's own events
// CRITICAL: This must be placed ABOVE the '/:id' route to prevent routing conflicts
router.route('/organizer/my-events')
  .get(protect, getOrganizerEvents);

// Route with ID: '/:id'
router.route('/:id')
  .get(getEventById)
  .put(protect, updateEvent)     // Protected to check if the user owns this specific event before updating
  .delete(protect, deleteEvent); // Protected to check if the user owns this specific event before deleting

export default router;