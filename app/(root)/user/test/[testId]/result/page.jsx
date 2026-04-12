"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  FileText,
  Loader2,
  Home,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Target,
  Zap,
  Users,
  PieChart,
  Filter,
  Medal,
  Crown,
  Trophy
} from "lucide-react";

export default function TestResultPage() {
  const { testId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const attemptId = searchParams.get("attemptId");

  const [result, setResult] = useState(null);
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [leaderboard, setLeaderboard] = useState([]);
  const [answerFilter, setAnswerFilter] = useState("all"); // all, correct, incorrect
  const [expandedAnswers, setExpandedAnswers] = useState({});

  useEffect(() => {
    if (attemptId) {
      fetchResult();
      fetchTestDetails();
      fetchLeaderboard();
    }
  }, [attemptId, testId]);

   // Refetch when page becomes visible
   useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setLoading(true);
        //console.log("Page is visible, refetching results...");
        fetchResult();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  const fetchResult = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts/${attemptId}/result`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestDetails = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/test/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = await res.json();
      setTestDetails(data.test);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/tests/${testId}/leaderboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAnswerExpand = (index) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const calculatePercentage = (score, totalMarks) => {
    return ((score / totalMarks) * 100).toFixed(2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pie chart data
  const correctCount = result?.questions?.filter(q => q.isCorrect === true).length || 0;
  const wrongCount = result?.questions?.filter(q => q.isCorrect === false).length || 0;
  const unattemptedCount = result?.questions?.filter(q => !q.selectedOption).length || 0;
  const totalQuestions = result?.questions?.length || 0;
  
  const correctPercentage = totalQuestions ? (correctCount / totalQuestions) * 100 : 0;
  const wrongPercentage = totalQuestions ? (wrongCount / totalQuestions) * 100 : 0;
  const unattemptedPercentage = totalQuestions ? (unattemptedCount / totalQuestions) * 100 : 0;

  // Filter answers based on selection
  const getFilteredAnswers = () => {
    if (!result?.questions) return [];
    return result.questions.filter(q => {
      if (answerFilter === "correct") return q.isCorrect === true;
      if (answerFilter === "incorrect") return q.isCorrect === false;
      return true;
    });
  };

  const filteredAnswers = getFilteredAnswers();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Result Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300">Unable to load test results. Please try again.</p>
          <button
            onClick={() => router.push("/user/tests")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const percentage = calculatePercentage(result.score, result.totalMarks);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/user/tests")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition mb-4"
          >
            <Home size={18} />
            Back to Tests
          </button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Test Results
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {testDetails?.title || "Assessment"} • Completed on {formatDate(new Date())}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <Download size={18} />
              Download Report
            </button>
          </div>
        </div>

        {/* Score Overview Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Your Score</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Here's how you performed on this test</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-800 dark:text-white">{result.score} / {result.totalMarks}</div>
                <div className="text-gray-600 dark:text-gray-300">{percentage}%</div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="inline-flex p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{correctCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Correct</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-2">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{wrongCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Wrong</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-2">
                  <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{unattemptedCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unattempted</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{percentage}%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Performance</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === "details"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Attempt Details
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === "leaderboard"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {/* Tab 1: Attempt Details */}
        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Basic Test Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Test Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-medium text-gray-800 dark:text-white">{testDetails?.duration} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Questions</p>
                      <p className="font-medium text-gray-800 dark:text-white">{totalQuestions}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Started At</p>
                      <p className="font-medium text-gray-800 dark:text-white">{formatDate(testDetails?.startTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Submitted At</p>
                      <p className="font-medium text-gray-800 dark:text-white">{formatDate(new Date())}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Performance Overview</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                  {/* Simple Pie Chart using CSS conic-gradient */}
                  <div className="relative w-48 h-48">
                    <div 
                      className="w-full h-full rounded-full shadow-md"
                      style={{
                        background: `conic-gradient(
                          #10b981 0deg ${correctPercentage * 3.6}deg,
                          #ef4444 ${correctPercentage * 3.6}deg ${(correctPercentage + wrongPercentage) * 3.6}deg,
                          #9ca3af ${(correctPercentage + wrongPercentage) * 3.6}deg 360deg
                        )`
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white dark:bg-gray-800 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-sm">
                        <span className="text-xl font-bold text-gray-800 dark:text-white">{percentage}%</span>
                        <span className="text-xs text-gray-500">Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Correct: {correctCount} ({correctPercentage.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <span className="text-gray-700 dark:text-gray-300">Wrong: {wrongCount} ({wrongPercentage.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">Unattempted: {unattemptedCount} ({unattemptedPercentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* My Answers Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">My Answers</h2>
                  </div>
                  
                  {/* Filter Dropdown */}
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <select
                      value={answerFilter}
                      onChange={(e) => setAnswerFilter(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Questions</option>
                      <option value="correct">Correct Answers</option>
                      <option value="incorrect">Incorrect Answers</option>
                    </select>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Showing {filteredAnswers.length} of {totalQuestions} questions
                </p>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAnswers.length === 0 ? (
                  <div className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No questions match the selected filter</p>
                  </div>
                ) : (
                  filteredAnswers.map((q, index) => {
                    const originalIndex = result.questions.findIndex(orig => orig.questionId === q.questionId);
                    return (
                      <div key={index} className="p-6">
                        <button
                          onClick={() => toggleAnswerExpand(originalIndex)}
                          className="w-full text-left flex items-start justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Question {originalIndex + 1}
                              </span>
                              {q.isCorrect === true && (
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle size={12} />
                                  Correct
                                </span>
                              )}
                              {q.isCorrect === false && (
                                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <XCircle size={12} />
                                  Wrong
                                </span>
                              )}
                              {!q.selectedOption && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                  Unattempted
                                </span>
                              )}
                            </div>
                            <p className="text-gray-800 dark:text-white font-medium">
                              {q.questionText}
                            </p>
                            <div className="mt-2 text-sm">
                              <span className="text-gray-500">Your answer: </span>
                              <span className={q.isCorrect ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                                {q.selectedOption || "Not answered"}
                              </span>
                            </div>
                          </div>
                          {expandedAnswers[originalIndex] ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                        </button>
                        
                        {expandedAnswers[originalIndex] && (
                          <div className="mt-4 pl-4 border-l-4 border-gray-300 dark:border-gray-600">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">All Options:</p>
                                <div className="space-y-2">
                                  {q.options?.map((opt, optIdx) => (
                                    <div 
                                      key={optIdx}
                                      className={`text-sm p-2 rounded ${
                                        opt === q.correctAnswer 
                                          ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                                          : opt === q.selectedOption && opt !== q.correctAnswer
                                          ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                                          : "text-gray-600 dark:text-gray-400"
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optIdx)}. {opt}
                                      {opt === q.correctAnswer && (
                                        <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Correct Answer)</span>
                                      )}
                                      {opt === q.selectedOption && opt !== q.correctAnswer && (
                                        <span className="ml-2 text-xs text-red-600 dark:text-red-400">(Your Answer)</span>
                                      )}
                                      {opt === q.selectedOption && opt === q.correctAnswer && (
                                        <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Your Answer ✓)</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Leaderboard</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Top performers on this test
              </p>
            </div>

            {/* Top 3 Rankers */}
            {leaderboard.length > 0 && (
              <div className="p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <Medal size={18} className="text-yellow-600" />
                  Top Performers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {leaderboard.slice(0, 3).map((entry, idx) => (
                    <div 
                      key={idx}
                      className={`text-center p-4 rounded-lg ${
                        idx === 0 ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700" :
                        idx === 1 ? "bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600" :
                        "bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        {idx === 0 && <Crown size={32} className="text-yellow-500" />}
                        {idx === 1 && <Medal size={28} className="text-gray-500" />}
                        {idx === 2 && <Medal size={28} className="text-orange-500" />}
                      </div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">#{idx + 1}</div>
                      <p className="font-semibold text-gray-800 dark:text-white">{entry.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{entry.email}</p>
                      <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <span className="font-bold text-blue-700 dark:text-blue-400">{entry.score}</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400"> points</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Users Leaderboard */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-7">User</div>
                  <div className="col-span-4 text-right">Score</div>
                </div>
              </div>
              
              {leaderboard.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No leaderboard data available</p>
                </div>
              ) : (
                leaderboard.map((entry, idx) => (
                  <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          idx === 0 ? "bg-yellow-100 text-yellow-700" :
                          idx === 1 ? "bg-gray-100 text-gray-700" :
                          idx === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}>
                          #{idx + 1}
                        </div>
                      </div>
                      <div className="col-span-7">
                        <p className="font-medium text-gray-800 dark:text-white">{entry.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{entry.email}</p>
                      </div>
                      <div className="col-span-4 text-right">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{entry.score}</span>
                        <span className="text-xs text-gray-500 ml-1">pts</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-end">
          <button
            onClick={() => router.push("/user/test")}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
          >
            Browse More Tests
          </button>
          <button
            onClick={() => router.push(`/user/test/${testId}/start`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center gap-2"
          >
            <Zap size={18} />
            Retake Test
          </button>
        </div>
      </div>
    </div>
  );
}