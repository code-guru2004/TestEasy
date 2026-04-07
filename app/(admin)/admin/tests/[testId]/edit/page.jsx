"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ChevronDown,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  Tag,
  FileText,
  Clock,
  Award,
  Shield,
  CheckSquare,
  Square,
  ArrowLeft,
  Trash2
} from "lucide-react";

export default function EditTestPage() {
  const { testId } = useParams();
  const router = useRouter();

  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [testQuestions, setTestQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [activeTab, setActiveTab] = useState("available"); // "available" or "current"

  const [filters, setFilters] = useState({
    search: "",
    subject: "",
    topic: ""
  });

  // Fetch test details
  const fetchTestDetails = async () => {
    try {
      const res = await fetch(
        `https://govt-quiz-app.onrender.com/api/admin/tests/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = await res.json();
      console.log("Test details:", data);
      setTestDetails(data.test);
      setTestQuestions(data.test.questions || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch questions with filters (excluding those already in test)
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams(filters).toString();

      const res = await fetch(
        `https://govt-quiz-app.onrender.com/api/admin/get-questions?${query}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await res.json();
      const allQuestions = data.questions || [];
      
      // Filter out questions that are already in the test
      const testQuestionIds = testQuestions.map(q => q._id);
      const filteredQuestions = allQuestions.filter(q => !testQuestionIds.includes(q._id));
      
      setAvailableQuestions(filteredQuestions);
      console.log("Available questions (excluding test questions):", filteredQuestions);
      
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch questions");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchTestDetails();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (testDetails) {
      fetchQuestions();
    }
  }, [filters, testDetails]);

  // Apply filters
  const applyFilters = () => {
    fetchQuestions();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      subject: "",
      topic: ""
    });
  };

  // Toggle selection for available questions
  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((q) => q !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  // Select all available questions
  const selectAll = () => {
    const allIds = availableQuestions.map(q => q._id);
    setSelected(allIds);
  };

  // Clear all selections
  const clearAll = () => {
    setSelected([]);
  };

  // Add questions to test
  const addQuestions = async () => {
    if (selected.length === 0) {
      setMessage("Please select at least one question");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(
        `https://govt-quiz-app.onrender.com/api/admin/tests/${testId}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ questionIds: selected })
        }
      );

      const data = await res.json();
      
      if (res.ok) {
        setMessageType("success");
        setMessage(`✅ Successfully added ${selected.length} question(s)!`);
        
        // Refresh both test details and available questions
        await fetchTestDetails();
        setSelected([]);
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessageType("error");
        setMessage(data.msg || "Failed to add questions");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("An error occurred while adding questions");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Remove question from test
  const removeQuestion = async (questionId) => {
    if (!confirm("Are you sure you want to remove this question from the test?")) {
      return;
    }

    setSubmitting(true);
    
    try {
      const res = await fetch(
        `https://govt-quiz-app.onrender.com/api/admin/tests/${testId}/questions/${questionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (res.ok) {
        setMessageType("success");
        setMessage("✅ Question removed successfully!");
        
        // Refresh test details
        await fetchTestDetails();
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessageType("error");
        setMessage("Failed to remove question");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("An error occurred");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  if (!testDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  const totalMarks = testQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Manage Test Questions
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {testDetails.title} • Duration: {testDetails.duration} minutes • 
                  Total Questions: {testQuestions.length} • Total Marks: {totalMarks}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-2 ${
            messageType === "success" 
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}>
            {messageType === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <p className={`text-sm ${
              messageType === "success" 
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}>
              {message}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-6 py-3 font-medium transition-all duration-200 ${
              activeTab === "available"
                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Available Questions ({availableQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab("current")}
            className={`px-6 py-3 font-medium transition-all duration-200 ${
              activeTab === "current"
                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Current Questions ({testQuestions.length})
          </button>
        </div>

        {/* Available Questions Tab */}
        {activeTab === "available" && (
          <>
            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                  >
                    <Filter size={18} />
                    Advanced Filters
                    <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={applyFilters}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                  >
                    Search
                  </button>
                </div>

                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          placeholder="Filter by subject..."
                          value={filters.subject}
                          onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Topic
                        </label>
                        <input
                          type="text"
                          placeholder="Filter by topic..."
                          value={filters.topic}
                          onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={resetFilters}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selection Controls */}
            {availableQuestions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-lg">
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">
                        {selected.length} selected
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center gap-2"
                    >
                      <CheckSquare size={16} />
                      Select All
                    </button>
                    <button
                      onClick={clearAll}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      <Square size={16} />
                      Clear All
                    </button>
                    <button
                      onClick={addQuestions}
                      disabled={submitting || selected.length === 0}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus size={16} />
                      )}
                      Add Selected ({selected.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Available Questions List */}
            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">Loading questions...</p>
              </div>
            ) : availableQuestions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    No questions available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {filters.search || filters.subject || filters.topic
                      ? "Try adjusting your search filters"
                      : "All questions are already added to this test"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {availableQuestions.map((q, index) => (
                  <div
                    key={q._id}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                      selected.includes(q._id)
                        ? "border-purple-500 dark:border-purple-500 ring-2 ring-purple-500/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <button onClick={() => toggleSelect(q._id)} className="mt-0.5">
                          {selected.includes(q._id) ? (
                            <CheckSquare className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        <div className="flex-1">
                          <p className="text-gray-800 dark:text-white font-medium mb-2">
                            {index + 1}. {q.questionText}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                            {q.options?.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${
                                  q.correctAnswer === opt 
                                    ? "bg-green-500" 
                                    : "bg-gray-300 dark:bg-gray-600"
                                }`} />
                                <span className="text-gray-600 dark:text-gray-300">
                                  {String.fromCharCode(65 + optIndex)}. {opt}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            <span className="text-xs flex items-center gap-1 text-gray-500">
                              <BookOpen size={12} />
                              {q.subject || "No subject"}
                            </span>
                            <span className="text-xs flex items-center gap-1 text-gray-500">
                              <Tag size={12} />
                              {q.topic || "No topic"}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(q.difficulty)}`}>
                              {q.difficulty}
                            </span>
                            <span className="text-xs flex items-center gap-1 text-gray-500">
                              <Award size={12} />
                              {q.marks} mark{q.marks !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Current Questions Tab */}
        {activeTab === "current" && (
          <div className="space-y-3">
            {testQuestions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    No questions in this test
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Add questions from the "Available Questions" tab
                  </p>
                </div>
              </div>
            ) : (
              testQuestions.map((q, index) => (
                <div
                  key={q._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-600 dark:text-purple-400 font-bold">
                          #{index + 1}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-gray-800 dark:text-white font-medium mb-3">
                        {q.questionText}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {q.options?.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${
                              q.correctAnswer === opt 
                                ? "bg-green-500" 
                                : "bg-gray-300 dark:bg-gray-600"
                            }`} />
                            <span className="text-gray-600 dark:text-gray-300">
                              {String.fromCharCode(65 + optIndex)}. {opt}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <span className="text-xs text-gray-500">
                          📚 {q.subject || "No subject"}
                        </span>
                        <span className="text-xs text-gray-500">
                          🏷️ {q.topic || "No topic"}
                        </span>
                        <span className="text-xs text-gray-500">
                          ⭐ {q.marks} mark{q.marks !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeQuestion(q._id)}
                      disabled={submitting}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                      title="Remove from test"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}