import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path'; 
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'; 
import eventRoutes from './routes/eventRoutes.js'; 
import bookingRoutes from './routes/bookingRoutes.js'; 
import statsRoutes from './routes/statsRoutes.js'; 
import adminRoutes from './routes/adminRoutes.js'; 

// Connect to database 
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static folder for uploaded files
app.use('/uploads', express.static(path.join(path.resolve(), '/uploads')));

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/events', eventRoutes); 
app.use('/api/bookings', bookingRoutes); 
app.use('/api/stats', statsRoutes); 
app.use('/api/admin', adminRoutes);

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Event Ticketing Platform API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR HANDLER:", err.stack);
  
  if (err.message === 'Images or PDFs only!') {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: err.message 
  });
});

// Start server 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});