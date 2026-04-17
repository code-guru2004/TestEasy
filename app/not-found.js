"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Home, 
  Search, 
  ArrowLeft, 
  Compass, 
  AlertCircle,
  BookOpen,
  HelpCircle,
  RefreshCw,
  Globe,
  MapPin,
  Sparkles
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [suggestions, setSuggestions] = useState([
    "Check the URL for typos",
    "Go back to the previous page",
    "Visit our homepage",
    "Contact support if you need help"
  ]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: 0.1 + Math.random() * 0.3
            }}
          />
        ))}
      </div>

      {/* Mouse follower effect */}
      <div 
        className="fixed w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10 pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 192}px, ${mousePosition.y - 192}px)`
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Main Error Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Animated 404 Section */}
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-4">
                      <AlertCircle className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
                
                <h1 className="text-8xl md:text-9xl font-bold text-white mb-4 animate-bounce">
                  404
                </h1>
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-4">
                  <p className="text-white font-semibold text-lg">
                    Page Not Found
                  </p>
                </div>
                <p className="text-white/90 text-lg max-w-md mx-auto">
                  Oops! The page you're looking for seems to have wandered off into the digital wilderness.
                </p>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg className="w-full h-12 text-white/10" preserveAspectRatio="none" viewBox="0 0 1200 120">
                  <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor"></path>
                </svg>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Suggestions */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Compass className="w-5 h-5 text-purple-400" />
                    <h2 className="text-white font-semibold text-lg">Try these suggestions</h2>
                  </div>
                  
                  <ul className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full group-hover:scale-150 transition-transform"></div>
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Quick Links */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <h3 className="text-white font-medium text-sm mb-4">Quick Navigation</h3>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all duration-200 group"
                      >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                      </button>
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-all duration-200 group"
                      >
                        <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => router.push('/dashboard/subjects')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all duration-200"
                      >
                        <BookOpen className="w-4 h-4" />
                        Subjects
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Help & Support */}
                <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold">Need assistance?</h3>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-4">
                    Our support team is here to help you find what you're looking for.
                  </p>
                  
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all duration-200 group">
                      <span>Contact Support</span>
                      <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button 
                      onClick={() => window.location.reload()}
                      className="w-full flex items-center justify-between px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all duration-200 group"
                    >
                      <span>Refresh Page</span>
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="text-white/70 text-xs mb-2">Or try searching:</p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search for tests, subjects..."
                        className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-400 transition-colors"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            router.push(`/dashboard?search=${e.target.value}`);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-center gap-6 text-xs text-white/50">
                <button onClick={() => router.push('/')} className="hover:text-white/80 transition-colors flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Home
                </button>
                <button onClick={() => router.push('/dashboard')} className="hover:text-white/80 transition-colors">
                  Dashboard
                </button>
                <button onClick={() => router.push('/profile')} className="hover:text-white/80 transition-colors">
                  Profile
                </button>
                <button onClick={() => router.push('/settings')} className="hover:text-white/80 transition-colors">
                  Settings
                </button>
                <button onClick={() => router.push('/help')} className="hover:text-white/80 transition-colors">
                  Help Center
                </button>
              </div>
            </div>
          </div>

          {/* Decorative Map Pin */}
          <div className="absolute bottom-8 right-8 opacity-20">
            <MapPin className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}