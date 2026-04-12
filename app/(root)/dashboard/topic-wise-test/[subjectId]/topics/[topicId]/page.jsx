"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowLeft,
  Clock,
  FileText,
  Loader2,
  Calendar,
  Award,
  Users,
  PlayCircle,
  AlertCircle,
  BookOpen,
  FolderTree,
  CheckCircle,
  Zap,
  RefreshCw,
  XCircle,
  TrendingUp
} from "lucide-react";

export default function TopicWiseTestsPage() {
  const { subjectId, topicId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  const topicName = searchParams.get('topicName') || "Topic";
  const subjectName = searchParams.get('subjectName') || "Subject";
  
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTests();
  }, [subjectId, topicId]);
  // refresh component
  const refreshData = () => {
    fetchTests();
  }
  // Refetch when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchTests();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tests/subject/${subjectId}/topic/${topicId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      //console.log("Fetched tests:", response.data.tests);
      setTests(response.data.tests || []);
    } catch (err) {
      console.error("Error fetching tests:", err);
      setError(err.response?.data?.msg || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isTestActive = (test) => {
    const now = new Date();
    const startTime = new Date(test.startTime);
    const endTime = new Date(test.endTime);
    return startTime <= now && endTime >= now;
  };

  const isTestUpcoming = (test) => {
    const now = new Date();
    const startTime = new Date(test.startTime);
    return startTime > now;
  };

  // Get button configuration based on test data
  const getButtonConfig = (test) => {
    const remainingAttempts =
      test.maxAttempts === -1
        ? Infinity
        : test.maxAttempts - test.attemptCount;
  
    // 1️⃣ Resume has highest priority
    if (test.userTestStatus === "in-progress") {
      return { text: "Resume Test", disabled: false };
    }
  
    // 2️⃣ First attempt
    if (test.attemptCount === 0) {
      return { text: "Start Test", disabled: false };
    }
  
    // 3️⃣ Reattempt
    if (remainingAttempts > 0) {
      return { text: "Re-attempt Test", disabled: false };
    }
  
    // 4️⃣ No attempts left
    return { text: "No Attempts Left", disabled: true };
  };

  const getButtonColor = (variant, isActive) => {
    if (!isActive) {
      return "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed";
    }
    
    switch(variant) {
      case "danger":
        return "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow";
      case "secondary":
        return "bg-purple-500 hover:bg-purple-600 text-white shadow-sm hover:shadow";
      case "primary":
        return "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-sm hover:shadow";
      default:
        return "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-sm hover:shadow";
    }
  };

  const handleTestAction = (test) => {
    const isActive = isTestActive(test);
    const isUpcoming = isTestUpcoming(test);
  
    // ✅ 1. Time check
    if (!isActive) {
      if (isUpcoming) {
        alert("This test hasn't started yet. Please check back later.");
      } else {
        alert("This test has expired. No further attempts allowed.");
      }
      return;
    }
  
    // ✅ 2. 🔥 RESUME HAS TOP PRIORITY (before attempt check)
    if (test.userTestStatus === "in-progress" && test.attemptId) {
      router.push(`/user/attempt/${test.attemptId}`);
      return;
    }
  
    // ✅ 3. Calculate remaining attempts PROPERLY
    const remainingAttempts =
      test.maxAttempts === -1
        ? Infinity
        : test.maxAttempts - test.attemptCount;
  
    // ❌ 4. Only block NEW attempts
    if (remainingAttempts <= 0) {
      alert("You have no attempts left for this test.");
      return;
    }
  
    // ✅ 5. Start new attempt
    router.push(`/user/test/${test._id}`);
  };

  const getStatusBadge = (test) => {
    const isActive = isTestActive(test);
    const isUpcoming = isTestUpcoming(test);
    
    if (isActive) {
      return { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: <Zap size={12} />, text: "Active" };
    }
    if (isUpcoming) {
      return { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: <Calendar size={12} />, text: "Upcoming" };
    }
    return { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: <XCircle size={12} />, text: "Expired" };
  };

  const getUserStatusBadge = (status) => {
    switch(status) {
      case "completed":
        return { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", text: "Completed" };
      case "in-progress":
        return { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", text: "In Progress" };
      default:
        return { color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400", text: "Not Started" };
    }
  };

  const TestCard = ({ test }) => {
    const isActive = isTestActive(test);
    const statusBadge = getStatusBadge(test);
    const buttonConfig = getButtonConfig(test);
    const userStatusBadge = getUserStatusBadge(test.userTestStatus);
    const remainingAttempts = test.remainingAttempts || 0;
    const totalAttempts = test.maxAttempts || 0;
    const attemptsUsed = totalAttempts - remainingAttempts;
    const attemptPercentage = (attemptsUsed / totalAttempts) * 100;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {test.title}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${statusBadge.color}`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </span>
              </div>
              
              {test.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {test.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Test Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={14} className="text-purple-500" />
              <span>{test.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FileText size={14} className="text-purple-500" />
              <span>{test.totalQuestions || 0} questions</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Award size={14} className="text-purple-500" />
              <span>{test.totalMarks || 0} marks</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Users size={14} className="text-purple-500" />
              <span>{test.maxAttempts} attempt{test.maxAttempts !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {/* Attempts Progress */}
          {totalAttempts > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400">Attempts Used</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {attemptsUsed} / {totalAttempts}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${attemptPercentage}%` }}
                />
              </div>
              {remainingAttempts > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                </p>
              )}
            </div>
          )}
          
          {/* User Status */}
          {test.userTestStatus && (
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Your Status</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${userStatusBadge.color}`}>
                {userStatusBadge.text}
              </span>
            </div>
          )}
          
          {/* Schedule */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Starts: {formatDate(test.startTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Ends: {formatDate(test.endTime)}</span>
            </div>
          </div>
          
          {/* Action Button */}
          <button
            onClick={() => handleTestAction(test)}
            disabled={buttonConfig.disabled || !isActive}
            className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              getButtonColor(buttonConfig.variant, !buttonConfig.disabled && isActive)
            }`}
          >
            {buttonConfig.icon}
            {buttonConfig.text}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Failed to Load Tests
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-3 transition"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <BookOpen size={14} />
            <span>{subjectName}</span>
            <span>/</span>
            <FolderTree size={14} />
            <span>{topicName}</span>
          </div>
          
          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Available Tests
              </h1>
              <button
                onClick={refreshData}
                className="ml-1 p-1 rounded-full text-red-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                title="Refresh Tests"
              >
                <RefreshCw size={20} />
              </button>
            </div>  
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Choose a test to assess your knowledge
            </p>
          </div>
        </div>

        {/* Tests Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {tests.length} test{tests.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Tests List */}
        {tests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-1">
                No Tests Available
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                There are no tests for {topicName} at the moment.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Check back later for new tests
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <TestCard key={test._id} test={test} />
            ))}
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
      `}</style>
    </div>
  );
}