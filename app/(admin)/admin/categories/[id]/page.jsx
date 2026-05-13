"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  FolderTree,
  ArrowLeft,
  BookOpen,
  Layers,
  TrendingUp,
  Tag,
  MapPin,
  Loader,
  Edit,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  BarChart3,
  Award,
  Briefcase,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";

export default function CategoryViewPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { token } = useSelector((state) => state.auth);

  const [category, setCategory] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  // Available exams for filtering
  const availableExams = ['SSC', 'RRB_NTPC', 'UPSC', 'STATE_PSC', 'BANKING', 'OTHER'];

  useEffect(() => {
    if (id) {
      fetchCategoryData();
    }
  }, [id]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCategory(response.data.data);
      setSubjects(response.data.data.subjects || []);
      
    } catch (error) {
      console.error("Error fetching category:", error);
      showNotification("error", error.response?.data?.message || "Failed to load category data");
      
      // Redirect if category not found
      setTimeout(() => {
        router.push("/admin/categories");
      }, 2000);
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

  const getDifficultyColor = (level) => {
    switch(level) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // Filter subjects
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesExam = !selectedExam || 
                        (subject.examMapping && subject.examMapping.some(e => e.exam === selectedExam));
    
    return matchesSearch && matchesExam;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubjects = filteredSubjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);

  const IconComponent = category ? getIconComponent(category.icon) : FolderTree;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-purple-600" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Notification */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 animate-slide-down ${
            notification.type === "success" 
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}>
            {notification.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="flex-1">{notification.message}</span>
            <button 
              onClick={() => setNotification({ show: false, type: "", message: "" })}
              className="hover:opacity-70 transition"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Categories</span>
          </button>

          {/* Category Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div 
              className="relative h-48 rounded-t-2xl overflow-hidden"
              style={{ backgroundColor: category.colorCode }}
            >
              <div className="absolute inset-0 bg-black opacity-10"></div>
              {category.imageUrl && (
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <IconComponent className="text-white" size={40} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{category.name}</h1>
                    <div className="flex items-center space-x-4">
                      <span className="text-white/90 text-sm flex items-center space-x-1">
                        <Layers size={14} />
                        <span>{subjects.length} Subjects</span>
                      </span>
                      <span className="text-white/90 text-sm flex items-center space-x-1">
                        <BookOpen size={14} />
                        <span>{subjects.reduce((sum, s) => sum + (s.topicCount || 0), 0)} Topics</span>
                      </span>
                      {category.order !== undefined && (
                        <span className="text-white/90 text-sm flex items-center space-x-1">
                          <TrendingUp size={14} />
                          <span>Order: {category.order}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {category.description && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {category.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{subjects.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Layers size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active Subjects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {subjects.filter(s => s.isActive !== false).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Topics</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {subjects.reduce((sum, s) => sum + (s.topicCount || 0), 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <BookOpen size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Exam Coverage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {new Set(subjects.flatMap(s => s.examMapping?.map(e => e.exam) || [])).size}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Briefcase size={20} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center space-x-2"
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
              
              <button
                onClick={() => router.push(`/admin/subjects/create?category=${id}`)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium flex items-center space-x-2 hover:shadow-lg transition"
              >
                <Plus size={16} />
                <span>Add Subject</span>
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Exam
                  </label>
                  <select
                    value={selectedExam}
                    onChange={(e) => {
                      setSelectedExam(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Exams</option>
                    {availableExams.map(exam => (
                      <option key={exam} value={exam}>{exam}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subjects Grid */}
        {currentSubjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Subjects Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || selectedExam ? "No subjects match your search criteria" : "This category doesn't have any subjects yet"}
            </p>
            {(searchTerm || selectedExam) ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedExam("");
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => router.push(`/admin/subjects/create?category=${id}`)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
              >
                Add First Subject
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentSubjects.map((subject) => (
                <div
                  key={subject._id}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:scale-105"
                >
                  {/* Subject Header */}
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                          {subject.name}
                        </h3>
                        <div className="flex items-center space-x-2 flex-wrap gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(subject.difficultyLevel)}`}>
                            {subject.difficultyLevel || 'Beginner'}
                          </span>
                          {subject.examMapping && subject.examMapping.slice(0, 2).map((exam, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              {exam.exam}
                            </span>
                          ))}
                          {subject.examMapping && subject.examMapping.length > 2 && (
                            <span className="text-xs text-gray-500">+{subject.examMapping.length - 2}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => router.push(`/admin/subjects/edit/${subject._id}`)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                          title="Edit Subject"
                        >
                          <Edit size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                    {subject.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {subject.description}
                      </p>
                    )}
                  </div>

                  {/* Subject Stats */}
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <BookOpen size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Topics</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {subject.topicCount || 0}
                      </span>
                    </div>
                    
                    {subject.examMapping && subject.examMapping.length > 0 && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Award size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Important for</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {subject.examMapping.filter(e => e.important).length} Exams
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/subjects/${subject._id}`)}
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => router.push(`/admin/topics/create?subject=${subject._id}`)}
                      className="flex-1 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <Plus size={14} />
                      <span>Add Topic</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg transition ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                            : "border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </nav>
              </div>
            )}

            {/* Results Info */}
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSubjects.length)} of {filteredSubjects.length} subjects
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}