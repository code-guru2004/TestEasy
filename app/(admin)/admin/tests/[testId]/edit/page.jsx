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
  CheckSquare,
  Square,
  ArrowLeft,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Layers
} from "lucide-react";
import { useSelector } from "react-redux";

export default function EditTestPage() {
  const { testId } = useParams();
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  const [testQuestions, setTestQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedSection, setSelectedSection] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  const [filters, setFilters] = useState({
    search: "",
    subject: "",
    topic: ""
  });

  // Languages configuration
  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "bn", name: "বাংলা", flag: "🇧🇩" }
  ];

  // Helper function to get display name from populated field
  const getDisplayName = (field) => {
    if (!field) return "—";
    if (typeof field === 'string') return field;
    if (field.name) return field.name;
    return "—";
  };

  // Helper function to get localized text
  const getLocalizedText = (textObj) => {
    if (!textObj) return "—";
    if (typeof textObj === 'string') return textObj;
    return textObj[selectedLanguage] || textObj.en || "—";
  };

  // Fetch test details
  const fetchTestDetails = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${testId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      setTestDetails(data.test);
      
      // If test has sections, set questions per section
      if (data.test.hasSections && data.test.sections) {
        // Combine all questions from all sections for display
        const allQuestions = [];
        data.test.sections.forEach((section, idx) => {
          if (section.questions && section.questions.length) {
            allQuestions.push(...section.questions.map(q => ({
              ...q,
              _sectionIndex: idx,
              sectionTitle: section.title
            })));
          }
        });
        setTestQuestions(allQuestions);
      } else {
        setTestQuestions(data.test.questions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch questions with filters and pagination
  const fetchQuestions = async (page = 1) => {
    try {
      setLoading(true);
      
      // Build query params including testId to exclude already added questions
      const params = new URLSearchParams({
        page: page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.topic && { topic: filters.topic }),
        testId: testId // This tells backend to exclude questions already in this test
      });
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/get-questions?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json();
      
      setAvailableQuestions(data.questions || []);
      setPagination({
        currentPage: data.page || 1,
        totalPages: data.pages || 1,
        totalItems: data.total || 0,
        limit: pagination.limit
      });
      
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch questions");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const [availableQuestions, setAvailableQuestions] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      await fetchTestDetails();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (testDetails) {
      fetchQuestions(1);
    }
  }, [filters, testDetails]);

  const applyFilters = () => {
    fetchQuestions(1);
    setSelected([]);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      subject: "",
      topic: ""
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchQuestions(newPage);
      setSelected([]); // Clear selections when changing page
    }
  };

  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((q) => q !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const selectAll = () => {
    const allIds = availableQuestions.map(q => q._id);
    setSelected(allIds);
  };

  const clearAll = () => {
    setSelected([]);
  };

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
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/tests/${testId}/questions`;
      let payload;

      // Check if test has sections
      if (testDetails.hasSections) {
        if (selectedSection === null) {
          setMessage("Please select a section to add questions to");
          setMessageType("error");
          setSubmitting(false);
          setTimeout(() => setMessage(""), 3000);
          return;
        }
        
        payload = {
          questionIds: selected,
          sectionIndex: selectedSection
        };
      } else {
        payload = {
          questionIds: selected
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
     
      if (res.ok) {
        setMessageType("success");
        setMessage(`✅ Successfully added ${selected.length} question(s) to ${testDetails.hasSections ? `section ${selectedSection + 1}` : 'test'}!`);
        
        await fetchTestDetails();
        await fetchQuestions(pagination.currentPage);
        setSelected([]);
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessageType("error");
        setMessage(data.msg || data.message || "Failed to add questions");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err.message);
      setMessageType("error");
      setMessage("An error occurred while adding questions");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const removeQuestion = async (questionId, sectionIndex = null) => {
    const confirmMsg = testDetails.hasSections 
      ? "Are you sure you want to remove this question from the section?"
      : "Are you sure you want to remove this question from the test?";
    
    if (!confirm(confirmMsg)) {
      return;
    }

    setSubmitting(true);
    
    try {
      let payload;
      
      if (testDetails.hasSections && sectionIndex !== undefined) {
        payload = {
          questionIds: [questionId],
          sectionIndex: sectionIndex
        };
      } else {
        payload = {
          questionIds: [questionId]
        };
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tests/${testId}/questions`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (res.ok) {
        setMessageType("success");
        setMessage("✅ Question removed successfully!");
        
        await fetchTestDetails();
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setMessageType("error");
        setMessage(data.msg || data.message || "Failed to remove question");
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

  // Compact Question Card Component with language support
  const CompactQuestionCard = ({ question, index, showRemoveButton = false, onRemove, isSelected, onSelect, sectionName }) => {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 ${
          isSelected
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10"
            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        }`}
      >
        <div className="p-3">
          <div className="flex items-start gap-2">
            {onSelect && (
              <button onClick={() => onSelect(question._id)} className="mt-0.5 flex-shrink-0">
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-purple-600" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
              </button>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  #{index + 1}
                </span>
                {sectionName && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {sectionName}
                  </span>
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty || "medium"}
                </span>
                <span className="text-xs text-gray-500">
                  {question.marks || 0} mark{question.marks !== 1 ? 's' : ''}
                </span>
                {question.negativeMarks > 0 && (
                  <span className="text-xs text-red-500">
                    -{question.negativeMarks} mark
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-800 dark:text-white font-medium line-clamp-2">
                {getLocalizedText(question.questionText)}
              </p>
              
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <BookOpen size={10} />
                  {getDisplayName(question.subject)}
                </span>
                <span className="flex items-center gap-1">
                  <Tag size={10} />
                  {getDisplayName(question.topic)}
                </span>
              </div>
            </div>
            
            {showRemoveButton && onRemove && (
              <button
                onClick={() => onRemove(question._id, question._sectionIndex)}
                disabled={submitting}
                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-50 flex-shrink-0"
                title="Remove from test"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!testDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Calculate total marks considering sections
  const totalMarks = testQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
  
  // Get sections for sectional test
  const sections = testDetails.hasSections ? testDetails.sections || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header with Language Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {testDetails.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {testDetails.hasSections 
                    ? `${sections.length} sections • ${testQuestions.length} questions • ${totalMarks} marks`
                    : `${testDetails.duration} min • ${testQuestions.length} questions • ${totalMarks} marks`
                  }
                </p>
                {testDetails.hasSections && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    <Layers size={12} className="inline mr-1" />
                    Sectional Test
                  </p>
                )}
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-gray-500" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            messageType === "success" 
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}>
            {messageType === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{message}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "available"
                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Available ({pagination.totalItems})
          </button>
          <button
            onClick={() => setActiveTab("current")}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "current"
                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Current ({testQuestions.length})
          </button>
        </div>

        {/* Available Questions Tab */}
        {activeTab === "available" && (
          <>
            {/* Section Selection for Sectional Tests */}
            {testDetails.hasSections && sections.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4 p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Section to Add Questions <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {sections.map((section, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSection(idx)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedSection === idx
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                      }`}
                    >
                      <div className="font-medium text-gray-800 dark:text-white">
                        {section.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {section.duration} min • {section.questions?.length || 0} questions
                      </div>
                    </button>
                  ))}
                </div>
                {selectedSection === null && (
                  <p className="text-red-500 text-xs mt-2">Please select a section to add questions to</p>
                )}
              </div>
            )}

            {/* Compact Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <div className="p-3">
                <div className="flex flex-wrap gap-2">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1"
                  >
                    <Filter size={14} />
                    Filters
                    <ChevronDown size={12} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={applyFilters}
                    className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Search
                  </button>
                </div>

                {showFilters && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Filter by subject..."
                        value={filters.subject}
                        onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Filter by topic..."
                        value={filters.topic}
                        onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={resetFilters}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Reset filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selection Bar */}
            {availableQuestions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-3 p-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {selected.length} selected
                    </span>
                    {testDetails.hasSections && selectedSection !== null && (
                      <span className="text-xs text-purple-600 dark:text-purple-400">
                        Adding to: {sections[selectedSection]?.title}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={selectAll}
                      className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearAll}
                      className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                    >
                      Clear
                    </button>
                    <button
                      onClick={addQuestions}
                      disabled={submitting || selected.length === 0 || (testDetails.hasSections && selectedSection === null)}
                      className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition flex items-center gap-1 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Plus size={12} />
                      )}
                      Add ({selected.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Questions List - Compact */}
            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading questions...</p>
              </div>
            ) : availableQuestions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No questions available</p>
                <p className="text-xs text-gray-400 mt-1">
                  {filters.search || filters.subject || filters.topic
                    ? "Try adjusting your filters"
                    : "All questions are already in this test"}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {availableQuestions.map((q, index) => (
                    <CompactQuestionCard
                      key={q._id}
                      question={q}
                      index={index}
                      isSelected={selected.includes(q._id)}
                      onSelect={toggleSelect}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">
                      Showing {(pagination.currentPage - 1) * pagination.limit + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of {pagination.totalItems}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <div className="flex gap-1">
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
                              className={`w-7 h-7 text-xs rounded transition ${
                                pagination.currentPage === pageNum
                                  ? "bg-purple-600 text-white"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Current Questions Tab */}
        {activeTab === "current" && (
          <div className="space-y-2">
            {testQuestions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No questions in this test</p>
                <p className="text-xs text-gray-400 mt-1">Add questions from the Available tab</p>
              </div>
            ) : testDetails.hasSections ? (
              // Group questions by section for sectional tests
              sections.map((section, sectionIdx) => {
                const sectionQuestions = testQuestions.filter(q => q._sectionIndex === sectionIdx);
                if (sectionQuestions.length === 0) return null;
                
                return (
                  <div key={sectionIdx} className="mb-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg mb-2 border border-purple-200 dark:border-purple-800">
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {section.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {section.duration} min • {sectionQuestions.length} questions
                      </p>
                    </div>
                    <div className="space-y-2">
                      {sectionQuestions.map((q, index) => (
                        <CompactQuestionCard
                          key={q._id}
                          question={q}
                          index={index}
                          showRemoveButton={true}
                          onRemove={removeQuestion}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Flat test - show all questions
              testQuestions.map((q, index) => (
                <CompactQuestionCard
                  key={q._id}
                  question={q}
                  index={index}
                  showRemoveButton={true}
                  onRemove={removeQuestion}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}