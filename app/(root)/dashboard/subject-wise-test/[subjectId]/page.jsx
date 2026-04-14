// app/subject-wise-test/[subjectId]/page.js
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
  ChevronDown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


export default function SubjectWiseTestsPage() {
  const { subjectId } = useParams();
  const router = useRouter();

  const [subject, setSubject] = useState(null);
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [attemptsModalOpen, setAttemptsModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);


  useEffect(() => {
    fetchSubjectTests();
  }, [subjectId]);

  useEffect(() => {
    filterTests();
  }, [searchTerm, difficultyFilter, tests]);

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
      console.log("Fetched subject tests:", data);
      setSubject(data.subject);
      setTests(data.tests || []);
      setFilteredTests(data.tests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 
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

    setFilteredTests(filtered);
  };

  const getTestStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return { label: "Upcoming", color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" };
    if (now >= start && now <= end) return { label: "Active", color: "text-green-600 bg-green-50 dark:bg-green-900/20" };
    return { label: "Expired", color: "text-gray-600 bg-gray-50 dark:bg-gray-700" };
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'easy': return { label: 'Easy', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
      case 'medium': return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
      case 'hard': return { label: 'Hard', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
      default: return { label: 'Not specified', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' };
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

  const openAttemptsModal = (testId) => {
    setSelectedTestId(testId);
    setAttemptsModalOpen(true);
    fetchAttempts(testId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition mb-4"
          >
            <ChevronLeft size={18} />
            Back to Subjects
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {subject?.name || "Subject"} Tests
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {subject?.description || "Available tests for this subject"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Target size={16} />
              <span>{filteredTests.length} tests available</span>
            </div>
          </div>
        </div>

        {/* Subject Stats */}
        {subject && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Target size={14} />
                <span className="text-sm">Total Tests</span>
              </div>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{subject.testCount || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <BarChart3 size={14} />
                <span className="text-sm">Total Questions</span>
              </div>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{subject.questionCount || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <TrendingUp size={14} />
                <span className="text-sm">Avg. Score</span>
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{subject.averageScore || 0}%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Users size={14} />
                <span className="text-sm">Total Attempts</span>
              </div>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{subject.totalAttempts || 0}</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tests by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Filter size={18} />
                Filters
                <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
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

        {/* Tests List */}
        {filteredTests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                No tests found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || difficultyFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No tests are available for this subject at the moment"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTests.map((test) => {
              const status = getTestStatus(test.startTime, test.endTime);
              const difficulty = getDifficultyBadge(test.difficulty);

              return (
                <div
                  key={test._id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                      {/* LEFT SECTION */}
                      <div className="flex-1">

                        {/* Title */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {test.title}
                          </h3>

                          {/* STATUS BADGES */}
                          {test.canResume && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                              In Progress
                            </span>
                          )}

                          {!test.canResume && test.completedAttemptsCount > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                              Attempted
                            </span>
                          )}

                          {test.attemptCount === 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              Not Attempted
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {test.description && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                            {test.description}
                          </p>
                        )}

                        {/* DETAILS */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{test.duration} min</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Target size={14} />
                            <span>{test.totalQuestions} questions</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Award size={14} />
                            <span>{test.totalMarks} marks</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>
                              {test.completedAttemptsCount}/{test.maxAttempts} attempts used
                            </span>
                          </div>
                        </div>

                        {/* SCHEDULE */}
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Start: {formatDate(test.startTime)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>End: {formatDate(test.endTime)}</span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT SECTION (ACTIONS) */}
                      <div className="flex flex-col gap-2 min-w-[150px]">

                        {/* RESUME */}
                        {test.canResume && (
                          <button
                            onClick={() =>
                              router.push(`/user/test/${test._id}/attempt/${test.activeAttemptId}?agreed=true`)
                            }
                            className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium flex items-center justify-center gap-2"
                          >
                            <Play size={16} />
                            Resume
                          </button>
                        )}

                        {/* VIEW RESULT */}
                        {test.canViewResult && (
                          <button
                            onClick={() => openAttemptsModal(test._id)} // 👈 your modal
                            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium flex items-center justify-center gap-2"
                          >
                            View Results
                          </button>
                        )}

                        {/* START / RE-ATTEMPT */}
                        {test.canStart && (
                          <button
                            onClick={() => router.push(`/user/test/${test._id}`)}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2"
                          >
                            <Play size={16} />
                            {test.completedAttemptsCount > 0 ? "Re-attempt" : "Start"}
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
      <Dialog open={attemptsModalOpen} onOpenChange={setAttemptsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attempt History</DialogTitle>
            <DialogDescription>
              Select an attempt to view result
            </DialogDescription>
          </DialogHeader>

          {attemptsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin" />
            </div>
          ) : attempts.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No attempts found
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {attempts.map((attempt, index) => (
                <div
                  key={attempt._id}
                  className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      Attempt #{index + 1}
                    </p>

                    <p className="text-sm text-gray-500">
                      Score: {attempt.score ?? 0}
                    </p>

                    <p className="text-xs text-gray-400">
                      {new Date(attempt.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/user/result/${attempt._id}`
                      )
                    }
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}