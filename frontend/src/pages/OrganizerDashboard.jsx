import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Imported useNavigate for routing
import axios from 'axios';
import { 
  Calendar, MapPin, DollarSign, Users, Image, FileText, Type, 
  Plus, X, Loader2, Clock, Upload, LayoutDashboard, CalendarPlus, 
  Ticket, Settings 
} from 'lucide-react';

// Importing the optimized dark-themed reusable Revenue Chart component
import RevenueChart from '../components/RevenueChart';

const OrganizerDashboard = () => {
  const navigate = useNavigate(); // Initialized navigate function
  
  // State to control the active navigation tab (Default is 'dashboard')
  const [activeTab, setActiveTab] = useState('dashboard');

  // Gets the name of the logged in Organizer from LocalStorage.
  const userJson = localStorage.getItem('userInfo') || localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  
  // Extract organizerId to dynamically make API calls
  const organizerId = user?._id || user?.id || user?.user?._id || user?.user?.id;

  // States to keep data in the form 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [venue, setVenue] = useState('');
  const [category, setCategory] = useState('Movie');
  const [imageUrl, setImageUrl] = useState(''); 

  // A state to keep a common date only for events other than movies
  const [nonMovieDate, setNonMovieDate] = useState('');

  // States to add Date along with Showtimes
  const [showTimes, setShowTimes] = useState([]); 
  const [timeInput, setTimeInput] = useState('');
  const [showTimeDateInput, setShowTimeDateInput] = useState(''); // Special date related to Showtime

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // States to hold live metrics and recent bookings list fetched from backend
  const [stats, setStats] = useState({ totalRevenue: 0, ticketsSold: 0, activeEvents: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // States to hold analytical chart datasets (Monthly feed & Last 7 Days aggregation)
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [analytics7DaysData, setAnalytics7DaysData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  // 📊 Live statistics, 7-Day data, and Monthly charts fetching logic combined optimally
  useEffect(() => {
    const fetchOrganizerStats = async () => {
      try {
        const token = user?.token; 
        if (!token || !organizerId) return;

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Calling the organizer metrics endpoint (Now fetches both metrics, 7-day and monthly analytics)
        const response = await axios.get(`http://localhost:5000/api/bookings/organizer/${organizerId}`, config);
        
        if (response.data.success) {
          // Updating real-time statistical metrics cards
          setStats({
            totalRevenue: response.data.metrics?.totalRevenue || 0,
            ticketsSold: response.data.metrics?.ticketsSold || 0,
            activeEvents: response.data.metrics?.activeEventsCount || 0
          });

          // Appending recent bookings data to the state array
          setRecentBookings(response.data.recentBookings || []);
          
          // 1. 🌟 Daily Chart: Mapping and chronologically sorting the 7-day analytics dataset
          const mapped7Days = (response.data.chartData || []).map(item => ({
            date: item.date || 'N/A',
            revenue: Number(item.revenue || 0)
          }));
          
          // Guaranteed chronological sort by date to prevent plotting visual glitches
          mapped7Days.sort((a, b) => new Date(a.date) - new Date(b.date));
          setAnalytics7DaysData(mapped7Days);

          // 2. 🌟 Annual Chart: Dynamically map monthly backend data keys into the safe format required by the chart
          const mappedMonthly = (response.data.monthlyData || []).map(item => ({
            date: item.date || item.name || item.month || 'N/A',
            revenue: Number(item.revenue !== undefined ? item.revenue : 0)
          }));
          setMonthlyChartData(mappedMonthly);
        }
        setStatsLoading(false);
        setChartsLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard stats & bookings:', err);
        setStatsLoading(false);
        setChartsLoading(false);
      }
    };

    fetchOrganizerStats();
  }, [user?.token, organizerId]);

  // Function that converts an image into a Base64 String as soon as it is selected
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setError('');
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function that creates Slots by combining both date and time
  const handleAddShowTime = () => {
    if (!showTimeDateInput) {
      setError('Please select a specific date for this show time.');
      return;
    }
    if (!timeInput.trim()) {
      setError('Please enter a show time.');
      return;
    }

    const isDuplicate = showTimes.some(
      (slot) => slot.date === showTimeDateInput && slot.time === timeInput.trim()
    );

    if (!isDuplicate) {
      setShowTimes([...showTimes, { date: showTimeDateInput, time: timeInput.trim() }]);
      setTimeInput('');
      setError(''); 
    } else {
      setError('This specific date and show time is already added.');
    }
  };

  // How to remove an added slot
  const handleRemoveShowTime = (indexToRemove) => {
    setShowTimes(showTimes.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (category === 'Movie' && showTimes.length === 0) {
      setError('Please add at least one Show Date & Time for the movie.');
      return;
    }

    if (category !== 'Movie' && !nonMovieDate) {
      setError('Please select a date and time for the event.');
      return;
    }

    setLoading(true); // Fixed bug: changed loading(true) to setLoading(true)

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const finalEventDate = category === 'Movie' ? showTimes[0]?.date : nonMovieDate;

      const eventData = {
        title,
        description,
        ticketPrice: Number(ticketPrice),
        date: finalEventDate, 
        totalSeats: Number(totalSeats),
        venue,
        category,
        image: imageUrl, 
        organizer: organizerId,
        showTimes: category === 'Movie' ? showTimes : []
      };

      await axios.post('http://localhost:5000/api/events', eventData, config);

      setSuccess('Event Published Successfully! 🎬🚀');
      
      // Form Reset 
      setTitle(''); 
      setDescription(''); 
      setTicketPrice(''); 
      setTotalSeats('');
      setVenue('');
      setCategory('Movie');
      setImageUrl('');
      setShowTimes([]);
      setShowTimeDateInput('');
      setNonMovieDate('');
      setLoading(false);

      // Re-fetching real-time statistics immediately after a new event is successfully posted
      const statsRes = await axios.get(`http://localhost:5000/api/bookings/organizer/${organizerId}`, config);
      if (statsRes.data.success) {
        setStats({
          totalRevenue: statsRes.data.metrics?.totalRevenue || 0,
          ticketsSold: statsRes.data.metrics?.ticketsSold || 0,
          activeEvents: statsRes.data.metrics?.activeEventsCount || 0
        });
        setRecentBookings(statsRes.data.recentBookings || []);
        
        const remmappedMonthly = (statsRes.data.monthlyData || []).map(item => ({
          date: item.date || item.name || item.month || 'N/A',
          revenue: Number(item.revenue !== undefined ? item.revenue : 0)
        }));
        setMonthlyChartData(remmappedMonthly);

        const remmapped7Days = (statsRes.data.chartData || []).map(item => ({
          date: item.date || 'N/A',
          revenue: Number(item.revenue || 0)
        }));
        
        // Sorting the re-fetched live dataset as well
        remmapped7Days.sort((a, b) => new Date(a.date) - new Date(b.date));
        setAnalytics7DaysData(remmapped7Days);
      }

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to add event. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      
      {/* ─── 1. SIDEBAR NAVIGATION ─── */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl font-bold font-mono">Tx</div>
            <div>
              <h2 className="font-bold text-white leading-none">TikXpress</h2>
              <span className="text-xs text-slate-500 font-medium">Organizer Portal</span>
            </div>
          </div>
          
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${activeTab === 'create' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Publish New Event</span>
            </button>

            {/* Added: Navigation link to Manage Events Page */}
            <button 
              onClick={() => navigate('/organizer/manage-events')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>Manage Events</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
          Logged in as: <strong className="text-slate-400">{user?.name || 'Organizer'}</strong>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Header Component */}
        <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Organizer Portal 🚀</h1>
            <p className="text-slate-400 mt-1">
              Welcome back, <span className="text-emerald-400 font-semibold">{user?.name}</span> {user?.organizationName ? `(${user.organizationName})` : ''}
            </p>
          </div>
          
          {/* Mobile view navigation buttons */}
          <div className="flex gap-2 md:hidden w-full">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg ${activeTab === 'dashboard' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg ${activeTab === 'create' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}
            >
              Publish Event
            </button>
            {/* Added: Mobile View Manage Button */}
            <button 
              onClick={() => navigate('/organizer/manage-events')}
              className="flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400"
            >
              Manage
            </button>
          </div>
        </div>

        {/* ─── TAB 1: DASHBOARD OVERVIEW ─── */}
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Live Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                    <h3 className="text-3xl font-black text-emerald-400">
                      {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-400 inline" /> : `Rs. ${(stats.totalRevenue || 0).toLocaleString()}`}
                    </h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tickets Sold</span>
                    <h3 className="text-3xl font-black text-blue-400">
                      {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-blue-400 inline" /> : stats.ticketsSold}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                    <Ticket className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Events</span>
                    <h3 className="text-3xl font-black text-purple-400">
                      {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-purple-400 inline" /> : stats.activeEvents}
                    </h3>
                  </div>
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── 📊 CHARTS GRID SECTION ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Last 7 Days Revenue Analytics */}
              <div>
                {chartsLoading ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl h-[350px] flex items-center justify-center text-slate-400 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-400" /> Loading Weekly Analytics...
                  </div>
                ) : (
                  <RevenueChart 
                    data={analytics7DaysData} 
                    title="Revenue Analytics" 
                    subtitle="Revenue growth tracking for the last 7 days"
                  />
                )}
              </div>

              {/* Chart 2: 12-Month Annual Statistics Overview */}
              <div>
                {chartsLoading ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl h-[350px] flex items-center justify-center text-slate-400 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-400" /> Loading Annual Overview...
                  </div>
                ) : (
                  <RevenueChart 
                    data={monthlyChartData} 
                    title="Annual Overview" 
                    subtitle="Monthly distribution of sales and ticket conversion rates"
                  />
                )}
              </div>
            </div>

            {/* ─── 📊 RECENT BOOKINGS LIVE TABLE ─── */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Recent Bookings (Live Activity Feed)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time data stream of incoming ticket transactions.</p>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              <div className="overflow-x-auto">
                {statsLoading ? (
                  <div className="p-12 text-center flex justify-center items-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading bookings feed...
                  </div>
                ) : recentBookings.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No tickets have been booked for your events yet.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 uppercase text-xs font-bold tracking-wider border-b border-slate-800">
                        <th className="py-4 px-6">Customer</th>
                        <th className="py-4 px-6">Movie / Event Name</th>
                        <th className="py-4 px-6">Seats Booked</th>
                        <th className="py-4 px-6">Paid Amount</th>
                        <th className="py-4 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {recentBookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-semibold text-white">{booking.user?.name || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{booking.user?.email || 'N/A'}</div>
                          </td>
                          <td className="py-4 px-6 text-slate-300 font-medium">
                            {booking.event?.title || 'Deleted Entry'}
                          </td>
                          <td className="py-4 px-6 font-mono text-emerald-400">
                            {booking.seats ? (Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats) : 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-white font-semibold">
                            Rs. {booking.totalAmount?.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {booking.status || 'Confirmed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: CREATE EVENT FORM ─── */}
        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 text-center text-white">Publish New Movie / Event</h2>
            <p className="text-slate-400 text-sm text-center mb-8 border-b border-slate-800 pb-4">Fill in the details below to reach your audience.</p>

            {error && <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm text-center">{error}</div>}
            {success && <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm text-center">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Type className="w-4 h-4 text-emerald-400" /> Movie / Event Title
                </label>
                <input
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                  placeholder="e.g. Spiderman - No Way Home"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" /> Description
                </label>
                <textarea
                  required rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                  placeholder="Write a brief overview of the movie..."
                />
              </div>

              {/* Venue & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" /> Venue (Cinema / Hall)
                  </label>
                  <input
                    type="text" required value={venue} onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="e.g. Liberty Cinema Kollupitiya"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-400" /> Category
                  </label>
                  <select
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="Movie">Movie</option>
                    <option value="Music">Music</option>
                    <option value="Sports">Sports</option>
                    <option value="Theater">Theater</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Movie Screening Slots Section */}
              {category === 'Movie' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" /> Add Movie Show Dates & Times
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3"/> Select Date</span>
                      <input 
                        type="date" value={showTimeDateInput} onChange={(e) => setShowTimeDateInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> Enter Time</span>
                      <div className="flex gap-2">
                        <input 
                          type="text" value={timeInput} onChange={(e) => setTimeInput(e.target.value)}
                          placeholder="e.g., 10:30 AM or 06:30 PM"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button 
                          type="button" onClick={handleAddShowTime}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {showTimes.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2 bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
                        <span className="text-emerald-400 font-semibold">{slot.date}</span>
                        <span className="text-slate-400">|</span>
                        <span>{slot.time}</span>
                        <button type="button" onClick={() => handleRemoveShowTime(index)} className="text-slate-400 hover:text-red-400 ml-1 cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price and Seats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> Price (LKR)
                  </label>
                  <input
                    type="number" required value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    placeholder="1000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" /> Total Seats
                  </label>
                  <input
                    type="number" required value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    placeholder="150"
                  />
                </div>

                {category !== 'Movie' && (
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" /> Event Date & Time
                    </label>
                    <input
                      type="datetime-local" required value={nonMovieDate} onChange={(e) => setNonMovieDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Image Upload Component */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Image className="w-4 h-4 text-emerald-400" /> Movie Poster / Event Image
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <label className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border border-slate-700 transition-colors">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    Select Image File
                    <input
                      type="file" accept="image/*" onChange={handleImageChange} className="hidden"
                    />
                  </label>

                  {imageUrl ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button" onClick={() => setImageUrl('')}
                        className="absolute top-0.5 right-0.5 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full transition-colors shadow-md cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">No file selected (Max size 2MB)</span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit" disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all py-4 rounded-xl font-bold text-slate-950 mt-4 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Publish Event Now 🎬'
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrganizerDashboard;