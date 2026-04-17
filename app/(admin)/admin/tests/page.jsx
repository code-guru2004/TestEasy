"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Copy,
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { MdOutlinePublic, MdOutlinePublicOff } from "react-icons/md";

export default function AdminTestsPage() {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [searchTerm, statusFilter, tests]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://govt-quiz-app.onrender.com/api/admin/tests",
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

  const filterTests = () => {
    let filtered = [...tests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(test => {
        const startTime = new Date(test.startTime);
        const endTime = new Date(test.endTime);
        
        if (statusFilter === "active") {
          return startTime <= now && endTime >= now;
        } else if (statusFilter === "upcoming") {
          return startTime > now;
        } else if (statusFilter === "ended") {
          return endTime < now;
        }
        return true;
      });
    }

    setFilteredTests(filtered);
  };

  const deleteTest = async (testId, testTitle) => {
    if (confirm(`Are you sure you want to delete "${testTitle}"?`)) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tests/${testId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        if (res.ok) {
          setTests(tests.filter(test => test._id !== testId));
          alert("Test deleted successfully!");
        } else {
          alert("Failed to delete test");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred");
      }
    }
  };

  const makePublic = async (testId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${testId}/change-state`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = await res.json();
      //console.log(data.msg);
      
      if (res.ok) {
        alert(data.msg);
        fetchTests();
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
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
      return { label: "Ended", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400", icon: XCircle };
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

  const StatsCards = () => {
    const now = new Date();
    const activeTests = tests.filter(test => {
      const start = new Date(test.startTime);
      const end = new Date(test.endTime);
      return start <= now && end >= now;
    }).length;
    
    const upcomingTests = tests.filter(test => new Date(test.startTime) > now).length;
    const endedTests = tests.filter(test => new Date(test.endTime) < now).length;
    const totalQuestions = tests.reduce((sum, test) => sum + (test.questions?.length || 0), 0);



    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Tests", value: tests.length, icon: FileText, color: "from-blue-500 to-blue-600" },
          { label: "Active Tests", value: activeTests, icon: CheckCircle, color: "from-green-500 to-green-600" },
          { label: "Upcoming Tests", value: upcomingTests, icon: Calendar, color: "from-yellow-500 to-yellow-600" },
          { label: "Total Questions", value: totalQuestions, icon: BarChart3, color: "from-purple-500 to-pink-500" },
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
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Navigate to /admin/dashboard */}
          <div>
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition flex items-center gap-1 mb-4"
            >
              <ChevronDown size={16} className="rotate-90" />
              Back to Dashboard
            </button>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Test Management
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Create, manage, and monitor your assessments
                </p>
              </div>
            </div>
            <div className="flex gap-4">
                <button
                onClick={() => router.push("/admin/create-question")}
                className="bg-gradient-to-r from-green-500 to-green-500 hover:from-green-600 hover:to-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2 shadow-lg"
                >
                <Plus size={20} />
                Add Question
                </button>
                <button
                onClick={() => router.push("/admin/create-test")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2 shadow-lg"
                >
                <Plus size={20} />
                Create New Test
                </button>

            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

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
                <div className="flex gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Tests</option>
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ended">Ended</option>
                  </select>
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
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                No tests found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first test"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={() => router.push("/admin/tests/create")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create Test
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTests.map((test) => {
              const status = getTestStatus(test.startTime, test.endTime);
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={test._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Test Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {test.title}
                          </h2>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${test.isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {
                                test.isPublished ? (
                                    <MdOutlinePublic size={12} className=""/>
                                ) : (
                                    <MdOutlinePublicOff size={12} className=""/>
                                )
                            }
                            
                            {test?.isPublished? "Published" : "Draft"}
                          </span>
                        </div>
                        
                        {test.description && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                            {test.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{test.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 size={14} />
                            <span>{test.questions?.length || 0} questions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>Max {test.maxAttempts} attempt{test.maxAttempts !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Starts: {formatDate(test.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Ends: {formatDate(test.endTime)}</span>
                          </div>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="flex flex-wrap gap-3 mt-3">
                          {test.passingPercentage && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                              Pass: {test.passingPercentage}%
                            </span>
                          )}
                          {test.negativeMarking > 0 && (
                            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                              Negative: {test.negativeMarking} marks
                            </span>
                          )}
                          {test.shuffleQuestions && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                              Shuffle Questions
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {/* <button
                          onClick={() => router.push(`/admin/tests/${test._id}/questions`)}
                          className="px-4 py-2 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition flex items-center gap-2"
                          title="Manage Questions"
                        >
                          <BarChart3 size={16} />
                          <span className="hidden sm:inline"></span>
                          
                        </button> */}
                        {
                            test.isPublished ? (
                                <button
                                  onClick={() => makePublic(test._id)}
                                  className="px-4 py-2 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition flex items-center gap-2"
                                  title="Make Private" 
                                >
                                  <MdOutlinePublicOff size={16} className="text-orange-600 dark:text-orange-400" />
                                  <span className="hidden sm:inline">Make Private</span>
                                </button>
                            ): (
                                <button
                                  onClick={() => makePublic(test._id)}
                                  className="px-4 py-2 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition flex items-center gap-2"
                                  title="Make Public"
                                >
                                  <MdOutlinePublic size={16} className="text-green-600 dark:text-green-400" />
                                  <span className="hidden sm:inline">Make public</span>
                                </button>
                            )
                          }
                        
                        <button
                          onClick={() => router.push(`/admin/tests/${test._id}/edit`)}
                          className="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center gap-2"
                        >
                          <Edit size={16} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        
                        <button
                          onClick={() => router.push(`/admin/tests/${test._id}/preview`)}
                          className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                          title="Preview"
                        >
                          <Eye size={16} />
                          <span className="hidden sm:inline">Preview</span>
                        </button>
                        
                        <button
                          onClick={() => deleteTest(test._id, test.title)}
                          className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
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