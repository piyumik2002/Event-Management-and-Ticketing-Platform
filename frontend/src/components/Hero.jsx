import { Ticket } from 'lucide-react'; 

const Hero = () => {
  return (
    <div className="relative bg-slate-950 py-20 overflow-hidden">
      {/* Background සැරසිලි (Blobs) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
          <Ticket className="w-4 h-4" />
          <span>New Events Added Today!</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Discover & Book The <br />
          <span className="text-emerald-500">Best Live Events</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-4">
          Experience the ultimate musical nights, sports thrills, and cultural shows. 
          Your front-row seat is just a few clicks away.
        </p>
      </div>
    </div>
  );
};

export default Hero;