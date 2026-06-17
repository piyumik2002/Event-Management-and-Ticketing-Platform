import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import { Calendar, MapPin, Loader2, Minus, Plus, Ticket, ArrowLeft, Clock } from 'lucide-react';
import axios from 'axios';

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

  // The logic that dismisses the alert and sends it directly to Login and remembers the way back
  const handleBookingRedirect = () => {
    const loggedInUser = localStorage.getItem('user');
    
    // If the event is a movie and no show time is selected, prevent booking
    if (event.category === 'Movie' && !selectedTime) {
      alert('Please select a show time before proceeding.');
      return;
    }

    //If it's a movie, the URL path is created with the time (`&time=${selectedTime}`), or in the usual way.
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

  // dynamically calculate Total Price
  const totalPrice = event.ticketPrice * quantity;

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Events</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Event Image & Full Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
            {/* If the event image is not available, display a default image onError */}
            <img 
              src={event.image || "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800"} 
              alt={event.title} 
              className="w-full h-[300px] md:h-[450px] object-cover bg-slate-950" 
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800";
              }}
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">{event.title}</h1>
              <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
                {event.category}
              </span>
            </div>
            
            {/* Quick Details Chips */}
            <div className="flex flex-wrap gap-4 pt-2 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{event.venue}</span>
              </div>
            </div>

            {/* If the event is a movie, display show times */}
            {event.category === 'Movie' && event.showTimes && event.showTimes.length > 0 && (
              <div className="space-y-3 pt-2 pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" /> Select Show Time
                </h3>
                <div className="flex flex-wrap gap-3">
                  {/*Since slot is an Object, it is called separately as slot.date and slot.time */}
                  {event.showTimes.map((slot, index) => {
                    const slotString = `${slot.date} | ${slot.time}`;
                    return (
                      <button
                        key={slot._id || index}
                        type="button"
                        onClick={() => setSelectedTime(slotString)}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border ${
                          selectedTime === slotString
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
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
              <p className="text-slate-400 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          </div>
        </div>

        {/*Ticket Pricing & Quantity Selector Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl sticky top-8 space-y-6">
            <h3 className="text-xl font-bold text-white pb-3 border-b border-slate-800">Select Tickets</h3>
            
            {/* Price Per Ticket */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ticket Price:</span>
              <span className="text-xl font-bold text-emerald-400">LKR {event.ticketPrice}</span>
            </div>

            {/* Quantity Selector Counter */}
            <div className="flex items-center justify-between py-3 border-y border-slate-800">
              <span className="text-slate-400">Quantity:</span>
              <div className="flex items-center gap-4 bg-slate-800 rounded-xl p-1 border border-slate-700">
                <button 
                  type="button"
                  onClick={() => handleQuantityChange('decrease')}
                  className="p-2 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold text-white w-6 text-center">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => handleQuantityChange('increase')}
                  className="p-2 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subtotal Display */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Total Amount:</span>
              <span className="text-2xl font-extrabold text-white">LKR {totalPrice}</span>
            </div>

            {/* Proceed Booking Button */}
            <button 
              type="button"
              onClick={handleBookingRedirect}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer text-base"
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