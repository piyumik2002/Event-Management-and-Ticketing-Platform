import { Ticket, Mail, Share2, Compass, Globe } from 'lucide-react'; 
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1 - Logo & About */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-emerald-400 mb-6">
              <Ticket className="w-8 h-8" />
              <span>TikXpress</span>
            </Link>
            <p className="text-slate-400 leading-relaxed">
              The leading event ticketing platform in Sri Lanka. 
              We bring your favorite events closer to you with a seamless booking experience.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-slate-400">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 3 - Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-400" />
                <span>support@tikxpress.com</span>
              </li>
              <li>Colombo, Sri Lanka</li>
              <li>Hotline: +94 11 234 5678</li>
            </ul>
          </div>

          {/* Column 4 - Socials */}
          <div>
            <h4 className="text-white font-bold mb-6">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all">
                <Compass className="w-5 h-5" />
              </a>
              <a href="#" className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} TikXpress. All rights reserved. Developed by Piyumi.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;