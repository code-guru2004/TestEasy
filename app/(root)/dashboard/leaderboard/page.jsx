"use client"
// pages/leaderboard.jsx or app/leaderboard/page.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { CircleAlert } from "lucide-react";

const LeaderboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("normal");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 50
  });

  useEffect(() => {
    if (user?._id) {
      fetchUserRank();
    }
    fetchLeaderboardData();
  }, [user, activeTab, pagination.currentPage]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = activeTab === "normal"
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard/weighted`;

      const response = await axios.get(endpoint, {
        params: {
          page: pagination.currentPage,
          limit: pagination.limit
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data.success) {
        setLeaderboardData(response.data.data);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.pagination?.totalPages || 1,
          totalUsers: response.data.pagination?.totalUsers || 0
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard/user/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      if (response.data.success) {
        setUserRank(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch user rank:", err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1: return "text-yellow-500";
      case 2: return "text-gray-400";
      case 3: return "text-amber-600";
      default: return "text-gray-600";
    }
  };

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-2">Top performers ranked by test attempts and scores</p>
          {/* Info Icon with Tooltip */}
          <div className="fixed bottom-6 right-6 z-50">
            <div className="relative group">
              <button className="bg-pink-600  text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-pink-700 transition-colors">
                {/* pinging div */}
                
                <CircleAlert />
              </button>

              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 w-80 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4">
                  <h4 className="font-semibold mb-2 text-white">How Leaderboard Works</h4>
                  <div className="space-y-2 text-gray-300">
                    <p>🏆 <span className="font-medium text-white">Normal Leaderboard:</span> Ranked by number of unique tests attempted, then by average score percentage</p>
                    <p>⚖️ <span className="font-medium text-white">Weighted Leaderboard:</span> 60% weight on test attempts + 40% weight on average score</p>
                    <p>📊 <span className="font-medium text-white">Average Score:</span> (Total score / Total marks) × 100</p>
                  </div>
                </div>
                {/* Tooltip arrow */}
                <div className="absolute -bottom-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
          </div>
        </div>

        {/* User Rank Card - Top */}
        {userRank && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6 overflow-hidden">
            <div className="bg-blue-600 px-6 py-3">
              <h2 className="text-white font-semibold text-lg">Your Ranking</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Current Rank</p>
                  <p className="text-2xl font-bold text-blue-600">#{userRank.rank}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Unique Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{userRank.uniqueTestsCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Avg. Score</p>
                  <p className="text-2xl font-bold text-gray-900">{userRank.averageScorePercentage}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Participants</p>
                  <p className="text-2xl font-bold text-gray-900">{userRank.totalUsersRanked}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => {
                  setActiveTab("normal");
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base transition-colors ${activeTab === "normal"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Normal Leaderboard
              </button>
              <button
                onClick={() => {
                  setActiveTab("weighted");
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base transition-colors ${activeTab === "weighted"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Weighted Leaderboard
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading leaderboard...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchLeaderboardData}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No data available</p>
              </div>
            ) : (
              <>
                {/* Table - Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unique Tests
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Score
                        </th>
                        {activeTab === "weighted" && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Weighted Score
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaderboardData.map((entry) => (
                        <tr
                          key={entry.user.id}
                          className={`hover:bg-gray-50 transition-colors ${user?._id === entry.user.id ? "bg-blue-50" : ""
                            }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getMedalEmoji(entry.rank) && (
                                <span className="text-xl mr-2">{getMedalEmoji(entry.rank)}</span>
                              )}
                              <span className={`font-semibold ${getMedalColor(entry.rank)}`}>
                                #{entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {entry.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {entry.user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.uniqueTestsCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-semibold text-gray-900">
                                {entry.averageScorePercentage}%
                              </div>
                              <div className="ml-2 flex-1">
                                <div className="bg-gray-200 rounded-full h-2 w-24">
                                  <div
                                    className="bg-green-600 rounded-full h-2"
                                    style={{ width: `${entry.averageScorePercentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                          {activeTab === "weighted" && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-blue-600">
                                {entry.weightedScore}
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards - Mobile */}
                <div className="md:hidden space-y-4">
                  {leaderboardData.map((entry) => (
                    <div
                      key={entry.user.id}
                      className={`bg-white border rounded-lg p-4 shadow-sm ${user?._id === entry.user.id ? "border-blue-600 bg-blue-50" : "border-gray-200"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {getMedalEmoji(entry.rank) && (
                            <span className="text-2xl mr-2">{getMedalEmoji(entry.rank)}</span>
                          )}
                          <span className={`font-bold text-lg ${getMedalColor(entry.rank)}`}>
                            #{entry.rank}
                          </span>
                        </div>
                        {user?._id === entry.user.id && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        <h3 className="font-semibold text-gray-900">{entry.user.name}</h3>
                        <p className="text-sm text-gray-500">{entry.user.email}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-600">Unique Tests</p>
                          <p className="text-lg font-semibold text-gray-900">{entry.uniqueTestsCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Avg. Score</p>
                          <p className="text-lg font-semibold text-green-600">{entry.averageScorePercentage}%</p>
                        </div>
                        {activeTab === "weighted" && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-600">Weighted Score</p>
                            <p className="text-lg font-semibold text-blue-600">{entry.weightedScore}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)}
                          </span>{" "}
                          of <span className="font-medium">{pagination.totalUsers}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (pagination.currentPage >= pagination.totalPages - 2) {
                              pageNum = pagination.totalPages - 4 + i;
                            } else {
                              pageNum = pagination.currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNum === pagination.currentPage
                                  ? "z-10 bg-blue-600 border-blue-600 text-white"
                                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                  }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;