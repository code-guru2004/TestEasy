"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader,
  BarChart3
} from "lucide-react";

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useSelector((state) => state.auth);
  
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchUserDetails();
  }, [params.userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${params.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUser(response.data.data.user);
      setStatistics(response.data.data.statistics);
      setAttempts(response.data.data.attemptHistory);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">User not found</p>
          <button
            onClick={() => router.push("/admin/users")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
            <span>Back to Users</span>
          </button>
        </div>

        {/* User Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-purple-100 mt-1">{user.role}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mobile</p>
                  <p className="text-sm text-gray-900 dark:text-white">{user.mobile}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {user.isVerified ? (
                  <CheckCircle className="text-green-500" size={18} />
                ) : (
                  <XCircle className="text-yellow-500" size={18} />
                )}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Verification Status</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {user.isVerified ? "Verified" : "Unverified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {statistics.totalTests}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <FileText className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {Math.round(statistics.totalScore)}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <Award className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {Math.round(statistics.averagePercentage)}%
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {statistics.totalCorrect + statistics.totalWrong > 0
                      ? Math.round((statistics.totalCorrect / (statistics.totalCorrect + statistics.totalWrong)) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                  <BarChart3 className="text-yellow-600 dark:text-yellow-400" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4 px-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-2 text-sm font-medium border-b-2 transition ${
                  activeTab === "overview"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Test History
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-4 px-2 text-sm font-medium border-b-2 transition ${
                  activeTab === "analytics"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                {attempts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No test attempts found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attempts.map((attempt, idx) => (
                      <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {attempt.testTitle || "Untitled Test"}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(attempt.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {Math.round(attempt.percentage)}%
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Score: {Math.round(attempt.score)}/{attempt.totalMarks}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Correct</p>
                            <p className="font-medium text-green-600 dark:text-green-400">
                              {attempt.correctAnswers || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Wrong</p>
                            <p className="font-medium text-red-600 dark:text-red-400">
                              {attempt.wrongAnswers || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Unattempted</p>
                            <p className="font-medium text-yellow-600 dark:text-yellow-400">
                              {attempt.unattempted || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Time Taken</p>
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {Math.round(attempt.timeTakenMinutes)} min
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && statistics && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Performance Summary
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Average Score</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.round(statistics.averagePercentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${statistics.averagePercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Correct</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {statistics.totalCorrect}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Wrong</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                          {statistics.totalWrong}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Unattempted</p>
                        <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                          {statistics.totalUnattempted}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {statistics.totalCorrect + statistics.totalWrong > 0
                            ? Math.round((statistics.totalCorrect / (statistics.totalCorrect + statistics.totalWrong)) * 100)
                            : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Question Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Correct</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {statistics.totalCorrect}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(statistics.totalCorrect / (statistics.totalCorrect + statistics.totalWrong + statistics.totalUnattempted)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Wrong</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {statistics.totalWrong}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${(statistics.totalWrong / (statistics.totalCorrect + statistics.totalWrong + statistics.totalUnattempted)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Unattempted</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {statistics.totalUnattempted}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{
                            width: `${(statistics.totalUnattempted / (statistics.totalCorrect + statistics.totalWrong + statistics.totalUnattempted)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}