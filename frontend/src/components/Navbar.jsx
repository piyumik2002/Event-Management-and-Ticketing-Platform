import { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import { Menu, X, Ticket, LogOut, User } from 'lucide-react'; // Removed unused Info icon to fix ESLint error

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu open/close 
  const navigate = useNavigate();

  // Retrieves the logged-in user's details from localStorage
  const userJson = localStorage.getItem('userInfo');
  const userInfo = userJson ? JSON.parse(userJson) : null;

  const displayUserName = userInfo?.name || userInfo?.user?.name || "User";

  // Logout 
  const handleLogout = () => {
    localStorage.removeItem('userInfo'); 
    localStorage.removeItem('user');     // The 'user' key created for checkout is also cleared here.
    navigate('/login');
    window.location.reload(); // page refresh 
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-emerald-400">
              <Ticket className="w-6 h-6 text-emerald-400" />
              <span>TikXpress</span>
            </Link>
          </div>

          {/* Desktop Navigation Links (only on large screens) */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium text-sm">
              Home
            </Link>
            
            {/* About Us Link for Desktop View */}
            <Link to="/about-us" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium text-sm">
              About Us
            </Link>
            
            {userInfo ? (
              // The part that is visible if the user is logged in (name and Logout button)
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-sm">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium">{displayUserName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              // The Sign In button is only visible if the user is not logged in.
              <Link to="/login" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-md font-medium transition-colors text-sm">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white cursor-pointer transition-colors">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link 
            to="/" 
            onClick={() => setIsOpen(false)} 
            className="block py-2 text-slate-300 hover:text-emerald-400 transition-colors font-medium text-sm"
          >
            Home
          </Link>
          
          {/* About Us Link for Mobile View */}
          <Link 
            to="/about-us" 
            onClick={() => setIsOpen(false)} 
            className="block py-2 text-slate-300 hover:text-emerald-400 transition-colors font-medium text-sm"
          >
            About Us
          </Link>
          
          {userInfo ? (
            // Mobile View for Logged-In User
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 bg-slate-800 px-3 py-2 rounded-md text-sm border border-slate-800">
                <User className="w-4 h-4 text-emerald-400" />
                <span>{displayUserName}</span>
              </div>
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 py-2 rounded-md text-sm font-medium border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            // Mobile View for Sign In button (only if not logged in)
            <div className="pt-2 border-t border-slate-800">
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)} 
                className="block text-center bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-2 rounded-md font-medium text-sm transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;