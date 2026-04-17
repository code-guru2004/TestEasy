// app/dashboard/page.jsx
"use client";
// pages/dashboard.jsx or app/dashboard/page.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { 
  User, 
  Bookmark, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award,
  CheckCircle,
  XCircle,
  BarChart3,
  Target,
  Star,
  Activity
} from "lucide-react";

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { personalDetails, testStatistics, recentActivity, totalBookmarks } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {personalDetails.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-orange-600/20 rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{testStatistics.totalTestsAttempted}</span>
            </div>
            <h3 className="text-sm font-medium text-orange-900">Tests Attempted</h3>
          </div>

          <div className="bg-green-600/10 rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{testStatistics.averageScore}%</span>
            </div>
            <h3 className="text-sm font-medium text-green-700">Average Score</h3>
          </div>

          <div className="bg-amber-500/10 rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">#{testStatistics.userRank || 'N/A'}</span>
            </div>
            <h3 className="text-sm font-medium text-yellow-600">Global Rank</h3>
          </div>

          <div className="bg-purple-600/10 rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bookmark className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalBookmarks}</span>
            </div>
            <h3 className="text-sm font-medium text-purple-600">Bookmarked Tests</h3>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Score Distribution */}
          <div className="bg-blue-600/10 rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Performance Overview
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium text-gray-900">{testStatistics.successRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 rounded-full h-2 transition-all duration-300"
                    style={{ width: `${testStatistics.successRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Best Score</span>
                  <span className="text-sm font-medium text-gray-900">{testStatistics.bestScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                    style={{ width: `${testStatistics.bestScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Average Score</span>
                  <span className="text-sm font-medium text-gray-900">{testStatistics.averageScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 rounded-full h-2 transition-all duration-300"
                    style={{ width: `${testStatistics.averageScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{testStatistics.passCount}</p>
                </div>
                <div className="text-gray-300 text-xl">/</div>
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{testStatistics.failCount}</p>
                </div>
                <div className="text-gray-300 text-xl">/</div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{testStatistics.totalTestsAttempted}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Wise Stats */}
          <div className="bg-cyan-600/20 rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-600" />
              Subject Performance
            </h3>
            {Object.keys(testStatistics.subjectWiseStats).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(testStatistics.subjectWiseStats).map(([subject, stats]) => (
                  <div key={subject}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{subject}</span>
                      <span className="text-sm text-gray-600">{Math.round(stats.averagePercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                        style={{ width: `${stats.averagePercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.attempts} attempts • {stats.totalScore}/{stats.totalMarks} marks
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No subject data available</p>
            )}
          </div>
        </div>

        {/* Latest Tests */}
        <div className="bg-red-500/10 rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Recent Tests
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.latestThreeTests.map((test, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{test.testName}</h4>
                      {test.percentage >= 70 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Excellent</span>
                      )}
                      {test.percentage >= 40 && test.percentage < 70 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Good</span>
                      )}
                      {test.percentage < 40 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Needs Improvement</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Bookmark className="w-3 h-3 mr-1" />
                        {test.subject}
                      </span>
                      <span className="flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        {test.topic !== "N/A" ? test.topic : "General"}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(test.submittedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {test.duration} mins
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {test.percentage}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {test.score}/{test.totalMarks} marks
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-gray-100 rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Performance Trend (Last 5 Tests)
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.performanceTrend.map((trend, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-gray-600">
                    {new Date(trend.date).toLocaleDateString()}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {trend.testName}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{trend.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`rounded-full h-2 transition-all duration-300 ${
                          trend.percentage >= 70 ? 'bg-green-600' : 
                          trend.percentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${trend.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personal Info Footer */}
        <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium text-gray-900">{personalDetails.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email Address</p>
              <p className="font-medium text-gray-900">{personalDetails.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mobile Number</p>
              <p className="font-medium text-gray-900">{personalDetails.mobile}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium text-gray-900">
                {new Date(personalDetails.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;