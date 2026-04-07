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
  Share2,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Target,
  Zap,
  Users
} from "lucide-react";

export default function TestResultPage() {
  const { testId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const attemptId = searchParams.get("attemptId");

  const [result, setResult] = useState(null);
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    if (attemptId) {
      fetchResult();
      fetchTestDetails();
      fetchLeaderboard();
    }
  }, [attemptId, testId]);

  const fetchResult = async () => {
    try {
      const res = await fetch(
        `https://govt-quiz-app.onrender.com/api/user/attempts/${attemptId}/result`,
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
        `https://govt-quiz-app.onrender.com/api/user/test/${testId}`,
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
        `https://govt-quiz-app.onrender.com/api/user/tests/${testId}/leaderboard`,
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

  const toggleQuestionExpand = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const calculatePercentage = (score, totalMarks) => {
    return ((score / totalMarks) * 100).toFixed(2);
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" };
    if (percentage >= 80) return { grade: "A", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" };
    if (percentage >= 70) return { grade: "B+", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" };
    if (percentage >= 60) return { grade: "B", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" };
    if (percentage >= 50) return { grade: "C", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" };
    return { grade: "F", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Result Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300">Unable to load test results. Please try again.</p>
          <button
            onClick={() => router.push("/user/test")}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const percentage = calculatePercentage(result.score, result.totalMarks);
  const grade = getGrade(percentage);
  const correctCount = result.questions?.filter(q => q.isCorrect === true).length || 0;
  const wrongCount = result.questions?.filter(q => q.isCorrect === false).length || 0;
  const unattemptedCount = result.questions?.filter(q => !q.selectedOption).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/user/test")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition mb-4"
          >
            <Home size={18} />
            Back to Tests
          </button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Award className="w-6 h-6 text-white" />
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
            
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
              >
                <Download size={18} />
                Download Report
              </button>
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition flex items-center gap-2"
              >
                <Users size={18} />
                Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Score Overview Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">Your Score</h2>
                <p className="text-purple-100">Here's how you performed on this test</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{result.score} / {result.totalMarks}</div>
                <div className="text-purple-100">{percentage}%</div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="inline-flex p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{correctCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Correct</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{wrongCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Wrong</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-2">
                  <AlertCircle className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{unattemptedCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unattempted</p>
              </div>
              
              <div className="text-center">
                <div className={`inline-flex p-3 ${grade.bg} rounded-full mb-2`}>
                  <TrendingUp className={`w-6 h-6 ${grade.color}`} />
                </div>
                <p className={`text-2xl font-bold ${grade.color}`}>{grade.grade}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Grade</p>
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
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        {showLeaderboard && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Leaderboard</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No leaderboard data available</div>
              ) : (
                leaderboard.map((entry, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? "bg-yellow-100 text-yellow-600" :
                        idx === 1 ? "bg-gray-100 text-gray-600" :
                        idx === 2 ? "bg-orange-100 text-orange-600" :
                        "bg-purple-100 text-purple-600"
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{entry.name}</p>
                        <p className="text-xs text-gray-500">{entry.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-600">{entry.score}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Detailed Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Detailed Analysis</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Review each question and your answers
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {result.questions?.map((q, index) => (
              <div key={index} className="p-6">
                <button
                  onClick={() => toggleQuestionExpand(index)}
                  className="w-full text-left flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        Question {index + 1}
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
                  </div>
                  {expandedQuestions[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedQuestions[index] && (
                  <div className="mt-4 pl-4 border-l-4 border-purple-200 dark:border-purple-800">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Options:</p>
                        <div className="space-y-1">
                          {q.options?.map((opt, optIdx) => (
                            <div 
                              key={optIdx}
                              className={`text-sm p-2 rounded ${
                                opt === q.correctAnswer 
                                  ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-l-4 border-green-500"
                                  : opt === q.selectedOption && opt !== q.correctAnswer
                                  ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-l-4 border-red-500"
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
                      
                      {q.timeSpent > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>Time spent: {Math.floor(q.timeSpent / 60)}m {q.timeSpent % 60}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-end">
          <button
            onClick={() => router.push("/user/test")}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
          >
            Browse More Tests
          </button>
          <button
            onClick={() => router.push(`/user/test/${testId}/start`)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-medium flex items-center gap-2"
          >
            <Zap size={18} />
            Retake Test
          </button>
        </div>
      </div>
    </div>
  );
}