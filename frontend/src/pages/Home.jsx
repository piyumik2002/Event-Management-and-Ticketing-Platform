import { useState, useEffect } from 'react';
import { Calendar, MapPin, Loader2, Search } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import axios from 'axios';
import Hero from '../components/Hero'; 

// Imported the image here so we can use it specifically for the top hero area
import bgImage from '/src/assets/bg-pattern.jpg';

const Home = () => {
  const [events, setEvents] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data); 
        setLoading(false);
      } catch (err) {
        console.error(err); 
        setError('Failed to fetch events. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = (event.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (event.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || (event.category && event.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesVenue = selectedVenue === '' || (event.venue?.toLowerCase() || '').includes(selectedVenue.toLowerCase());

    return matchesSearch && matchesCategory && matchesVenue;
  });

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 p-4">
        <div className="text-center bg-red-500/10 border border-red-500/20 p-6 rounded-xl max-w-md">
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    // Outer wrapper is standard dark solid background
    <div className="bg-slate-950 min-h-screen">
      
      {/* 🏔️ TOP SECTION (Hero + Search Bar Area with Background Image) */}
      <div 
        className="bg-cover bg-center relative pb-12"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.4), rgba(2, 6, 23, 0.85)), url(${bgImage})`
        }}
      >
        <Hero />

        {/* 🔍 Search & Filter Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 md:p-6 rounded-2xl shadow-2xl space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
            
            {/* A. Keyword Search Input */}
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for events by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* B. Category Dropdown */}
            <div className="w-full md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none"
              >
                <option value="">All Categories</option>
                <option value="movie">Movie 🎬</option>
                <option value="music">Music / Concerts</option>
                <option value="sports">Sports</option>
                <option value="theater">Theater / Drama</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* C. Venue Dropdown */}
            <div className="w-full md:w-48">
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none"
              >
                <option value="">All Venues</option>
                <option value="colombo">Colombo</option>
                <option value="kandy">Kandy</option>
                <option value="galle">Galle</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* 🖤 BOTTOM SECTION (Upcoming Events List with a beautiful bottom-to-top fading dark gradient layer) */}
      {/* - Changed from 'slate-800' to 'slate-950' to match the main page background perfectly.
          - Added 'pt-24' to give enough spacing for the gradient to fade smoothly from deep dark to transparent.
          - Decreased the top margin '-mt-20' slightly to pull the cards area cleanly under the search section.
      */}
      <div className="relative bg-gradient-to-t from-[#5d6e88] via-[#96a2c2]  to-transparent -mt-24 pt-24">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-emerald-500 rounded-full"></span>
            Upcoming Events 🎟️
          </h1>
          
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-lg">No events match your search criteria. 🔍</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div key={event._id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 shadow-lg flex flex-col justify-between">
                  <div>
                    <img 
                      src={event.image || "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=500"} 
                      alt={event.title} 
                      className="w-full h-48 object-cover bg-slate-950" 
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=500";
                      }}
                    />
                    
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{event.title}</h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                      
                      <div className="space-y-2 mb-5">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Calendar className="w-4 h-4 text-emerald-400" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          <span className="line-clamp-1">{event.venue}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                      <span className="text-emerald-400 font-bold text-lg">LKR {event.ticketPrice}</span>
                      <Link to={`/event/${event._id}`} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        Book Now
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;