import { Target, Rocket } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-transparent text-white pt-24 pb-16 px-6 md:px-12 overflow-hidden relative flex flex-col justify-center">
      
      {/* 🌟 Removed the absolute decorative gradient blurs to keep the background clean and clear */}

      <div className="max-w-5xl mx-auto space-y-16 relative z-10 w-full">
        
        {/* Main Brand Hero Introduction Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
            Who We Are
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Revolutionizing Your <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Ticketing Experience</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Welcome to <span className="text-white font-semibold">TikXpress</span>, Sri Lanka's premium digital event management and ticketing ecosystem. We bridge the gap between event organizers and passionate audiences by providing a transparent, modern, and reliable solution for every event scale.
          </p>
        </div>

        {/* Corporate Strategic Direction: Mission and Vision Core Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Corporate Mission Segment Block */}
          <div className="bg-slate-900/90 border border-slate-800/80 p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 shadow-2xl">
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit mb-6 border border-emerald-500/20">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Our Mission</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              To provide a seamless, lightning-fast, and completely secure booking platform that empowers entertainment seekers to discover, book, and enjoy movies and live activities without barriers.
            </p>
          </div>

          {/* Corporate Vision Segment Block */}
          <div className="bg-slate-900/90 border border-slate-800/80 p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500 shadow-2xl">
            <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl w-fit mb-6 border border-purple-500/20">
              <Rocket className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Our Vision</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              To become the ultimate tech-driven entertainment catalog in the region, introducing innovative AI analytics, fraud-proof digital tokens, and dynamic scheduling for global events.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AboutUs;