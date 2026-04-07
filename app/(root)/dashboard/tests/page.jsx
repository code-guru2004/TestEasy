"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ChevronDown,
  Clock,
  Calendar,
  Award,
  Users,
  FileText,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Play,
  Info,
  BookOpen,
  Zap,
  Target,
  BarChart3
} from "lucide-react";

export default function UserTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [userAttempts, setUserAttempts] = useState({});

  useEffect(() => {
    fetchPublishedTests();
    fetchUserAttempts();
  }, []);

  useEffect(() => {
    filterTests();
  }, [searchTerm, difficultyFilter, tests]);

  const fetchPublishedTests = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://govt-quiz-app.onrender.com/api/user/tests/published",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await res.json();
      setTests(data.tests || []);
      setFilteredTests(data.tests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAttempts = async () => {
    try {
      const res = await fetch(
        "https://govt-quiz-app.onrender.com/api/user/attempts",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = await res.json();
      const attemptsMap = {};
      data.attempts?.forEach(attempt => {
        attemptsMap[attempt.testId] = attempt;
      });
      setUserAttempts(attemptsMap);
    } catch (err) {
      console.error(err);
    }
  };

  const filterTests = () => {
    let filtered = [...tests];

    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (difficultyFilter !== "all") {
      // Assuming tests have an average difficulty or you can filter based on questions
      filtered = filtered.filter(test => {
        if (difficultyFilter === "easy") return test.difficulty === "easy";
        if (difficultyFilter === "medium") return test.difficulty === "medium";
        if (difficultyFilter === "hard") return test.difficulty === "hard";
        return true;
      });
    }

    setFilteredTests(filtered);
  };

  const getTestStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return { label: "Upcoming", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Calendar };
    } else if (now >= start && now <= end) {
      return { label: "Active", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle };
    } else {
      return { label: "Expired", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400", icon: XCircle };
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch(difficulty) {
      case 'easy': return { label: 'Easy', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: '🟢' };
      case 'medium': return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '🟡' };
      case 'hard': return { label: 'Hard', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: '🔴' };
      default: return { label: 'Not specified', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400', icon: '⚪' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStartTest = (test) => {
    const status = getTestStatus(test.startTime, test.endTime);
    if (status.label === "Active") {
      router.push(`/user/test/${test._id}/start`);
    } else if (status.label === "Upcoming") {
      alert("This test hasn't started yet!");
    } else {
      alert("This test has expired!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading available tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Available Tests
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Challenge yourself with our curated assessments
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Tests", value: tests.length, icon: FileText, color: "from-blue-500 to-blue-600" },
            { label: "Active Tests", value: tests.filter(t => getTestStatus(t.startTime, t.endTime).label === "Active").length, icon: Play, color: "from-green-500 to-green-600" },
            { label: "Upcoming", value: tests.filter(t => getTestStatus(t.startTime, t.endTime).label === "Upcoming").length, icon: Calendar, color: "from-yellow-500 to-yellow-600" },
            { label: "Avg. Duration", value: `${Math.round(tests.reduce((sum, t) => sum + t.duration, 0) / tests.length || 0)} min`, icon: Clock, color: "from-purple-500 to-pink-500" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tests by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
              >
                <Filter size={18} />
                Filters
                <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                No tests found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || difficultyFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No published tests are available at the moment"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTests.map((test) => {
              const status = getTestStatus(test.startTime, test.endTime);
              const StatusIcon = status.icon;
              const userAttempt = userAttempts[test._id];
              const difficultyBadge = getDifficultyBadge(test.difficulty);
              
              return (
                <div
                  key={test._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  {/* Test Header */}
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            {test.title}
                          </h2>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </div>
                        {test.description && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {test.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Test Stats */}
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock size={16} />
                        <span>{test.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Award size={16} />
                        <span>{test.questions?.length || 0} questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users size={16} />
                        <span>Max {test.maxAttempts} attempt{test.maxAttempts !== 1 ? 's' : ''}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-sm px-2 py-0.5 rounded-full ${difficultyBadge.color}`}>
                        <span>{difficultyBadge.icon}</span>
                        <span>{difficultyBadge.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Test Schedule */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>Starts: {formatDate(test.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>Ends: {formatDate(test.endTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* User Attempt Info */}
                  {userAttempt && (
                    <div className="px-6 py-3 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={14} className="text-purple-600" />
                          <span className="text-purple-700 dark:text-purple-300">Your Score:</span>
                          <span className="font-semibold text-purple-800 dark:text-purple-200">
                            {userAttempt.score}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 size={14} className="text-purple-600" />
                          <span className="text-purple-700 dark:text-purple-300">Attempts: {userAttempt.attemptCount}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-6">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStartTest(test)}
                        disabled={status.label !== "Active"}
                        className={`flex-1 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                          status.label === "Active"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <Play size={18} />
                        {status.label === "Active" ? "Start Test" : status.label}
                      </button>
                      
                      <button
                        onClick={() => setSelectedTest(selectedTest === test._id ? null : test._id)}
                        className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                      >
                        <Info size={18} />
                        Details
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {selectedTest === test._id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <Zap size={14} />
                              Test Rules
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6 list-disc">
                              <li>Duration: {test.duration} minutes</li>
                              <li>Maximum attempts: {test.maxAttempts}</li>
                              {test.negativeMarking > 0 && (
                                <li>Negative marking: {test.negativeMarking} marks per wrong answer</li>
                              )}
                              {test.passingPercentage && (
                                <li>Passing percentage: {test.passingPercentage}%</li>
                              )}
                              {test.shuffleQuestions && (
                                <li>Questions will be shuffled</li>
                              )}
                              {test.allowResume && (
                                <li>You can resume incomplete attempts</li>
                              )}
                            </ul>
                          </div>
                          
                          {test.totalMarks > 0 && (
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Target size={14} className="text-purple-600" />
                                <span className="text-gray-600 dark:text-gray-400">Total Marks: </span>
                                <span className="font-semibold text-gray-800 dark:text-white">{test.totalMarks}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}