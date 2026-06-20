import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Armchair, CheckCircle2, Clock } from 'lucide-react'; 
import axios from 'axios';

// Imported the background image pattern for consistent styling
import bgImage from '/src/assets/bg-pattern.jpg';

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

        // Fetch already booked seats for the selected movie showtime
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
    // Main outer wrapper with optimized, lighter background gradient for higher image visibility
    <div 
      className="bg-slate-950 min-h-screen text-slate-100 pb-16 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.4), rgba(2, 6, 23, 0.7)), url(${bgImage})`
      }}
    >
      {/* Back Button & Event Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button 
          onClick={() => navigate(`/event/${event._id}`)} 
          className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors mb-6 group bg-slate-900/60 backdrop-blur-md border border-slate-800/90 px-4 py-2 rounded-xl w-fit shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Details</span>
        </button>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{event.title}</h1>
        
        {/* If it's a movie, display the selected show time at the top */}
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm text-slate-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Please select exactly <span className="text-emerald-400 font-bold">{allowedSeatsCount}</span> seat(s).</p>
          {event.category === 'Movie' && selectedTime && (
            <div className="flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-lg text-xs font-bold shadow-md">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Show Time: {selectedTime}
            </div>
          )}
        </div>
      </div>

      {/* Main Seat Layout & Summary Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 relative z-10">
        
        {/* Interactive Seat Selection Map Card */}
        <div className="lg:col-span-2 bg-slate-900/75 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.6),_0_0_25px_rgba(0,0,0,0.3)] flex flex-col items-center ring-1 ring-white/10">
          
          {/* SCREEN Indicator */}
          <div className="w-full max-w-md mx-auto mb-16 text-center">
            <div className="w-full h-2.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full shadow-[0_4px_25px_rgba(16,185,129,0.7)]"></div>
            <p className="text-xs text-emerald-400 uppercase tracking-[0.2em] font-semibold mt-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Stage / Screen This Way</p>
          </div>

          {/* Seats Generation Grid */}
          <div className="space-y-4 w-full max-w-xl mx-auto overflow-x-auto pb-4">
            {rows.map((row) => (
              <div key={row} className="flex items-center justify-center gap-3 min-w-[400px]">
                {/* Row Label */}
                <span className="w-6 text-sm font-black text-slate-400 text-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{row}</span>
                
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
                        className={`p-2 rounded-xl transition-all duration-300 flex flex-col items-center justify-center border text-xs font-semibold group cursor-pointer w-11 h-12
                          ${isBooked 
                            ? 'bg-slate-950/50 border-slate-900/80 text-slate-700 cursor-not-allowed shadow-inner opacity-35' 
                            : isSelected
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] font-black scale-105'
                              : 'bg-slate-950/90 border-slate-800/90 text-slate-300 hover:border-emerald-500 hover:text-white hover:bg-slate-900 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                          }
                        `}
                        title={isBooked ? `Seat ${seatId} (Booked)` : `Seat ${seatId}`}
                      >
                        <Armchair className={`w-5 h-5 mb-0.5 ${isSelected ? 'text-slate-950' : isBooked ? 'text-slate-800' : 'text-slate-400 group-hover:text-emerald-400 transition-colors'}`} />
                        <span>{seatNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Color Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-6 border-t border-slate-800/80 w-full">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-md shadow-md"><Armchair className="w-4 h-4" /></div>
              <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Available</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="p-1.5 bg-emerald-500 border border-emerald-400 text-slate-950 rounded-md shadow-[0_0_10px_rgba(16,185,129,0.3)]"><Armchair className="w-4 h-4" /></div>
              <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Selected</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="p-1.5 bg-slate-950/30 border border-slate-900/50 text-slate-700 rounded-md opacity-40"><Armchair className="w-4 h-4" /></div>
              <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Sold Out</span>
            </div>
          </div>

        </div>

        {/* Right Panel: Booking Summary & Confirmation Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-[0_15px_35px_rgba(0,0,0,0.6),_0_0_25px_rgba(0,0,0,0.3)] sticky top-8 space-y-6 ring-1 ring-white/10">
            <h3 className="text-xl font-bold text-white pb-3 border-b border-slate-800/80 tracking-wide">Booking Summary</h3>
            
            {/* Selected Seats Numbers Display */}
            <div className="space-y-2.5">
              <span className="text-slate-300 text-sm font-medium block">Selected Seats:</span>
              <div className="flex flex-wrap gap-2 min-h-12 items-center bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 shadow-inner">
                {selectedSeats.length === 0 ? (
                  <span className="text-xs text-slate-500 italic px-1">No seats selected yet.</span>
                ) : (
                  selectedSeats.map(seat => (
                    <span key={seat} className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-3 py-1 rounded-lg text-sm font-black shadow-sm animate-fade-in">
                      {seat}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Selection Status Counter */}
            <div className="flex items-center justify-between py-3.5 border-y border-slate-800/80 text-sm">
              <span className="text-slate-300 font-medium">Progress:</span>
              <span className={`font-extrabold px-2.5 py-0.5 rounded-md text-xs tracking-wide uppercase shadow-md ${
                selectedSeats.length === allowedSeatsCount 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {selectedSeats.length} of {allowedSeatsCount} Selected
              </span>
            </div>

            {/* Total Price Display */}
            <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
              <span className="text-slate-300 font-semibold">Total Price:</span>
              <span className="text-2xl font-black text-white tracking-tight">LKR {event ? event.ticketPrice * allowedSeatsCount : 0}</span>
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
              className={`w-full font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-lg
                ${selectedSeats.length === allowedSeatsCount
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20 hover:shadow-emerald-500/30 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed shadow-none opacity-40'
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