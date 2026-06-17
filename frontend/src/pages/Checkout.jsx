import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft, Loader2, ShieldCheck, Clock } from 'lucide-react'; // Clock icons
import axios from 'axios'; 

const Checkout = () => {
  const { id } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();

  //The 'showTime' is also correctly retrieved from the state sent from the SeatBooking page.
  const { seats = [], total = 0, showTime = '' } = location.state || {};

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Status States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // New state to hold the actual QR Image string coming from the backend
  const [qrImage, setQrImage] = useState('');

  // Security measures to block people from accessing this page without logging in through fraudulent means
  useEffect(() => {
    const userJson = localStorage.getItem('userInfo');
    const storedUser = userJson ? JSON.parse(userJson) : null;
    
    // If the user is not found in localStorage, redirect to the register page
    if (!storedUser) {
      alert('Access denied. Please register or login to complete your booking.');
      navigate('/register');
    }
  }, [navigate]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !cardNumber || !expiry || !cvv) {
      alert('Please fill in all payment details.');
      return;
    }

    setIsProcessing(true);

    try {
      const userJson = localStorage.getItem('userInfo');
      const storedUser = userJson ? JSON.parse(userJson) : null;
      
      const currentUserId = storedUser?._id || storedUser?.id || storedUser?.user?._id || storedUser?.user?.id; 

      if (!currentUserId) {
        alert("Please log in to complete your booking.");
        setIsProcessing(false);
        return;
      }

      //We pass the 'showTime' here as we configured it in the backend.
      const bookingData = {
        user: currentUserId,              
        event: id,                        
        seats: seats,                    
        totalAmount: total,              
        showTime: showTime 
      };

      const response = await axios.post('http://localhost:5000/api/bookings', bookingData);

      if (response.status === 201 || response.status === 200) {
        //The actual QR string that is successfully saved from the backend is put into the state.
        if (response.data?.booking?.qrCode) {
          setQrImage(response.data.booking.qrCode);
        }
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Booking Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Something went wrong while saving the booking.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (seats.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 text-white">
        <div className="text-center bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <p className="text-slate-400 mb-4">No booking session found.</p>
          <button onClick={() => navigate('/')} className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg font-bold">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 pb-16">
      
      {/* 1. PAYMENT SUCCESS RECEIPT */}
      {isSuccess ? (
        <div className="max-w-md mx-auto px-4 pt-16 animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.1)] relative">
            
            {/* Ticket Header */}
            <div className="bg-emerald-500 text-slate-950 p-6 text-center space-y-2">
              <CheckCircle className="w-12 h-12 mx-auto animate-bounce" />
              <h2 className="text-2xl font-extrabold tracking-tight">Booking Confirmed!</h2>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Enjoy your event</p>
            </div>

            {/* Ticket Content */}
            <div className="p-6 space-y-6 relative">
              
              {/* Decorative Ticket Side Notches */}
              <div className="absolute -left-3 top-1/3 w-6 h-6 bg-slate-950 rounded-full border-r border-slate-800"></div>
              <div className="absolute -right-3 top-1/3 w-6 h-6 bg-slate-950 rounded-full border-l border-slate-800"></div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Customer Name</span>
                <p className="text-white font-bold text-lg">{name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-800 py-4">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Selected Seats</span>
                  <p className="text-emerald-400 font-extrabold text-base tracking-wide">
                    {seats.join(', ')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Total Paid</span>
                  <p className="text-white font-extrabold text-base">LKR {total}</p>
                </div>
              </div>

              {/*[ADDED UI]  */}
              {showTime && (
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-sm text-slate-300">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Show Time: <strong className="text-white">{showTime}</strong></span>
                </div>
              )}

              {/* The professional section that shows the actual QR Code */}
              <div className="flex flex-col items-center justify-center pt-2 space-y-3">
                <div className="p-4 bg-white rounded-2xl shadow-inner group flex items-center justify-center min-w-[160px] min-h-[160px]">
                  {qrImage ? (
                    <img src={qrImage} alt="Event Ticket QR Code" className="w-32 h-32 mx-auto object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                      <span className="text-xs font-medium">Generating QR...</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-mono">TICKET-ID: {id.substring(0, 8).toUpperCase()}-{seats[0]}</span>
              </div>
            </div>

            {/* Ticket Footer Back Button */}
            <div className="bg-slate-950 p-4 border-t border-slate-800/60 text-center">
              <button 
                onClick={() => navigate('/')} 
                className="w-full bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/30 py-3 rounded-xl font-bold transition-all text-sm cursor-pointer"
              >
                Return to Home Page
              </button>
            </div>
          </div>
        </div>
      ) : (
        
        /* 2. SECURE CHECKOUT FORM */
        <div className="max-w-4xl mx-auto px-4 pt-8">
          {/* Back Button */}
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Seats</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* Payment Info Form */}
            <form onSubmit={handlePaymentSubmit} className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <CreditCard className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Secure Credit / Debit Card Payment</h2>
              </div>

              {/* Name on Card Input */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400 font-medium">Name on Card</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. P. M. Silva" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400 font-medium">Email Address (For Digital Ticket)</label>
                <input 
                  type="email" 
                  required
                  placeholder="piyumi@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Card Number Input */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400 font-medium">Card Number</label>
                <input 
                  type="text" 
                  required
                  maxLength="16"
                  placeholder="4123 4567 8901 2345" 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Expiry & CVV Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400 font-medium">Expiry Date</label>
                  <input 
                    type="text" 
                    required
                    maxLength="5"
                    placeholder="MM/YY" 
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400 font-medium">CVV</label>
                  <input 
                    type="password" 
                    required
                    maxLength="3"
                    placeholder="***" 
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Submit / Pay Button */}
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-base cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <span>Pay LKR {total} Securely</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-slate-500 text-xs pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>256-bit SSL Encrypted Payment Connection</span>
              </div>
            </form>

            {/*Quick Order Summary Widget */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white pb-2 border-b border-slate-800">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Seats:</span>
                  <span className="text-white font-bold tracking-wide">{seats.join(', ')}</span>
                </div>
                {/*[ADDED UI]  */}
                {showTime && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Show Time:</span>
                    <span className="text-emerald-400 font-bold">{showTime}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Tickets:</span>
                  <span className="text-white font-bold">{seats.length} Ticket(s)</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-800 text-base">
                  <span className="text-slate-400 font-medium">Total Amount:</span>
                  <span className="text-emerald-400 font-extrabold">LKR {total}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;