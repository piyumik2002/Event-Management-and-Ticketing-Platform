import express from 'express';
import { getAllUsers, approveOrganizer, deleteUser } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js'; // ලොග් වෙලා ඉන්නවද බලන්න
import { admin } from '../middlewares/adminMiddleware.js'; // Admin ද කියලා බලන්න

const router = express.Router();

// All of these routes use both 'protect' (Auth) and 'admin' (Middleware).
router.use(protect, admin);

router.get('/users', getAllUsers);

router.put('/approve-organizer/:id', approveOrganizer);

router.delete('/users/:id', deleteUser);

export default router;