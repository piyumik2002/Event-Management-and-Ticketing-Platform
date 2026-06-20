import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft, Loader2, ShieldCheck, Clock } from 'lucide-react'; 
import axios from 'axios'; 
// 🌟 [STRIPE IMPORTS]
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// 🌟 Imported the background image pattern for consistency
import bgImage from '/src/assets/bg-pattern.jpg';

// Initialize Stripe with your actual Publishable Key
const stripePromise = loadStripe('pk_test_51TjNEmFtkb2m0c7X7ygVHQ3TIkmQ9tU3OpWa2xHWGMhK3M9Sh21Y5V4krPTo1RoVPhKbm5dAWemIjy08Sde2bVNY00db230Gj2');

// Inner form logic for Stripe elements handling
const CheckoutForm = ({ id, seats, total, showTime, name, setName, email, setEmail, setIsSuccess, setQrImage }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeError, setStripeError] = useState('');

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return; // Stripe has not loaded yet
    }

    if (!name || !email) {
      alert('Please fill in your Name and Email.');
      return;
    }

    setIsProcessing(true);
    setStripeError('');

    try {
      const userJson = localStorage.getItem('userInfo');
      const storedUser = userJson ? JSON.parse(userJson) : null;
      const currentUserId = storedUser?._id || storedUser?.id || storedUser?.user?._id || storedUser?.user?.id; 

      if (!currentUserId) {
        alert("Please log in to complete your booking.");
        setIsProcessing(false);
        return;
      }

      // 1. Get the CardElement instance safely
      const cardElement = elements.getElement(CardElement);

      // 2. Create secure PaymentMethod via Stripe Servers
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: name,
          email: email,
        },
      });

      if (error) {
        setStripeError(error.message);
        setIsProcessing(false);
        return;
      }

      // 3. Send the Booking Data along with the secure token 'paymentMethod.id' to Backend
      const bookingData = {
        user: currentUserId,              
        event: id,                        
        seats: seats,                    
        totalAmount: total,              
        showTime: showTime,
        paymentMethodId: paymentMethod.id // 🌟 Pass the secure Stripe Token
      };

      const response = await axios.post('http://localhost:5000/api/bookings', bookingData);

      if (response.status === 201 || response.status === 200) {
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

  return (
    <form onSubmit={handlePaymentSubmit} className="lg:col-span-3 bg-slate-900/75 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-[0_15px_35px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
        <CreditCard className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">Secure Credit / Debit Card Payment</h2>
      </div>

      {/* Name on Card Input */}
      <div className="space-y-2">
        <label className="text-sm text-slate-300 font-medium">Name on Card</label>
        <input 
          type="text" 
          required
          placeholder="e.g. P. M. Silva" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
        />
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label className="text-sm text-slate-300 font-medium">Email Address (For Digital Ticket)</label>
        <input 
          type="email" 
          required
          placeholder="piyumi@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
        />
      </div>

      {/* STRIPE SECURE CARD ELEMENT BOX */}
      <div className="space-y-2">
        <label className="text-sm text-slate-300 font-medium">Credit or Debit Card Details</label>
        <div className="w-full bg-slate-950/90 border border-slate-800 focus-within:border-emerald-500 rounded-xl py-4 px-4 transition-colors shadow-inner">
          <CardElement 
            options={{
              style: {
                base: {
                  color: '#f1f5f9',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSmoothing: 'antialiased',
                  fontSize: '16px',
                  '::placeholder': {
                    color: '#64748b',
                  },
                },
                invalid: {
                  color: '#f87171',
                  iconColor: '#f87171',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Stripe Inline Error Message */}
      {stripeError && (
        <p className="text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 py-2.5 px-4 rounded-xl text-center">
          ⚠️ {stripeError}
        </p>
      )}

      {/* Submit / Pay Button */}
      <button 
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 text-base cursor-pointer disabled:bg-slate-800/60 disabled:text-slate-500 disabled:cursor-not-allowed shadow-emerald-500/10 hover:shadow-emerald-500/20 transform hover:-translate-y-0.5 active:translate-y-0"
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
  );
};

const Checkout = () => {
  const { id } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();

  const { seats = [], total = 0, showTime = '' } = location.state || {};

  // Form States (Shared with the Form Wrapper)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Status States
  const [isSuccess, setIsSuccess] = useState(false);
  const [qrImage, setQrImage] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('userInfo');
    const storedUser = userJson ? JSON.parse(userJson) : null;
    
    if (!storedUser) {
      alert('Access denied. Please register or login to complete your booking.');
      navigate('/register');
    }
  }, [navigate]);

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
    // Main outer wrapper with optimized, lighter background gradient for higher image visibility
    <div 
      className="bg-slate-950 min-h-screen text-slate-100 pb-16 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.4), rgba(2, 6, 23, 0.7)), url(${bgImage})`
      }}
    >
      
      {/* 1. PAYMENT SUCCESS RECEIPT */}
      {isSuccess ? (
        <div className="max-w-md mx-auto px-4 pt-16 animate-fade-in">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/40 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5),_0_0_30px_rgba(16,185,129,0.15)] relative ring-1 ring-white/10">
            
            {/* Ticket Header */}
            <div className="bg-emerald-500 text-slate-950 p-6 text-center space-y-2 shadow-md">
              <CheckCircle className="w-12 h-12 mx-auto animate-bounce" />
              <h2 className="text-2xl font-extrabold tracking-tight">Booking Confirmed!</h2>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-85">Enjoy your event</p>
            </div>

            {/* Ticket Content */}
            <div className="p-6 space-y-6 relative">
              
              {/* Decorative Ticket Side Notches */}
              <div className="absolute -left-3 top-1/3 w-6 h-6 bg-slate-950 rounded-full border-r border-slate-800/80"></div>
              <div className="absolute -right-3 top-1/3 w-6 h-6 bg-slate-950 rounded-full border-l border-slate-800/80"></div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Customer Name</span>
                <p className="text-white font-extrabold text-xl drop-shadow-sm">{name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-800/80 py-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Selected Seats</span>
                  <p className="text-emerald-400 font-black text-lg tracking-wide">
                    {seats.join(', ')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total Paid</span>
                  <p className="text-white font-black text-lg">LKR {total}</p>
                </div>
              </div>

              {showTime && (
                <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-sm text-slate-300 shadow-inner">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Show Time: <strong className="text-white font-bold">{showTime}</strong></span>
                </div>
              )}

              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center pt-2 space-y-3">
                <div className="p-4 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] group flex items-center justify-center min-w-[160px] min-h-[160px] transform hover:scale-102 transition-transform">
                  {qrImage ? (
                    <img src={qrImage} alt="Event Ticket QR Code" className="w-32 h-32 mx-auto object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                      <span className="text-xs font-medium">Generating QR...</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono tracking-wider bg-slate-950/60 px-3 py-1 rounded-md border border-slate-800/40">TICKET-ID: {id.substring(0, 8).toUpperCase()}-{seats[0]}</span>
              </div>
            </div>

            {/* Ticket Footer Back Button */}
            <div className="bg-slate-950/80 p-4 border-t border-slate-800/80 text-center">
              <button 
                onClick={() => navigate('/')} 
                className="w-full bg-slate-900/80 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/30 py-3 rounded-xl font-bold transition-all text-sm cursor-pointer shadow-md"
              >
                Return to Home Page
              </button>
            </div>
          </div>
        </div>
      ) : (
        
        /* 2. SECURE CHECKOUT FORM WRAPPED IN STRIPE ELEMENTS PROVIDER */
        <div className="max-w-4xl mx-auto px-4 pt-8">
          {/* Back Button */}
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors mb-6 group bg-slate-900/60 backdrop-blur-md border border-slate-800/90 px-4 py-2 rounded-xl w-fit shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Seats</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start relative z-10">
            
            {/* Form Wrapped with Elements */}
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                id={id}
                seats={seats}
                total={total}
                showTime={showTime}
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                setIsSuccess={setIsSuccess}
                setQrImage={setQrImage}
              />
            </Elements>

            {/* Quick Order Summary Widget */}
            <div className="lg:col-span-2 bg-slate-900/75 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-[0_15px_35px_rgba(0,0,0,0.6)] space-y-4 ring-1 ring-white/10">
              <h3 className="text-lg font-bold text-white pb-2 border-b border-slate-800/80 tracking-wide">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Selected Seats:</span>
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md font-extrabold tracking-wider">{seats.join(', ')}</span>
                </div>
                {showTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Show Time:</span>
                    <span className="text-white font-bold">{showTime}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Total Tickets:</span>
                  <span className="text-white font-bold">{seats.length} Ticket(s)</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-800/80 text-base bg-slate-950/40 p-2 rounded-xl border border-slate-800/40 mt-1">
                  <span className="text-slate-300 font-semibold pl-1">Total Amount:</span>
                  <span className="text-emerald-400 font-black text-lg pr-1">LKR {total}</span>
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