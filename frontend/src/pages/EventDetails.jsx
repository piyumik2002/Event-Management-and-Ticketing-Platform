import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import { Calendar, MapPin, Loader2, Minus, Plus, Ticket, ArrowLeft, Clock } from 'lucide-react';
import axios from 'axios';

// Imported the background image pattern for consistent styling
import bgImage from '/src/assets/bg-pattern.jpg';

const EventDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const location = useLocation(); 
  console.log(location);
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1); // Number of tickets purchased (Default 1)
  
  // A state to hold the selected show time for a movie.
  const [selectedTime, setSelectedTime] = useState('');

  // Fetching event details from the API
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(response.data);
        
        // If the event is a movie and has show times, select the first time by default
        if (response.data.category === 'Movie' && response.data.showTimes?.length > 0) {
          const firstSlot = response.data.showTimes[0];
          setSelectedTime(`${firstSlot.date} | ${firstSlot.time}`);
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load event details. Please try again.');
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [id]);

  // Logic that changes the number of tickets
  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Logic that handles redirecting to booking page or login page if unauthenticated
  const handleBookingRedirect = () => {
    const loggedInUser = localStorage.getItem('user');
    
    // If the event is a movie and no show time is selected, prevent booking
    if (event.category === 'Movie' && !selectedTime) {
      alert('Please select a show time before proceeding.');
      return;
    }

    // If it's a movie, include the time in query params, otherwise handle normally
    const bookingPath = event.category === 'Movie' 
      ? `/booking/${event._id}?qty=${quantity}&time=${encodeURIComponent(selectedTime)}`
      : `/booking/${event._id}?qty=${quantity}`;

    if (!loggedInUser) {
      // If the user is not logged in, store the booking path in state and redirect to login
      navigate('/login', { 
        state: { from: bookingPath } 
      });
    } else {
      // If the user is logged in, redirect to the booking page
      navigate(bookingPath);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 p-4">
        <div className="text-center bg-red-500/10 border border-red-500/20 p-6 rounded-xl max-w-md">
          <p className="text-red-400 font-medium mb-4">{error || 'Event not found'}</p>
          <button onClick={() => navigate('/')} className="text-emerald-400 hover:underline flex items-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Dynamically calculate Total Price
  const totalPrice = event.ticketPrice * quantity;

  return (
    // Main outer wrapper with lighter background gradient to remove extreme darkness
    <div 
      className="bg-slate-950 min-h-screen text-slate-100 pb-16 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.3), rgba(2, 6, 23, 0.65)), url(${bgImage})`
      }}
    >
      {/* Top Navigation Button Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors mb-6 group bg-slate-900/60 backdrop-blur-md border border-slate-800/80 px-4 py-2 rounded-xl w-fit shadow-md"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Events</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Event Image & Full Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-md shadow-xl">
            {/* Fallback default image displayed on image load error */}
            <img 
              src={event.image || "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800"} 
              alt={event.title} 
              className="w-full h-[300px] md:h-[450px] object-cover bg-slate-950/50" 
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800";
              }}
            />
          </div>

          <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">{event.title}</h1>
              <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full shadow-sm">
                {event.category}
              </span>
            </div>
            
            {/* Quick Details Chips */}
            <div className="flex flex-wrap gap-4 pt-2 pb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/60 shadow-sm">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/60 shadow-sm">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{event.venue}</span>
              </div>
            </div>

            {/* If the event is a movie, display show times */}
            {event.category === 'Movie' && event.showTimes && event.showTimes.length > 0 && (
              <div className="space-y-3 pt-2 pb-4 border-b border-slate-800/60">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" /> Select Show Time
                </h3>
                <div className="flex flex-wrap gap-3">
                  {/* Mapping through array object slots separately as slot.date and slot.time */}
                  {event.showTimes.map((slot, index) => {
                    const slotString = `${slot.date} | ${slot.time}`;
                    return (
                      <button
                        key={slot._id || index}
                        type="button"
                        onClick={() => setSelectedTime(slotString)}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border cursor-pointer ${
                          selectedTime === slotString
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-500 shadow-sm'
                        }`}
                      >
                        {slotString}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* About Event Description */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">About This {event.category === 'Movie' ? 'Movie' : 'Event'}</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/30 p-4 rounded-xl border border-slate-800/40 shadow-inner">{event.description}</p>
            </div>
          </div>
        </div>

        {/* Ticket Pricing & Quantity Selector Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl sticky top-8 space-y-6">
            <h3 className="text-xl font-bold text-white pb-3 border-b border-slate-800/60 tracking-wide">Select Tickets</h3>
            
            {/* Price Per Ticket */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Ticket Price:</span>
              <span className="text-xl font-bold text-emerald-400 tracking-wide">LKR {event.ticketPrice}</span>
            </div>

            {/* Quantity Selector Counter */}
            <div className="flex items-center justify-between py-3 border-y border-slate-800/60">
              <span className="text-slate-300">Quantity:</span>
              <div className="flex items-center gap-4 bg-slate-950/80 rounded-xl p-1 border border-slate-800">
                <button 
                  type="button"
                  onClick={() => handleQuantityChange('decrease')}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold text-white w-6 text-center">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => handleQuantityChange('increase')}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subtotal Display */}
            <div className="flex items-center justify-between bg-slate-950/30 p-3 rounded-xl border border-slate-800/40">
              <span className="text-slate-300 font-medium">Total Amount:</span>
              <span className="text-2xl font-extrabold text-white">LKR {totalPrice}</span>
            </div>

            {/* Proceed Booking Button */}
            <button 
              type="button"
              onClick={handleBookingRedirect}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer text-base transform hover:-translate-y-0.5 duration-200"
            >
              <Ticket className="w-5 h-5" />
              Proceed to Booking
            </button>

            <p className="text-center text-xs text-slate-500">
              * Tickets are non-refundable for this specific {event.category === 'Movie' ? 'movie' : 'event'}.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetails;