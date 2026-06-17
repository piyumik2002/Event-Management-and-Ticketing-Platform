import express from 'express';
import { createEvent, getEvents, getEventById } from '../controllers/eventController.js';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(createEvent);


router.route('/:id')
  .get(getEventById);

export default router;