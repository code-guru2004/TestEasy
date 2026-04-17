"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Star,
  Target,
  Zap,
  BarChart3,
  CheckCircle,
  Calendar,
  LayoutGrid,
  List,
  ArrowUpDown,
  Eye,
  ThumbsUp,
  Award
} from "lucide-react";

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'column'
  const [sortBy, setSortBy] = useState("name"); // 'name', 'tests', 'questions', 'popularity'
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalTests: 0,
    totalQuestions: 0,
    avgQuestionsPerSubject: 0
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    filterAndSortSubjects();
  }, [searchTerm, subjects, sortBy, sortOrder, selectedDifficulty]);

  const refreshSubjects = () => {
    fetchSubjects();
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/all/with-details`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const response = await res.json();
      
      // Fix: Access data from response.data array
      const subjectsData = response.data || [];
      setSubjects(subjectsData);
      setFilteredSubjects(subjectsData);
      
      // Calculate stats
      const totalTestsCount = subjectsData.reduce((sum, subject) => sum + (subject.testCount || 0), 0);
      const totalQuestionsCount = subjectsData.reduce((sum, subject) => sum + (subject.questionCount || 0), 0);
      
      setStats({
        totalSubjects: subjectsData.length,
        totalTests: totalTestsCount,
        totalQuestions: totalQuestionsCount,
        avgQuestionsPerSubject: subjectsData.length ? Math.round(totalQuestionsCount / subjectsData.length) : 0
      });
    } catch (err) {
      console.error("Error fetching subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSubjects = () => {
    let filtered = [...subjects];
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(subject =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply difficulty filter (if you have difficulty data)
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(subject => 
        subject.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase()
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "tests":
          aValue = a.testCount || 0;
          bValue = b.testCount || 0;
          break;
        case "questions":
          aValue = a.questionCount || 0;
          bValue = b.questionCount || 0;
          break;
        case "popularity":
          aValue = a.popularity || 0;
          bValue = b.popularity || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredSubjects(filtered);
  };

  const handleSubjectClick = (subjectId) => {
    router.push(`/dashboard/subject-wise-test/${subjectId}`);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    };
    return colors[difficulty?.toLowerCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  };

  const getSubjectColor = (index) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-purple-500 to-purple-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-teal-500 to-teal-600",
      "from-red-500 to-red-600"
    ];
    return colors[index % colors.length];
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto absolute top-2 left-2" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-4 font-medium">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Subjects
                  </h1>
                  <button 
                    onClick={refreshSubjects} 
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    title="Refresh"
                  >
                    <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Explore and master different subjects with our comprehensive test series
                </p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Subjects</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.totalSubjects}</p>
                  </div>
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Tests</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.totalTests}</p>
                  </div>
                  <Target className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.totalQuestions}</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg/Subject</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.avgQuestionsPerSubject}</p>
                  </div>
                  <Award className="w-5 h-5 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subjects by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode("column")}
                  className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                    viewMode === "column"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">List</span>
                </button>
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split("-");
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                  className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="tests-desc">Most Tests</option>
                  <option value="tests-asc">Least Tests</option>
                  <option value="questions-desc">Most Questions</option>
                  <option value="questions-asc">Least Questions</option>
                  <option value="popularity-desc">Most Popular</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  showFilters
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
              </button>
            </div>
            
            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-800 dark:text-white">{filteredSubjects.length}</span> of{" "}
            <span className="font-semibold text-gray-800 dark:text-white">{subjects.length}</span> subjects
          </p>
        </div>

        {/* Subjects Display */}
        {filteredSubjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-4 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                No subjects found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "Try adjusting your search term or filters" : "No subjects are available at the moment"}
              </p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject, index) => (
              <div
                key={subject._id || subject.id || index}
                onClick={() => handleSubjectClick(subject._id || subject.id)}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105"
              >
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${getSubjectColor(index)} p-4 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      {subject.imageUrl ? (
                        <img 
                          src={subject.imageUrl} 
                          alt={subject.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white/30"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                          {getInitials(subject.name)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{subject.name}</h3>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  {subject.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {subject.description}
                    </p>
                  )}
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                      <Target className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tests</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{subject.testCount || 0}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                      <BarChart3 className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{subject.questionCount || 0}</p>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                    Explore Tests
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Column/List View
          <div className="space-y-3">
            {filteredSubjects.map((subject, index) => (
              <div
                key={subject._id || subject.id || index}
                onClick={() => handleSubjectClick(subject._id || subject.id)}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer p-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Icon and Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {subject.imageUrl ? (
                      <img 
                        src={subject.imageUrl} 
                        alt={subject.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className={`w-12 h-12 bg-gradient-to-r ${getSubjectColor(index)} rounded-xl flex items-center justify-center text-white font-bold shadow-md`}>
                        {getInitials(subject.name)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{subject.name}</h3>
                      {subject.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                          {subject.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tests</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{subject.testCount || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{subject.questionCount || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action */}
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap">
                    Explore
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}