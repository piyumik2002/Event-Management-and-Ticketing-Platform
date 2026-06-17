import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { uploadDoc } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/register', (req, res, next) => {
    uploadDoc.single('verificationDoc')(req, res, (err) => {
        if (err) {
            // If there is a problem with the file, send a 400 Error without crashing the server.
            return res.status(400).json({ message: err.message });
        }
        // If the file is correct, go to registerUser next.
        next();
    });
}, registerUser);

router.post('/login', loginUser);

export default router;