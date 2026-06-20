import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; 
import Home from './pages/Home';   
import Login from './pages/Login'; 
import EventDetails from './pages/EventDetails';
import SeatBooking from './pages/SeatBooking';
import Checkout from './pages/Checkout';
import OrganizerDashboard from './pages/OrganizerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import ManageEvents from './components/ManageEvents'; // Imported the ManageEvents component
import AboutUs from './pages/AboutUs'; // Imported the AboutUs component for the new page

// 1. Direct Import of the image to guarantee Vite bundles it properly
import bgImage from '/src/assets/bg-pattern.jpg';

function App() {
  return (
    <Router>
      {/* 2. Set the background image inline with a lightened dark gradient layer on top.
           Changed opacity from 0.9/0.95 to 0.75/0.85 so your background image pattern 
           is much more visible and beautiful!
      */}
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed text-slate-100 flex flex-col"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.75), rgba(2, 6, 23, 0.45)), url(${bgImage})`
        }}
      >
        <Navbar /> 
        
        <main className="grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} /> 
            
            {/* New Public Route for About Us Page */}
            <Route path="/about-us" element={<AboutUs />} />
            
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/booking/:id" element={<SeatBooking />} />
            <Route path="/checkout/:id" element={<Checkout />} /> 
            
            {/* Protected Route for Organizer Dashboard */}
            <Route 
              path="/organizer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* New Protected Route for Managing Events */}
            <Route 
              path="/organizer/manage-events" 
              element={
                <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                  <ManageEvents />
                </ProtectedRoute>
              } 
            />

            {/* Protected Route for Admin Dashboard */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} /> 
            <Route path="/register" element={<Login />} /> 
          </Routes>
        </main>

        <Footer /> 
      </div>
    </Router>
  );
}

export default App;

