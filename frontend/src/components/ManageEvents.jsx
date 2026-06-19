import { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit2, Trash2, X, Loader2, Calendar, MapPin, ArrowLeft } from 'lucide-react';

const ManageEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);

    // Form inputs state matching backend schema
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        venue: '',
        category: '',
        ticketPrice: '',
        totalSeats: ''
    });

    // Safe Data Fetching Inside useEffect (Fetching only logged-in organizer's events)
    useEffect(() => {
        let isMounted = true; 

        const fetchOrganizerEvents = async () => {
            try {
                if (isMounted) setLoading(true);

                // Extracting token dynamically from localStorage based on your auth state structure
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const token = userInfo?.token || userInfo?.user?.token;

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                // Requesting the specific organizer's personal catalog endpoint
                const response = await axios.get('http://localhost:5000/api/events/organizer/my-events', config);
                
                if (isMounted) {
                    setEvents(response.data);
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) {
                    setError('Failed to load your exclusive events. Please verify your session and try again.');
                    setLoading(false);
                }
            }
        };

        fetchOrganizerEvents();

        return () => {
            isMounted = false; 
        };
    }, []); 

    // Delete Event Logic with Authorization Headers
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const token = userInfo?.token || userInfo?.user?.token;

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                await axios.delete(`http://localhost:5000/api/events/${id}`, config);
                setEvents((prevEvents) => prevEvents.filter(event => event._id !== id));
                alert("Event deleted successfully!");
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || "Failed to delete event. Please try again.");
            }
        }
    };

    // Open Edit Modal and fill form with existing values
    const openEditModal = (event) => {
        setCurrentEvent(event);
        setFormData({
            title: event.title || '',
            description: event.description || '',
            date: event.date ? event.date.substring(0, 10) : '', 
            venue: event.venue || '',
            category: event.category || '',
            ticketPrice: event.ticketPrice || '',
            totalSeats: event.totalSeats || ''
        });
        setIsEditModalOpen(true);
    };

    // Update Event Logic with Authorization Headers
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token || userInfo?.user?.token;

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const updatedData = {
                ...formData,
                ticketPrice: Number(formData.ticketPrice),
                totalSeats: Number(formData.totalSeats)
            };

            const response = await axios.put(`http://localhost:5000/api/events/${currentEvent._id}`, updatedData, config);
            
            setEvents((prevEvents) => 
                prevEvents.map(ev => ev._id === currentEvent._id ? response.data : ev)
            );
            
            setIsEditModalOpen(false);
            alert("Event updated successfully!");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to update event. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    <p className="text-slate-400 text-sm font-medium">Loading your events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-950 min-h-screen text-slate-100 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <button 
                    onClick={() => navigate('/')} 
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Home</span>
                </button>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Manage Events</h2>
                        <p className="text-sm text-slate-400 mt-1">Edit schedules, pricing, or delete unwanted events.</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm mb-6">
                        {error}
                    </div>
                )}

                {/* Events Table Container */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    <th className="p-4 md:p-5">Event Details</th>
                                    <th className="p-4 md:p-5">Venue & Category</th>
                                    <th className="p-4 md:p-5">Ticket Price</th>
                                    <th className="p-4 md:p-5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {events.map((event) => (
                                    <tr key={event._id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 md:p-5">
                                            <div className="font-semibold text-white text-base md:text-lg">{event.title}</div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                                                <span>{new Date(event.date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-5">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-300">
                                                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                                <span>{event.venue}</span>
                                            </div>
                                            <span className="inline-block text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1.5">
                                                {event.category}
                                            </span>
                                        </td>
                                        <td className="p-4 md:p-5 font-bold text-emerald-400 text-sm md:text-base">
                                            LKR {event.ticketPrice}
                                        </td>
                                        <td className="p-4 md:p-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => openEditModal(event)}
                                                    className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500 hover:text-slate-950 transition-all cursor-pointer"
                                                    title="Edit Event"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(event._id)}
                                                    className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                                    title="Delete Event"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {events.length === 0 && !error && (
                                    <tr>
                                        <td colSpan="4" className="text-center p-8 text-slate-500 text-sm">
                                            No events found. Create an event first!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- EDIT MODAL OVERLAY --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => setIsEditModalOpen(false)} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-2xl font-bold text-white mb-2">Edit Event Details</h3>
                        <p className="text-xs text-slate-400 mb-6">Modify the details below to update your event instantly.</p>
                        
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Event Title</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Venue</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                                        value={formData.venue}
                                        onChange={(e) => setFormData({...formData, venue: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Category</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Total Seats</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                                        value={formData.totalSeats}
                                        onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ticket Price (LKR)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                                    value={formData.ticketPrice}
                                    onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
                                <textarea 
                                    rows="4"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors text-sm resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-600 transition-colors text-sm cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageEvents;