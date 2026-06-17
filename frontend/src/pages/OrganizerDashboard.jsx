import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, DollarSign, Users, Image, FileText, Type, Plus, X, Loader2, Clock, Upload } from 'lucide-react';

const OrganizerDashboard = () => {
  // Gets the name of the logged in Organizer from LocalStorage.
  const userJson = localStorage.getItem('userInfo') || localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // States to keep data in the form 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [venue, setVenue] = useState('');
  const [category, setCategory] = useState('Movie');
  const [imageUrl, setImageUrl] = useState(''); 

  //[ADDED] -A state to keep a common date only for events other than movies
  const [nonMovieDate, setNonMovieDate] = useState('');

  //[UPDATED -States to add Date along with Showtimes
  const [showTimes, setShowTimes] = useState([]); 
  const [timeInput, setTimeInput] = useState('');
  const [showTimeDateInput, setShowTimeDateInput] = useState(''); // Special date related to Showtime

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // [ADDED STATES] - To keep statistical data and loading status
  const [stats, setStats] = useState({ totalRevenue: 0, ticketsSold: 0, activeEvents: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  //[ADDED EFFECT] - The logic that pulls statistics from the backend as soon as the page loads
  useEffect(() => {
    const fetchOrganizerStats = async () => {
      try {
        // Gets the token of the logged in Organizer from LocalStorage (depending on how it's stored userInfo.token or user.token)
        const token = user?.token; 
        if (!token) return;

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get('http://localhost:5000/api/stats/organizer-stats', config);
        if (response.data.success) {
          setStats(response.data.data);
        }
        setStatsLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setStatsLoading(false);
      }
    };

    fetchOrganizerStats();
  }, [user?.token]);

  //Function that converts an image into a Base64 String as soon as it is selected
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

  //Function that creates Slots by combining both date and time
  const handleAddShowTime = () => {
    if (!showTimeDateInput) {
      setError('Please select a specific date for this show time.');
      return;
    }
    if (!timeInput.trim()) {
      setError('Please enter a show time.');
      return;
    }

    // caravansray Checking if this date and time is on the list
    const isDuplicate = showTimes.some(
      (slot) => slot.date === showTimeDateInput && slot.time === timeInput.trim()
    );

    if (!isDuplicate) {
      setShowTimes([...showTimes, { date: showTimeDateInput, time: timeInput.trim() }]);
      setTimeInput('');
      setError(''); // Clear error if successful
    } else {
      setError('This specific date and show time is already added.');
    }
  };

  //How to remove an added slot
  const handleRemoveShowTime = (indexToRemove) => {
    setShowTimes(showTimes.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    //[VALIDATION] -A movie must have at least one screening included.
    if (category === 'Movie' && showTimes.length === 0) {
      setError('Please add at least one Show Date & Time for the movie.');
      return;
    }

    // If it's something other than a movie, it should have a separate date.
    if (category !== 'Movie' && !nonMovieDate) {
      setError('Please select a date and time for the event.');
      return;
    }

    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      // [DYNAMIC DATE ASSIGNMENT] 
      // If it's a movie, the date of the first showtime is automatically assigned, and if it's something else, the nonMovieDate is automatically assigned.
      const finalEventDate = category === 'Movie' ? showTimes[0]?.date : nonMovieDate;

      //The last data packet sent to the backend
      const eventData = {
        title,
        description,
        ticketPrice: Number(ticketPrice),
        date: finalEventDate, 
        totalSeats: Number(totalSeats),
        venue,
        category,
        image: imageUrl, 
        organizer: user?._id || user?.id,
        // Only the movie names are returned, along with the date and time array.
        showTimes: category === 'Movie' ? showTimes : []
      };

      await axios.post('http://localhost:5000/api/events', eventData, config);

      setSuccess('Event Published Successfully! 🎬🚀');
      
      // Form  Reset 
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

      //After an event is successfully added, a small refresh is performed to auto-update the Stats cards.
      const statsRes = await axios.get('http://localhost:5000/api/stats/organizer-stats', config);
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to add event. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header  */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard 🚀</h1>
          <p className="text-slate-400 mt-1">
            Welcome back, <span className="text-emerald-400 font-semibold">{user?.name}</span> ({user?.organizationName})
          </p>
        </div>
      </div>

      {/*  Analytics Cards  */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
          <h3 className="text-slate-400 text-sm font-medium">Total Revenue</h3>
          <p className="text-3xl font-bold text-emerald-400 mt-2">
            {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-400 inline" /> : `Rs. ${stats.totalRevenue.toLocaleString()}`}
          </p>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
          <h3 className="text-slate-400 text-sm font-medium">Tickets Sold</h3>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-blue-400 inline" /> : stats.ticketsSold}
          </p>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
          <h3 className="text-slate-400 text-sm font-medium">Active Events</h3>
          <p className="text-3xl font-bold text-purple-400 mt-2">
            {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-purple-400 inline" /> : stats.activeEvents}
          </p>
        </div>
      </div>

      {/* 🎬 Add New Event Form */}
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

          {/*The section where both Date and Time are added separately for movies */}
          {category === 'Movie' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> Add Movie Show Dates & Times
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* select date  */}
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3"/> Select Date</span>
                  <input 
                    type="date" value={showTimeDateInput} onChange={(e) => setShowTimeDateInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {/* Enter time */}
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
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 rounded-xl text-sm font-bold transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Badge List to view added Dates & Times */}
              <div className="flex flex-wrap gap-2 pt-2">
                {showTimes.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
                    <span className="text-emerald-400 font-semibold">{slot.date}</span>
                    <span className="text-slate-400">|</span>
                    <span>{slot.time}</span>
                    <button type="button" onClick={() => handleRemoveShowTime(index)} className="text-slate-400 hover:text-red-400 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/*Only Price and Seats are arranged in a 2-column grid */}
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

            {/* [CONDITIONAL RENDERING] - To display a normal date input only if a category other than Movie (Music/Sports) is selected */}
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

          {/* Image File Selection Component */}
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
                    className="absolute top-0.5 right-0.5 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full transition-colors shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-500">No file selected (Max size 2MB)</span>
              )}
            </div>
          </div>

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
    </div>
  );
};

export default OrganizerDashboard;