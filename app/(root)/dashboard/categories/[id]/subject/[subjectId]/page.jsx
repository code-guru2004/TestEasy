"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  Target,
  Users,
  ChevronLeft,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Play,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  ChevronDown,
  BarChart3,
  Sparkles,
  Zap,
  Star,
  Trophy,
  Timer,
  ClipboardList,
  ArrowRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SubjectWiseTestsPage() {
  const { subjectId } = useParams();
  const router = useRouter();

  const [subject, setSubject] = useState(null);
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [attemptsModalOpen, setAttemptsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  useEffect(() => {
    fetchSubjectTests();
  }, [subjectId]);

  useEffect(() => {
    filterTests();
  }, [searchTerm, difficultyFilter, statusFilter, tests]);

  const fetchSubjectTests = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tests/subject/${subjectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = await res.json();
     
      setSubject(data.subject);
      setTests(data.tests || []);
      setFilteredTests(data.tests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttempts = async (testId) => {
    try {
      setAttemptsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tests/${testId}/attempts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = await res.json();
      setAttempts(data.attempts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAttemptsLoading(false);
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
      filtered = filtered.filter(test => test.difficulty === difficultyFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(test => {
        const status = getTestStatus(test.startTime, test.endTime);
        if (statusFilter === "active") return status.label === "Active";
        if (statusFilter === "upcoming") return status.label === "Upcoming";
        if (statusFilter === "expired") return status.label === "Expired";
        return true;
      });
    }

    setFilteredTests(filtered);
  };

  const getTestStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return { label: "Upcoming", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Calendar };
    if (now >= start && now <= end) return { label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: Play };
    return { label: "Expired", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400", icon: XCircle };
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'easy': return { label: 'Easy', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '😊' };
      case 'medium': return { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: '🤔' };
      case 'hard': return { label: 'Hard', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: '🔥' };
      default: return { label: 'Not specified', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400', icon: '📚' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openAttemptsModal = (test) => {
    setSelectedTest(test);
    setAttemptsModalOpen(true);
    fetchAttempts(test._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
            <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-8 animate-fade-in-up">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg hover:shadow-xl"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Subjects</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {subject?.name || "Subject"} Tests
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  {subject?.description || "Available tests for this subject"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full px-4 py-2">
                <span className="text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-2">
                  <ClipboardList size={18} />
                  {filteredTests.length} Tests Available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Stats - Redesigned */}
        {subject && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-gray-200/50 dark:border-gray-700/50 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{subject.testCount || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Tests</p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-gray-200/50 dark:border-gray-700/50 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <Sparkles className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{subject.questionCount || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Questions</p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-gray-200/50 dark:border-gray-700/50 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Award className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{subject.averageScore || 0}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg. Score</p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-gray-200/50 dark:border-gray-700/50 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <Zap className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{subject.totalAttempts || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Attempts</p>
            </div>
          </div>
        )}

        {/* Search and Filters - Enhanced */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl mb-8 border border-gray-200/50 dark:border-gray-700/50 animate-fade-in-up">
          <div className="p-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search tests by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-5 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium"
              >
                <Filter size={18} />
                Filters
                <ChevronDown size={16} className={`transform transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="w-full p-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Test Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full p-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tests List - Redesigned Cards */}
        {filteredTests.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-16 text-center border border-gray-200/50 dark:border-gray-700/50 animate-fade-in-up">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full filter blur-2xl opacity-20 animate-pulse"></div>
              <AlertCircle className="w-20 h-20 text-gray-400 relative mx-auto mb-4" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No tests found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || difficultyFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No tests are available for this subject at the moment"}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredTests.map((test, index) => {
              const status = getTestStatus(test.startTime, test.endTime);
              const difficulty = getDifficultyBadge(test.difficulty);
              const StatusIcon = status.icon;

              return (
                <div
                  key={test._id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-gray-200/50 dark:border-gray-700/50 animate-fade-in-up"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      {/* LEFT SECTION */}
                      <div className="flex-1">
                        {/* Title and Badges */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {test.title}
                          </h3>
                          
                          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${status.color}`}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>

                          {test.canResume && (
                            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                              <Play size={12} />
                              In Progress
                            </span>
                          )}

                          {!test.canResume && test.completedAttemptsCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">
                              <CheckCircle size={12} />
                              Attempted
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {test.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                            {test.description}
                          </p>
                        )}

                        {/* Test Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg">
                              <Timer size={14} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{test.duration} min</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg">
                              <Target size={14} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{test.totalQuestions}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg">
                              <Award size={14} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total Marks</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{test.totalMarks}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <div className={`p-1.5 rounded-lg ${difficulty.color.split(' ')[0]}`}>
                              <span className="text-sm">{difficulty.icon}</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Difficulty</p>
                              <p className={`font-semibold ${difficulty.color.split(' ')[1]}`}>{difficulty.label}</p>
                            </div>
                          </div>
                        </div>

                        {/* Schedule */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>Start: {formatDate(test.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>End: {formatDate(test.endTime)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users size={14} />
                            <span>{test.completedAttemptsCount}/{test.maxAttempts} attempts used</span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT SECTION - ACTIONS */}
                      <div className="flex flex-row lg:flex-col gap-3 min-w-[160px]">
                        {test.canResume && (
                          <button
                            onClick={() => router.push(`/user/test/${test._id}/attempt/${test.activeAttemptId}?agreed=true`)}
                            className="group/btn px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <Play size={16} />
                            Resume Test
                          </button>
                        )}

                        {test.canViewResult && (
                          <button
                            onClick={() => openAttemptsModal(test)}
                            className="group/btn px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <Trophy size={16} />
                            View Results
                          </button>
                        )}

                        {test.canStart && (
                          <button
                            onClick={() => router.push(`/user/test/${test._id}`)}
                            className="group/btn px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <Play size={16} />
                            {test.completedAttemptsCount > 0 ? "Re-attempt" : "Start Test"}
                            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attempts Modal - Enhanced */}
      <Dialog open={attemptsModalOpen} onOpenChange={setAttemptsModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="text-indigo-600" size={24} />
              Attempt History
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {selectedTest?.title} - Select an attempt to view detailed results
            </DialogDescription>
          </DialogHeader>

          {attemptsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500 dark:text-gray-400">No attempts found for this test</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
              {attempts.map((attempt, index) => (
                <div
                  key={attempt._id}
                  className="group border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Score: {attempt.score ?? 0} / {selectedTest?.totalMarks || 0}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(attempt.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/user/result/${attempt._id}`)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  >
                    View Details
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style jsx>{`
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
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}