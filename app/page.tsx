// app/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  Users, 
  Star, 
  ChevronRight,
  Award,
  Clock,
  BookOpen,
  BarChart,
  Medal,
  Shield,
  Zap,
  Crown,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";


export default function HomePage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for existing token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const exams = [
    { name: "SSC CGL", image:"/exams/ssc.jpg", color: "from-blue-500 to-cyan-500", icon: "🎯" },
    { name: "RRB NTPC",image:"/exams/rrb.png", color: "from-orange-500 to-red-500", icon: "🚂" },
    { name: "UPSC",image:"/exams/upsc.jpg", color: "from-purple-500 to-pink-500", icon: "🇮🇳" },
    { name: "WBPSC",image:"/exams/wbpsc.jpg", color: "from-green-500 to-emerald-500", icon: "📚" },
    { name: "WBSSC",image:"/exams/wbssc.jpg", color: "from-yellow-500 to-amber-500", icon: "✏️" },
    { name: "UP Police",image:"/exams/upsi.png", color: "from-indigo-500 to-blue-500", icon: "👮" },
    { name: "WB Police",image:"/exams/wbp.png", color: "from-red-500 to-rose-500", icon: "🔍" },
    { name: "Bank PO",image:"/exams/ibps.png", color: "from-teal-500 to-cyan-500", icon: "🏦" },
  ];

  const features = [
    {
      title: "Topic Wise Tests",
      description: "Master each topic individually with focused practice tests",
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      gradient: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
      stats: "500+ Topics"
    },
    {
      title: "Subject Wise Tests",
      description: "Comprehensive subject coverage with detailed analysis",
      icon: BookOpen,
      color: "from-purple-500 to-pink-500",
      gradient: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
      stats: "20+ Subjects"
    },
    {
      title: "Daily Contests",
      description: "Compete daily with thousands of aspirants",
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
      gradient: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
      stats: "Daily Challenges"
    },
    {
      title: "Weekly Contests",
      description: "Week-long challenges to test your consistency",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      gradient: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
      stats: "Weekly Rankings"
    },
    {
      title: "Monthly Contests",
      description: "Ultimate test of your monthly preparation",
      icon: Trophy,
      color: "from-yellow-500 to-amber-500",
      gradient: "bg-gradient-to-br from-yellow-500/20 to-amber-500/20",
      stats: "Grand Prizes"
    },
    {
      title: "Leaderboard",
      description: "Compete and rank against national level aspirants",
      icon: Crown,
      color: "from-indigo-500 to-purple-500",
      gradient: "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
      stats: "Live Rankings"
    }
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "SSC CGL 2024 Qualified",
      exam: "SSC CGL",
      score: "Rank 47",
      image: "/images/p1.jpg",
      text: "The topic-wise tests helped me identify my weak areas. Daily contests kept me motivated throughout my preparation journey!",
      rating: 5
    },
    {
      name: "Surya Malik",
      role: "UPSC Aspirant",
      exam: "UPSC",
      score: "Mains Qualified",
      image: "/images/surya.jpg",
      text: "Best platform for competitive exam preparation. The leaderboard system pushes you to perform better every day.",
      rating: 5
    },
    {
      name: "Arka Pratim Saha",
      role: "Student",
      exam: "RRB",
      score: "Selected",
      image: "/images/arka.jpg",
      text: "Weekly contests were game-changing! The detailed analysis and comparison with toppers helped me improve drastically.",
      rating: 5
    },
    {
      name: "Mriganka De",
      role: "Student",
      exam: "Student",
      score: "Top 100",
      image: "/images/mriganka.jpg",
      text: "The subject-wise tests are incredibly well-structured. This platform made my preparation systematic and effective.",
      rating: 5
    }
  ];

  const stats = [
    { label: "Active Users", value: "100K+", icon: Users, trend: "+25%" },
    { label: "Tests Taken", value: "1M+", icon: BookOpen, trend: "+40%" },
    { label: "Questions Solved", value: "50M+", icon: BarChart, trend: "+60%" },
    { label: "Success Stories", value: "10K+", icon: Award, trend: "+35%" }
  ];

  const achievements = [
    { title: "Daily Practice", reward: "50 Coins", icon: Zap },
    { title: "Weekly Champion", reward: "500 Coins", icon: Medal },
    { title: "Perfect Score", reward: "100 Coins", icon: Crown },
    { title: "Top 10 Rank", reward: "1000 Coins", icon: Trophy }
  ];

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white">India's #1 Test Portal</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Master Your Dreams,
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> One Test at a Time</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join millions of aspirants who are acing competitive exams with our comprehensive test series. 
              Topic-wise, Subject-wise, and Daily contests to boost your preparation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="#features"
                className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 inline-flex items-center gap-2"
              >
                Explore Tests
                <ChevronRight />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                  <div className="text-xs text-green-400 mt-1">{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Exams Section */}
      <section className="py-20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Exams We Cover
            </h2>
            <p className="text-gray-300 text-lg">
              Comprehensive preparation for all major competitive exams
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {exams.map((exam, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${exam.color} p-6 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl`}
              >
                <div className="text-4xl mb-2">
                  <Image
                    src={exam.image}
                    alt={exam.name}
                    width={50}
                    height={50}
                    className="mx-auto rounded-full"
                  />
                </div>
                <div className="text-white font-semibold text-sm">{exam.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Features That Make Us Different
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Everything you need to crack competitive exams in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className={`absolute inset-0 ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-xl inline-block mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-400">{feature.stats}</span>
                    <ChevronRight className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-20 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 rounded-full px-4 py-2 mb-6">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Live Rankings</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Compete on the 
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> Leaderboard</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Track your progress, compare with toppers, and climb the ranks. Our advanced analytics help you understand where you stand among millions of aspirants.
              </p>
              <div className="space-y-4">
                {achievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3">
                      <achievement.icon className="w-6 h-6 text-purple-400" />
                      <span className="text-white">{achievement.title}</span>
                    </div>
                    <span className="text-yellow-400 font-semibold">{achievement.reward}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-8 text-purple-400 hover:text-purple-300 font-semibold group"
              >
                View Full Leaderboard
                <ArrowRight className="group-hover:translate-x-1 transition" />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Weekly Top Performers</h3>
                  <Shield className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "Amit Singh", score: "1850", prize: "₹10,000" },
                    { rank: 2, name: "Priya Verma", score: "1820", prize: "₹5,000" },
                    { rank: 3, name: "Rahul Mehta", score: "1790", prize: "₹2,500" },
                  ].map((player) => (
                    <div key={player.rank} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          player.rank === 1 ? "bg-yellow-500" : player.rank === 2 ? "bg-gray-400" : "bg-orange-600"
                        }`}>
                          {player.rank}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{player.name}</div>
                          <div className="text-sm text-gray-400">Score: {player.score}</div>
                        </div>
                      </div>
                      <div className="text-green-400 font-semibold">{player.prize}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Success Stories
            </h2>
            <p className="text-gray-300 text-lg">
              Join 10,000+ successful candidates who achieved their dreams with us
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-purple-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm">{testimonial.text}</p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-xs text-gray-400">{testimonial.exam}</span>
                  <span className="text-xs text-green-400">{testimonial.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Accelerate Your Success?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the fastest-growing test preparation platform in India. Start your journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Create Free Account
            </Link>
            <Link
              href="#"
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-xl">TestPortal</span>
              </div>
              <p className="text-gray-400 text-sm">
                India's most comprehensive test preparation platform for competitive exams.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">About Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">Contact Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Exams</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">SSC CGL</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">RRB NTPC</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">UPSC</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">Bank PO</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="bg-white/10 p-2 rounded-lg hover:bg-purple-500 transition">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="bg-white/10 p-2 rounded-lg hover:bg-purple-500 transition">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.428-12.157c0-.214-.005-.428-.015-.64A9.936 9.936 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="bg-white/10 p-2 rounded-lg hover:bg-purple-500 transition">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.689.073 7.053.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 TestPortal. All rights reserved. Made with ❤️ for aspirants.
            </p>
          </div>
        </div>
      </footer>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
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