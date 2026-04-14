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
  ZapIcon
} from "lucide-react";

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalTests: 0,
    totalQuestions: 0
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    filterSubjects();
  }, [searchTerm, subjects]);

//   refresh
const refreshSubjects = () => {
    fetchSubjects();
  }

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
      const data = await res.json();
    
      setSubjects(data.data || []);
      setFilteredSubjects(data.subjects || []);
      
      // Calculate stats
      const totalTestsCount = data.subjects?.reduce((sum, subject) => sum + (subject.testCount || 0), 0) || 0;
      const totalQuestionsCount = data.subjects?.reduce((sum, subject) => sum + (subject.questionCount || 0), 0) || 0;
      
      setStats({
        totalSubjects: data.subjects?.length || 0,
        totalTests: totalTestsCount,
        totalQuestions: totalQuestionsCount
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterSubjects = () => {
    if (!searchTerm.trim()) {
      setFilteredSubjects(subjects);
      return;
    }
    
    const filtered = subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubjects(filtered);
  };

  const handleSubjectClick = (subjectId) => {
    router.push(`/dashboard/subject-wise-test/${subjectId}`);
  };

  const getSubjectIcon = (subjectName) => {
    const icons = {
      'mathematics': '📐',
      'math': '📐',
      'science': '🔬',
      'physics': '⚡',
      'chemistry': '🧪',
      'biology': '🧬',
      'history': '📜',
      'geography': '🌍',
      'english': '📖',
      'computer': '💻',
      'programming': '👨‍💻',
      'default': '📚'
    };
    
    const lowerName = subjectName.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerName.includes(key)) return icon;
    }
    return icons.default;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <div className="flex items-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        Subjects
                    </h1>
                    <button onClick={refreshSubjects} className="ml-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        <ZapIcon className="w-4 h-4" />
                    </button>
                </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Choose a subject to explore available tests
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.totalSubjects}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Tests</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.totalTests}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Questions</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.totalQuestions}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div> */}

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        {filteredSubjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                No subjects found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "Try adjusting your search term" : "No subjects are available at the moment"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject, index) => (
              <div
                key={subject._id || subject.id || index}
                onClick={() => handleSubjectClick(subject._id || subject.id)}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group overflow-hidden"
              >
                {/* Subject Header with Color */}
                <div className={`bg-gradient-to-r ${getSubjectColor(index)} p-0.5 text-white`}>
                  <div className="flex items-center justify-between">
                    <img src={subject.imageUrl} alt="" />
                  </div>
                  
                </div>
                
                {/* Subject Content */}
                <div className="p-4">
                  {subject.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {subject.description}
                    </p>
                  )}
                  
                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Target size={14} />
                        <span>Total Tests</span>
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {subject.testCount || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <BarChart3 size={14} />
                        <span>Questions</span>
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {subject.questionCount || 0}
                      </span>
                    </div>
                    
                    {subject.averageScore && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <TrendingUp size={14} />
                          <span>Avg. Score</span>
                        </div>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {subject.averageScore}%
                        </span>
                      </div>
                    )}
                    
                    {subject.popularity && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Users size={14} />
                          <span>Attempts</span>
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {subject.popularity}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Topics Preview */}
                  {subject.topics && subject.topics.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Popular Topics:</p>
                      <div className="flex flex-wrap gap-1">
                        {subject.topics.slice(0, 3).map((topic, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                        {subject.topics.length > 3 && (
                          <span className="text-xs px-2 py-1 text-gray-500">
                            +{subject.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2">
                    Explore Tests
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