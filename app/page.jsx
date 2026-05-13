// app/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
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
  Sparkles,
  CheckCircle,
  Gift,
  Flame,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [hoveredExam, setHoveredExam] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
  }
  

  // Check for existing token
  useEffect(() => {
    const token = localStorage.getItem("token") || getCookie("token");
    
    if (token) {
      router.push("/dashboard");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const exams = [
    { name: "SSC CGL", image:"/exams/ssc.jpg", color: "from-blue-500 to-cyan-500", icon: "🎯", description: "Staff Selection Commission" },
    { name: "RRB NTPC",image:"/exams/rrb.png", color: "from-orange-500 to-red-500", icon: "🚂", description: "Railway Recruitment Board" },
    { name: "UPSC",image:"/exams/upsc.jpg", color: "from-purple-500 to-pink-500", icon: "🇮🇳", description: "Union Public Service Commission" },
    { name: "WBPSC",image:"/exams/wbpsc.jpg", color: "from-green-500 to-emerald-500", icon: "📚", description: "West Bengal Public Service" },
    { name: "WBSSC",image:"/exams/wbssc.jpg", color: "from-yellow-500 to-amber-500", icon: "✏️", description: "West Bengal School Service" },
    { name: "UP Police",image:"/exams/upsi.png", color: "from-indigo-500 to-blue-500", icon: "👮", description: "Uttar Pradesh Police" },
    { name: "WB Police",image:"/exams/wbp.png", color: "from-red-500 to-rose-500", icon: "🔍", description: "West Bengal Police" },
    { name: "Bank PO",image:"/exams/ibps.png", color: "from-teal-500 to-cyan-500", icon: "🏦", description: "IBPS & SBI Exams" },
  ];

  const features = [
    {
      title: "Topic Wise Tests",
      description: "Master each topic individually with focused practice tests and detailed solutions",
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      stats: "500+ Topics",
      benefits: ["Chapter-wise breakdown", "Instant results", "Weak area analysis"]
    },
    {
      title: "Subject Wise Tests",
      description: "Comprehensive subject coverage with in-depth analysis and performance tracking",
      icon: BookOpen,
      color: "from-purple-500 to-pink-500",
      stats: "20+ Subjects",
      benefits: ["Full syllabus coverage", "Comparative analysis", "Progress reports"]
    },
    {
      title: "Daily Contests",
      description: "Compete daily with thousands of aspirants and win exciting rewards",
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
      stats: "Daily Challenges",
      benefits: ["Live rankings", "Instant rewards", "Performance insights"]
    },
    {
      title: "Weekly Contests",
      description: "Week-long challenges to test your consistency and knowledge retention",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      stats: "Weekly Rankings",
      benefits: ["Cash prizes", "Certificates", "Leaderboard spots"]
    },
    {
      title: "Monthly Contests",
      description: "Ultimate test of your monthly preparation with grand prizes",
      icon: Trophy,
      color: "from-yellow-500 to-amber-500",
      stats: "Grand Prizes",
      benefits: ["Scholarships", "Mega rewards", "National ranking"]
    },
    {
      title: "Leaderboard",
      description: "Compete and rank against national level aspirants in real-time",
      icon: Crown,
      color: "from-indigo-500 to-purple-500",
      stats: "Live Rankings",
      benefits: ["Real-time updates", "Performance metrics", "Achievement badges"]
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
    { label: "Active Users", value: "100K+", icon: Users, trend: "+25%", color: "from-blue-500 to-cyan-500" },
    { label: "Tests Taken", value: "1M+", icon: BookOpen, trend: "+40%", color: "from-purple-500 to-pink-500" },
    { label: "Questions Solved", value: "50M+", icon: BarChart, trend: "+60%", color: "from-green-500 to-emerald-500" },
    { label: "Success Stories", value: "10K+", icon: Award, trend: "+35%", color: "from-orange-500 to-red-500" }
  ];

  const achievements = [
    { title: "Daily Practice", reward: "50 Coins", icon: Zap, color: "from-yellow-500 to-amber-500" },
    { title: "Weekly Champion", reward: "500 Coins", icon: Medal, color: "from-blue-500 to-cyan-500" },
    { title: "Perfect Score", reward: "100 Coins", icon: Crown, color: "from-purple-500 to-pink-500" },
    { title: "Top 10 Rank", reward: "1000 Coins", icon: Trophy, color: "from-orange-500 to-red-500" }
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
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white">India's #1 Test Portal</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              Master Your Dreams,
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> One Test at a Time</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Join millions of aspirants who are acing competitive exams with our comprehensive test series. 
              Topic-wise, Subject-wise, and Daily contests to boost your preparation.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/login"
                className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2 shadow-lg shadow-purple-500/30"
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
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
                >
                  <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                  <div className="text-xs text-green-400 mt-1">{stat.trend}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
          <div className="animate-bounce">
            <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
          </div>
        </motion.div>
      </section>

      {/* Exams Section */}
      <section className="py-20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Exams We Cover
            </h2>
            <p className="text-gray-300 text-lg">
              Comprehensive preparation for all major competitive exams
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {exams.map((exam, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onHoverStart={() => setHoveredExam(idx)}
                onHoverEnd={() => setHoveredExam(null)}
                className={`bg-gradient-to-br ${exam.color} p-6 rounded-2xl text-center transform transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl relative overflow-hidden group`}
              >
                <motion.div
                  animate={{ 
                    scale: hoveredExam === idx ? 1.1 : 1,
                    rotate: hoveredExam === idx ? 5 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={exam.image}
                    alt={exam.name}
                    width={50}
                    height={50}
                    className="mx-auto rounded-full"
                  />
                </motion.div>
                <div className="text-white font-semibold text-sm mt-2">{exam.name}</div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: hoveredExam === idx ? 1 : 0, y: hoveredExam === idx ? 0 : 10 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 rounded-2xl"
                >
                  <span className="text-white text-xs text-center">{exam.description}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Features That Make Us Different
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Everything you need to crack competitive exams in one place
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHoveredFeature(idx)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
              >
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  animate={{ opacity: hoveredFeature === idx ? 0.1 : 0 }}
                />
                <div className="relative">
                  <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-xl inline-block mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: hoveredFeature === idx ? 1 : 0, height: hoveredFeature === idx ? 'auto' : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 mb-4 pt-2">
                      {feature.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-400">{feature.stats}</span>
                    <ChevronRight className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-20 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
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
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10 hover:border-yellow-500/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`bg-gradient-to-r ${achievement.color} p-2 rounded-lg`}>
                        <achievement.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white">{achievement.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">{achievement.reward}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-8 text-purple-400 hover:text-purple-300 font-semibold group"
              >
                View Full Leaderboard
                <ArrowRight className="group-hover:translate-x-1 transition" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Weekly Top Performers</h3>
                  <Shield className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "Amit Singh", score: "1850", prize: "₹10,000", color: "from-yellow-500 to-amber-500" },
                    { rank: 2, name: "Priya Verma", score: "1820", prize: "₹5,000", color: "from-gray-400 to-gray-500" },
                    { rank: 3, name: "Rahul Mehta", score: "1790", prize: "₹2,500", color: "from-orange-600 to-red-600" },
                  ].map((player, idx) => (
                    <motion.div 
                      key={player.rank}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${player.color} flex items-center justify-center font-bold text-white`}>
                          {player.rank}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{player.name}</div>
                          <div className="text-sm text-gray-400">Score: {player.score}</div>
                        </div>
                      </div>
                      <div className="text-green-400 font-semibold">{player.prize}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Success Stories
            </h2>
            <p className="text-gray-300 text-lg">
              Join 10,000+ successful candidates who achieved their dreams with us
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Accelerate Your Success?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the fastest-growing test preparation platform in India. Start your journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2 shadow-lg shadow-purple-500/30"
              >
                Create Free Account
                <ArrowRight />
              </Link>
              <Link
                href="#pricing"
                className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 inline-flex items-center gap-2"
              >
                View Pricing
                <ChevronRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

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
        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(90deg); }
          50% { transform: translateY(10px) rotate(90deg); }
        }
        .animate-bounce {
          animation: bounce 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}