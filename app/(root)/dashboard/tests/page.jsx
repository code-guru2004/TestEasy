"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ChevronDown,
  Clock,
  Award,
  Users,
  Play,
  Loader2,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Calendar,
  ChevronRight,
  Zap,
  XCircle,
  History,
  FileText,
  CheckCircle,
  TrendingUp,
  X,
  Layers,
  FileStack,
  Flag,
  Info,
  ChevronLeft
} from "lucide-react";

export default function UserTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [selectedTestForResults, setSelectedTestForResults] = useState(null);
  const [attemptsData, setAttemptsData] = useState(null);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [attemptsError, setAttemptsError] = useState(null);
  const [activeTab, setActiveTab] = useState("flat");
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchTests();
  }, [activeTab]);

  useEffect(() => {
    filterTests();
  }, [searchTerm, tests, selectedStatus]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const structure = activeTab === "flat" ? "flat" : "sectional";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tests?type=full&structure=${structure}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await res.json();
      
      setTests(data.data || []);
      setFilteredTests(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = [...tests];

    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(test => {
        const status = getTestStatus(test.startTime, test.endTime);
        return status === selectedStatus;
      });
    }

    setFilteredTests(filtered);
  };

  const getTestStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return "upcoming";
    if (now > end) return "expired";
    return "active";
  };

  // FIXED: Proper button configuration based on API response
  const getButtonConfig = (test) => {
    const status = getTestStatus(test.startTime, test.endTime);
    
    // Test is not active
    if (status !== "active") {
      return { 
        text: status === "upcoming" ? "Not Started" : "Expired", 
        disabled: true,
        variant: "disabled"
      };
    }
    
    // Check remaining attempts
    const remainingAttempts = test.remainingAttempts !== undefined ? test.remainingAttempts : (test.maxAttempts - test.attemptCount);
    
    if (remainingAttempts <= 0) {
      return { 
        text: "No Attempts Left", 
        disabled: true,
        variant: "danger"
      };
    }
    
    // Check if there's an in-progress attempt that can be resumed
    if (test.canResume && test.activeAttemptId) {
      return { 
        text: "Resume Test", 
        disabled: false,
        variant: "warning"
      };
    }
    
    // Check if can start a new attempt
    if (test.canStart && remainingAttempts > 0) {
      // Determine if it's a re-attempt or first attempt
      const isReAttempt = test.attemptCount > 0 && test.completedAttemptsCount > 0;
      return { 
        text: isReAttempt ? "Re-attempt" : "Start Test", 
        disabled: false,
        variant: "primary"
      };
    }
    
    // Default disabled state
    return { 
      text: "Not Available", 
      disabled: true,
      variant: "disabled"
    };
  };

  const getButtonColor = (variant, isActive, test) => {
    const status = getTestStatus(test?.startTime, test?.endTime);
    
    if (!isActive || status !== "active") {
      return "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed";
    }
    
    switch(variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm hover:shadow";
      case "primary":
        return "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow";
      default:
        return "bg-gray-400 text-white cursor-not-allowed";
    }
  };

  const handleTestAction = (test) => {
    const status = getTestStatus(test.startTime, test.endTime);
    
    if (status !== "active") {
      alert(status === "upcoming" ? "Test hasn't started yet" : "Test has expired");
      return;
    }
    
    const remainingAttempts = test.remainingAttempts !== undefined ? test.remainingAttempts : (test.maxAttempts - test.attemptCount);
    
    if (remainingAttempts <= 0) {
      alert("You have no attempts left for this test");
      return;
    }
    
    // Resume existing attempt
    if (test.canResume && test.activeAttemptId) {
      router.push(`/user/test/${test._id}?attemptId=${test.activeAttemptId}`);
      return;
    }
    
    // Start new attempt
    if (test.canStart && remainingAttempts > 0) {
      router.push(`/user/test/${test._id}`);
      return;
    }
    
    alert("Cannot start this test at the moment");
  };

  const fetchAttempts = async (testId) => {
    try {
      setLoadingAttempts(true);
      setAttemptsError(null);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tests/${testId}/attempts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await res.json();
      
      if (data && data.attempts) {
        setAttemptsData(data);
      } else {
        setAttemptsError(data.message || "Failed to fetch attempts");
      }
    } catch (err) {
      console.error(err);
      setAttemptsError("Network error. Please try again.");
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleShowResults = (test) => {
    setSelectedTestForResults(test);
    setShowResultsDialog(true);
    fetchAttempts(test._id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const calculatePercentage = (score, totalMarks) => {
    if (!score || !totalMarks) return 0;
    return (score / totalMarks) * 100;
  };

  const toggleSectionExpand = (testId, sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${testId}_${sectionIndex}`]: !prev[`${testId}_${sectionIndex}`]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Full Length Tests
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-12">
            Practice with comprehensive tests designed to simulate real exam conditions
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("flat")}
              className={`px-6 py-3 font-medium transition-all duration-200 flex items-center gap-2 rounded-t-lg ${
                activeTab === "flat"
                  ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400 bg-white dark:bg-gray-800"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <FileStack size={18} />
              Non-Sectional Tests
              {
                activeTab === "flat" && (
                  <span className="ml-1 text-xs px-2 py-0.5 bg-green-100 dark:bg-gray-700 rounded-full">
                    {tests.filter(t => !t.hasSections).length}
                  </span>

                )
              }
            </button>
            <button
              onClick={() => setActiveTab("sectional")}
              className={`px-6 py-3 font-medium transition-all duration-200 flex items-center gap-2 rounded-t-lg ${
                activeTab === "sectional"
                  ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400 bg-white dark:bg-gray-800"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Layers size={18} />
              Sectional Tests
              {
                activeTab == "sectional" && (
                  <span className="ml-1 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {tests.filter(t => t.hasSections).length}
                  </span>

                )
              }
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tests by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2 bg-white dark:bg-gray-800"
            >
              <Filter size={16} className="text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">Filters</span>
              <ChevronDown size={14} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStatus("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedStatus === "all"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  All Tests
                </button>
                <button
                  onClick={() => setSelectedStatus("active")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                    selectedStatus === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <Zap size={12} /> Active
                </button>
                <button
                  onClick={() => setSelectedStatus("upcoming")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                    selectedStatus === "upcoming"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <Calendar size={12} /> Upcoming
                </button>
                <button
                  onClick={() => setSelectedStatus("expired")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                    selectedStatus === "expired"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <XCircle size={12} /> Expired
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {filteredTests.length > 0 && (
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredTests.length}</span> of{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">{tests.length}</span> {activeTab === "flat" ? "non-sectional" : "sectional"} tests
            </p>
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center gap-1">
                <Zap size={10} /> Active
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full flex items-center gap-1">
                <Calendar size={10} /> Upcoming
              </span>
              <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full flex items-center gap-1">
                <XCircle size={10} /> Expired
              </span>
            </div>
          </div>
        )}

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                {activeTab === "flat" ? <FileStack size={32} className="text-gray-400" /> : <Layers size={32} className="text-gray-400" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                No {activeTab === "flat" ? "non-sectional" : "sectional"} tests found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? "Try adjusting your search" : `No ${activeTab === "flat" ? "non-sectional" : "sectional"} tests are available at the moment`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTests.map((test) => {
              const status = getTestStatus(test.startTime, test.endTime);
              const btn = getButtonConfig(test);
              const isActive = status === "active";
              const hasAttempts = test.attemptCount > 0;
              
              const statusConfig = {
                active: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <Zap size={12} />, label: "Active" },
                upcoming: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: <Calendar size={12} />, label: "Upcoming" },
                expired: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: <XCircle size={12} />, label: "Expired" }
              };

              // Determine if button should be enabled
              const isButtonEnabled = !btn.disabled && isActive;

              return (
                <div
                  key={test._id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="p-5 pb-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1">
                          {test.title}
                        </h2>
                        {test.hasSections && test.sectionDetails && (
                          <div className="flex items-center gap-2 mt-1">
                            <Layers size={14} className="text-purple-500" />
                            <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                              {test.sectionsCount} Sections
                            </span>
                          </div>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium ${statusConfig[status].color}`}>
                        {statusConfig[status].icon}
                        {statusConfig[status].label}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
                      {test.description || "No description available"}
                    </p>

                    {/* Subjects Tags */}
                    {test.subjects && test.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {test.subjects.slice(0, 3).map((subject, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                            {subject}
                          </span>
                        ))}
                        {test.subjects.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                            +{test.subjects.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Test Stats */}
                  <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/30 border-y border-gray-100 dark:border-gray-700">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <Clock size={16} className="mx-auto mb-1 text-blue-600" />
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{test.duration} min</p>
                        <p className="text-xs text-gray-500">Duration</p>
                      </div>
                      <div className="text-center">
                        <Award size={16} className="mx-auto mb-1 text-green-600" />
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{test.totalMarks}</p>
                        <p className="text-xs text-gray-500">Marks</p>
                      </div>
                      <div className="text-center">
                        <Users size={16} className="mx-auto mb-1 text-purple-600" />
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{test.maxAttempts}</p>
                        <p className="text-xs text-gray-500">Attempts</p>
                      </div>
                      <div className="text-center">
                        <Flag size={16} className="mx-auto mb-1 text-orange-600" />
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{test.remainingAttempts}</p>
                        <p className="text-xs text-gray-500">Left</p>
                      </div>
                    </div>
                  </div>

                  {/* Section Details for Sectional Tests */}
                  {test.hasSections && test.sectionDetails && (
                    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => toggleSectionExpand(test._id, 0)}
                        className="w-full flex items-center justify-between mb-2"
                      >
                        <div className="flex items-center gap-2">
                          <Layers size={14} className="text-purple-500" />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sections</span>
                        </div>
                        <ChevronDown 
                          size={16} 
                          className={`transform transition-transform ${expandedSections[`${test._id}_0`] ? 'rotate-180' : ''}`}
                        />
                      </button>
                      
                      {expandedSections[`${test._id}_0`] && (
                        <div className="space-y-2 mt-2">
                          {test.sectionDetails.titles.map((title, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                    {idx + 1}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {title}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock size={12} />
                                <span>{test.sectionDetails.durations[idx]} min</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Attempt Info */}
                  <div className="px-5 py-3">
                    {test.attemptCount > 0 && (
                      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Attempts Used</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {test.attemptCount} / {test.maxAttempts}
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${(test.attemptCount / test.maxAttempts) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* In Progress Indicator */}
                    {test.canResume && test.activeAttemptId && status === "active" && (
                      <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                          <RefreshCw size={12} />
                          You have an in-progress attempt
                        </p>
                      </div>
                    )}

                    {/* Best Score Display - if available */}
                    {test.bestAttempt && (
                      <div className="mb-3 flex items-center justify-between text-sm bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-2 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <TrendingUp size={12} className="text-green-600" />
                          Best Score
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {test.bestAttempt.percentage.toFixed(1)}% ({test.bestAttempt.score}/{test.bestAttempt.totalMarks})
                        </span>
                      </div>
                    )}

                    {/* Schedule Info */}
                    <div className="text-xs text-gray-400 space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span>Starts: {formatDate(test.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span>Ends: {formatDate(test.endTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-5 pb-5 flex gap-2">
                    <button
                      onClick={() => handleTestAction(test)}
                      disabled={!isButtonEnabled}
                      className={`flex-1 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        getButtonColor(btn.variant, isActive, test)
                      }`}
                    >
                      {btn.variant === "warning" ? (
                        <RefreshCw size={16} />
                      ) : btn.variant === "danger" ? (
                        <AlertCircle size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                      {btn.text}
                    </button>
                    
                    {/* Results Button - only show if user has attempts and test is active/expired */}
                    {hasAttempts && (status === "active" || status === "expired") && (
                      <button
                        onClick={() => handleShowResults(test)}
                        className="px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-white border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <History size={16} />
                        Results
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Dialog */}
      {showResultsDialog && selectedTestForResults && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Test Attempts
                  </h2>
                  <p className="text-sm text-blue-100">
                    {selectedTestForResults.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowResultsDialog(false);
                  setSelectedTestForResults(null);
                  setAttemptsData(null);
                  setAttemptsError(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-5 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingAttempts ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin w-8 h-8 text-blue-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Loading attempts...</p>
                </div>
              ) : attemptsError ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
                  <p className="text-red-600 dark:text-red-400">{attemptsError}</p>
                  <button
                    onClick={() => fetchAttempts(selectedTestForResults._id)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              ) : attemptsData && attemptsData.attempts && attemptsData.attempts.length > 0 ? (
                <div>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl text-center">
                      <p className="text-2xl font-bold text-blue-600">{attemptsData.count || attemptsData.attempts.length}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Attempts</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.max(...attemptsData.attempts.map(a => calculatePercentage(a.score, a.totalMarks)), 0).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Best Score</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {(attemptsData.attempts.reduce((sum, a) => sum + calculatePercentage(a.score, a.totalMarks), 0) / attemptsData.attempts.length).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Average Score</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {attemptsData.attempts.filter(a => a.submittedAt).length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                    </div>
                  </div>

                  {/* Attempts List */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <FileText size={16} />
                      Attempt History
                    </h3>
                    {attemptsData.attempts.map((attempt, index) => {
                      const percentage = calculatePercentage(attempt.score, attempt.totalMarks);
                      const isCompleted = !!attempt.submittedAt;
                      
                      return (
                        <div
                          key={attempt._id || index}
                          className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Attempt #{attemptsData.attempts.length - index}
                              </span>
                              {isCompleted ? (
                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center gap-1">
                                  <CheckCircle size={10} /> Completed
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full flex items-center gap-1">
                                  In Progress
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatDateTime(attempt.createdAt)}
                            </span>
                          </div>

                          
                          {isCompleted ? (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                  {attempt.score} / {attempt.totalMarks}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Percentage</p>
                                <p className="text-sm font-semibold text-blue-600">
                                  {percentage.toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                  {attempt.duration} min
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                <p className="text-sm font-semibold text-green-600">
                                  Submitted
                                </p>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Action</p>
                                <button 
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-3 py-1 rounded-lg text-xs text-white font-medium transition"
                                  onClick={() => {
                                    router.push(`/user/test/${selectedTestForResults._id}/result?attemptId=${attempt._id}`);
                                  }}
                                >
                                  View Result
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                                <AlertCircle size={14} />
                                This attempt is still in progress. Complete the test to see your results.
                              </p>
                            </div>
                          )}

                          {attempt.submittedAt && isCompleted && (
                            <p className="text-xs text-gray-400 mt-3">
                              Submitted: {formatDateTime(attempt.submittedAt)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <History size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No attempts found for this test</p>
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => {
                  setShowResultsDialog(false);
                  setSelectedTestForResults(null);
                  setAttemptsData(null);
                  setAttemptsError(null);
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
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