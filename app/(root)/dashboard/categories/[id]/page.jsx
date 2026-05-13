// app/category/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  FolderTree,
  Layers,
  BookOpen,
  TrendingUp,
  Tag,
  MapPin,
  ArrowLeft,
  Loader,
  ChevronRight,
  Award,
  Clock,
  Users,
  Sparkles,
  Zap,
  Star,
  GraduationCap,
  Target,
  BarChart3
} from "lucide-react";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCategoryDetails();
    }
  }, [id]);

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`);
      setCategory(response.data.data);
    } catch (error) {
      console.error("Error fetching category details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    switch(iconName) {
      case 'FolderTree': return FolderTree;
      case 'Layers': return Layers;
      case 'BookOpen': return BookOpen;
      case 'TrendingUp': return TrendingUp;
      case 'Tag': return Tag;
      case 'MapPin': return MapPin;
      default: return FolderTree;
    }
  };

  const handleSubjectClick = (subjectId) => {
    router.push(`/dashboard/categories/${id}/subject/${subjectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
            <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-xl animate-fade-in-up mb-2">
          <FolderTree size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Category not found</p>
          <button
            onClick={() => router.push("/dashboard/categories")}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  const IconComponent = getIconComponent(category.icon);
  const totalTopics = category.subjects?.reduce((sum, subject) => sum + (subject.topicCount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Back Button */}
      

      {/* Category Header - Redesigned */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-20">
        <button
          onClick={() => router.back()}
          className="group flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg hover:shadow-xl"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back to Categories</span>
        </button>
      </div>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              <Sparkles size={12 + Math.random() * 10} className="text-white/30" />
            </div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 animate-fade-in-up">
            <div className="flex items-start space-x-6">
              {/* Icon with Glow Effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-2xl filter blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative bg-white/20 backdrop-blur-xl p-5 rounded-2xl border border-white/30 shadow-2xl">
                  <IconComponent size={56} className="text-white" />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 text-white/90 text-sm font-medium mb-4">
                  <Zap size={14} className="text-yellow-300" />
                  <span>Premium Category</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg text-indigo-100 max-w-2xl leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 border border-white/20 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-2 text-white/90 mb-1">
                  <BookOpen size={18} />
                  <span className="text-sm">Total Subjects</span>
                </div>
                <div className="text-3xl font-bold text-white">{category.totalSubjects || 0}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 border border-white/20 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-2 text-white/90 mb-1">
                  <Target size={18} />
                  <span className="text-sm">Total Topics</span>
                </div>
                <div className="text-3xl font-bold text-white">{totalTopics}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 border border-white/20 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-2 text-white/90 mb-1">
                  <Users size={18} />
                  <span className="text-sm">Active Learners</span>
                </div>
                <div className="text-3xl font-bold text-white">1.2k+</div>
              </div>
            </div>
          </div>

          {/* Category Features */}
          <div className="flex flex-wrap gap-4 mt-12 pt-8 border-t border-white/20">
            <div className="flex items-center gap-2 text-indigo-100">
              <Star size={16} className="text-yellow-300" />
              <span className="text-sm">Expert-curated content</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-100">
              <GraduationCap size={16} />
              <span className="text-sm">Exam-focused material</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-100">
              <BarChart3 size={16} />
              <span className="text-sm">Progress tracking</span>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="text-gray-50 dark:text-gray-900 fill-current"></path>
          </svg>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Subjects in {category.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Explore all subjects under this category and start your learning journey
              </p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full px-4 py-2">
              <span className="text-indigo-700 dark:text-indigo-300 font-semibold">
                {category.subjects?.length || 0} Subjects Available
              </span>
            </div>
          </div>
        </div>

        {category.subjects && category.subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.subjects.map((subject, index) => (
              <div
                key={subject._id}
                onClick={() => handleSubjectClick(subject._id)}
                style={{ animationDelay: `${index * 0.1}s` }}
                className="group cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-200/50 dark:border-gray-700/50 animate-fade-in-up"
              >
                {subject.imageUrl ? (
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={subject.imageUrl} 
                      alt={subject.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                    <BookOpen size={64} className="text-white opacity-70 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                      {subject.name}
                    </h3>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  {subject.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                      {subject.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium">
                        <Target size={12} />
                        {subject.difficultyLevel || 'Beginner'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <BookOpen size={12} />
                        {subject.topicCount || 0} Topics
                      </span>
                    </div>
                    <div className="text-indigo-600 dark:text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Start Learning →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-16 text-center border border-gray-200/50 dark:border-gray-700/50 animate-fade-in-up">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full filter blur-2xl opacity-20 animate-pulse"></div>
              <BookOpen size={80} className="relative text-gray-400 mb-4" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No Subjects Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Subjects under this category will appear here once added
            </p>
          </div>
        )}

        {/* Recommended Section */}
        {category.subjects && category.subjects.length > 0 && (
          <div className="mt-16 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-indigo-600 dark:text-indigo-400" size={28} />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pro Tip</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
              Start with the fundamentals and gradually move to advanced topics. Each subject is structured to build your knowledge progressively.
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1">
                View Learning Path
              </button>
              <button className="px-4 py-2 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300">
                Take Assessment
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
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
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
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