import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Armchair, CheckCircle2, Clock } from 'lucide-react'; 
import axios from 'axios';

const SeatBooking = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Takes the quantity and selected show time from the URL query params
  const queryParams = new URLSearchParams(location.search);
  const allowedSeatsCount = parseInt(queryParams.get('qty')) || 1;
  const selectedTime = queryParams.get('time') || ''; 

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]); // User selectable seats
  const [dbBookedSeats, setDbBookedSeats] = useState([]); // Already booked seats from the database

  // 40 seats in a hall (like A1, A2...)
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 8;

  useEffect(() => {
    const fetchEventForBooking = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(response.data);

        // If it's a movie, this will be related to the relevant Event ID and the selected time (Show Time). 
        // Already booked seats for the selected time will be fetched from the backend.
        try {
          const bookedResponse = await axios.get(
            `http://localhost:5000/api/bookings/booked-seats/${id}?time=${encodeURIComponent(selectedTime)}`
          );
          setDbBookedSeats(bookedResponse.data.bookedSeats || []);
        } catch {
          
          console.log("No bookings found or bookings API error, starting fresh.");
          setDbBookedSeats([]); 
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load event details for booking.');
        setLoading(false);
      }
    };
    fetchEventForBooking();
  }, [id, selectedTime]);

  // Handle seat selection
  const handleSeatClick = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatId));
    } else {
      if (selectedSeats.length < allowedSeatsCount) {
        setSelectedSeats([...selectedSeats, seatId]);
      } else {
        alert(`You can only select ${allowedSeatsCount} seat(s) based on your ticket quantity.`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading seat layout...</p>
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

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 pb-16">
      {/* Back Button & Event Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button 
          onClick={() => navigate(`/event/${event._id}`)} 
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Details</span>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Select Seats for: {event.title}</h1>
        
        {/* If it's a movie, display the selected show time at the top */}
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm text-slate-400">Please select exactly <span className="text-emerald-400 font-bold">{allowedSeatsCount}</span> seat(s).</p>
          {event.category === 'Movie' && selectedTime && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" /> Show Time: {selectedTime}
            </div>
          )}
        </div>
      </div>

      {/* Main Seat Layout & Summary Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/*  Interactive Seat Selection Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col items-center">
          
          {/* SCREEN Indicator */}
          <div className="w-full max-w-md mx-auto mb-16 text-center">
            <div className="w-full h-2 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.4)]"></div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-2">Stage / Screen This Way</p>
          </div>

          {/* Seats Generation Grid */}
          <div className="space-y-4 w-full max-w-xl mx-auto overflow-x-auto pb-4">
            {rows.map((row) => (
              <div key={row} className="flex items-center justify-center gap-3 min-w-[400px]">
                {/* Row Label */}
                <span className="w-6 text-sm font-bold text-slate-500 text-center">{row}</span>
                
                {/* Seats Loop */}
                <div className="flex gap-2">
                  {Array.from({ length: seatsPerRow }).map((_, index) => {
                    const seatNumber = index + 1;
                    const seatId = `${row}${seatNumber}`;
                    const isSelected = selectedSeats.includes(seatId);
                    
                    // Check if this seat is already booked in the database
                    const isBooked = dbBookedSeats.includes(seatId);

                    return (
                      <button
                        key={seatId}
                        disabled={isBooked}
                        onClick={() => handleSeatClick(seatId)}
                        className={`p-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center border text-xs font-semibold group cursor-pointer
                          ${isBooked 
                            ? 'bg-slate-800 border-slate-800 text-slate-600 cursor-not-allowed' 
                            : isSelected
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-500/50 hover:text-white'
                          }
                        `}
                        title={isBooked ? `Seat ${seatId} (Booked)` : `Seat ${seatId}`}
                      >
                        <Armchair className="w-5 h-5 mb-0.5" />
                        <span>{seatNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Color Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-6 border-t border-slate-800 w-full">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-md"><Armchair className="w-4 h-4" /></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="p-1.5 bg-emerald-500 border border-emerald-400 text-slate-950 rounded-md"><Armchair className="w-4 h-4" /></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="p-1.5 bg-slate-800 border border-slate-800 text-slate-600 rounded-md"><Armchair className="w-4 h-4" /></div>
              <span>Sold Out</span>
            </div>
          </div>

        </div>

        {/* Right Panel: Booking Summary & Confirmation Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl sticky top-8 space-y-6">
            <h3 className="text-xl font-bold text-white pb-3 border-b border-slate-800">Booking Summary</h3>
            
            {/* Selected Seats Numbers Display */}
            <div className="space-y-2">
              <span className="text-slate-400 text-sm">Selected Seats:</span>
              <div className="flex flex-wrap gap-2 min-h-10 items-center">
                {selectedSeats.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No seats selected yet.</span>
                ) : (
                  selectedSeats.map(seat => (
                    <span key={seat} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-lg text-sm font-bold animate-fade-in">
                      {seat}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Selection Status Counter */}
            <div className="flex items-center justify-between py-3 border-y border-slate-800 text-sm">
              <span className="text-slate-400">Progress:</span>
              <span className={`font-bold ${selectedSeats.length === allowedSeatsCount ? 'text-emerald-400' : 'text-amber-400'}`}>
                {selectedSeats.length} of {allowedSeatsCount} Selected
              </span>
            </div>

            {/* Total Price Display */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Total Price:</span>
              <span className="text-2xl font-extrabold text-white">LKR {event ? event.ticketPrice * allowedSeatsCount : 0}</span>
            </div>

            {/* Final Checkout Button */}
            <button 
              disabled={selectedSeats.length !== allowedSeatsCount}
              onClick={() => navigate(`/checkout/${event._id}`, { 
                state: { 
                  seats: selectedSeats, 
                  total: event.ticketPrice * allowedSeatsCount,
                  showTime: selectedTime 
                } 
              })}
              className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-lg
                ${selectedSeats.length === allowedSeatsCount
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/10 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed shadow-none'
                }
              `}
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirm & Pay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SeatBooking;