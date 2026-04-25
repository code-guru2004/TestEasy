"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  Calendar,
  Award,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Lightbulb,
  BookOpen,
  Tag,
  BarChart3,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Printer,
  Share2,
  Settings,
  Globe,
  CalendarSync,
  Layers,
  Timer
} from "lucide-react";

export default function PreviewTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.testId;
  
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [error, setError] = useState(null);

  // Languages configuration
  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "bn", name: "বাংলা", flag: "🇧🇩" }
  ];

  useEffect(() => {
    if (testId) {
      fetchTestDetails();
    }
  }, [testId]);

  // Helper function to get localized text
  const getLocalizedText = (textObj) => {
    if (!textObj) return "—";
    if (typeof textObj === 'string') return textObj;
    return textObj[selectedLanguage] || textObj.en || "—";
  };

  // Helper function to get localized option text
  const getLocalizedOptionText = (option) => {
    if (!option) return "—";
    if (typeof option === 'string') return option;
    return option[selectedLanguage] || option.en || "—";
  };

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Test not found");
        }
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch test details");
      }
      
      const data = await res.json();
      setTest(data.test);
      
      // Handle both flat and sectional tests
      if (data.test.hasSections && data.test.sections) {
        setSections(data.test.sections);
        // Flatten questions for easy counting but keep section info
        const allQuestions = [];
        data.test.sections.forEach((section, sectionIdx) => {
          if (section.questions && section.questions.length) {
            section.questions.forEach((q, qIdx) => {
              allQuestions.push({
                ...q,
                sectionIndex: sectionIdx,
                sectionTitle: section.title,
                questionIndex: qIdx
              });
            });
          }
        });
        setQuestions(allQuestions);
      } else {
        setSections([]);
        setQuestions(data.test.questions || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionExpand = (questionKey) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionKey]: !prev[questionKey]
    }));
  };

  const toggleSectionExpand = (sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    questions.forEach((_, index) => {
      allExpanded[index] = true;
    });
    setExpandedQuestions(allExpanded);
    
    // Expand all sections for sectional tests
    if (test?.hasSections && sections.length > 0) {
      const allSectionsExpanded = {};
      sections.forEach((_, idx) => {
        allSectionsExpanded[idx] = true;
      });
      setExpandedSections(allSectionsExpanded);
    }
  };

  const collapseAll = () => {
    setExpandedQuestions({});
    setExpandedSections({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    router.push(`/admin/tests/${testId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests/${testId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      if (res.ok) {
        alert("Test deleted successfully!");
        router.push("/admin/tests");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete test");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading test preview...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Test Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300">{error || "The test you're looking for doesn't exist."}</p>
          <button
            onClick={() => router.push("/admin/tests")}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const totalDuration = test.hasSections 
    ? sections.reduce((sum, s) => sum + (s.duration || 0), 0)
    : test.duration;

  // Get subject and topic names (if they're populated objects)
  const getSubjectName = () => {
    if (test.subject && typeof test.subject === 'object') return test.subject.name;
    if (Array.isArray(test.subject) && test.subject.length) return test.subject.join(", ");
    return "Not specified";
  };

  const getTopicName = () => {
    if (test.topic && typeof test.topic === 'object') return test.topic.name;
    return "Not specified";
  };

  // Calculate section statistics
  const getSectionStats = (section) => {
    const sectionQuestions = section.questions || [];
    const sectionTotalMarks = sectionQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
    return {
      questionCount: sectionQuestions.length,
      totalMarks: sectionTotalMarks
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with Language Selector */}
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
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Test Preview
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Review all questions and test settings before publishing
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              {/* Language Selector */}
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                <Globe size={16} className="text-gray-500" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-transparent text-gray-700 dark:text-gray-300 text-sm focus:outline-none cursor-pointer"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Edit size={18} />
                Edit Test
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Rest of your component remains the same */}
        {/* Test Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{test.title}</h2>
            <p className="text-purple-100">{test.description || "No description provided"}</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Duration</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{totalDuration} minutes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Questions</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{questions.length} questions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Marks</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{totalMarks} marks</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <CalendarSync className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Max Attempts</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{test.maxAttempts} attempt(s)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start Time</p>
                <p className="font-medium text-gray-800 dark:text-white">{formatDate(test.startTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">End Time</p>
                <p className="font-medium text-gray-800 dark:text-white">{formatDate(test.endTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Test Type</p>
                <p className="font-medium text-gray-800 dark:text-white capitalize">{test.testType || "General"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Negative Marking</p>
                <p className="font-medium text-gray-800 dark:text-white">{test.negativeMarks || 0} marks per wrong answer</p>
              </div>
              {test.hasSections && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Test Structure</p>
                  <p className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                    <Layers size={16} className="text-purple-500" />
                    Sectional Test - {sections.length} sections
                  </p>
                </div>
              )}
            </div>

            {/* Test Settings */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Test Settings</h3>
              <div className="flex flex-wrap gap-3">
                {test.allowResume && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">Allow Resume</span>
                )}
                {test.shuffleQuestions && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">Shuffle Questions</span>
                )}
                {test.showResultImmediately && (
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded">Show Result Immediately</span>
                )}
                {test.isFeatured && (
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded">Featured Test</span>
                )}
                {test.isPublished ? (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle size={12} />
                    Published
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded flex items-center gap-1">
                    <AlertCircle size={12} />
                    Draft
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {test.hasSections ? "Test Sections & Questions" : `Questions (${questions.length})`}
                </h2>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={expandAll}
                  className="px-3 py-1 text-sm text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Collapse All
                </button>
                <label className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAnswers}
                    onChange={(e) => setShowAnswers(e.target.checked)}
                    className="rounded"
                  />
                  Show Correct Answers
                </label>
              </div>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full inline-flex mb-4">
                <AlertCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                No Questions Added
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                This test doesn't have any questions yet. Add questions from the edit page.
              </p>
              <button
                onClick={handleEdit}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Add Questions
              </button>
            </div>
          ) : test.hasSections ? (
            // Sectional Test View
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sections.map((section, sectionIdx) => {
                const stats = getSectionStats(section);
                const isSectionExpanded = expandedSections[sectionIdx];
                
                return (
                  <div key={sectionIdx} className="overflow-hidden">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSectionExpand(sectionIdx)}
                      className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                            <Layers className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                              {section.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Timer size={14} />
                                {section.duration} minutes
                              </span>
                              <span>{stats.questionCount} questions</span>
                              <span>{stats.totalMarks} marks</span>
                            </div>
                          </div>
                        </div>
                        {isSectionExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>

                    {/* Section Questions */}
                    {isSectionExpanded && (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        {section.questions?.map((question, qIdx) => {
                          const questionKey = `${sectionIdx}_${qIdx}`;
                          const isExpanded = expandedQuestions[questionKey];
                          
                          return (
                            <div key={question._id || qIdx} className="p-6 pl-12">
                              <button
                                onClick={() => toggleQuestionExpand(questionKey)}
                                className="w-full text-left flex items-start justify-between gap-4"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                      Q{qIdx + 1}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(question.difficulty)}`}>
                                      {question.difficulty || "medium"}
                                    </span>
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                      {question.marks} mark{question.marks !== 1 ? 's' : ''}
                                    </span>
                                    {question.negativeMarks > 0 && (
                                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                                        -{question.negativeMarks} mark
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-800 dark:text-white font-medium">
                                    {getLocalizedText(question.questionText)}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <BookOpen size={12} />
                                      {typeof question.subject === 'object' ? question.subject.name : question.subject || "No subject"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Tag size={12} />
                                      {typeof question.topic === 'object' ? question.topic.name : question.topic || "No topic"}
                                    </span>
                                  </div>
                                </div>
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </button>

                              {isExpanded && (
                                <div className="mt-4 pl-4 border-l-4 border-purple-200 dark:border-purple-800">
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Options:</p>
                                      <div className="space-y-2">
                                        {question.options?.map((opt, optIdx) => {
                                          const isCorrect = question.correctAnswer && 
                                            ((typeof question.correctAnswer === 'string' && opt.id === question.correctAnswer) ||
                                             (typeof question.correctAnswer === 'string' && opt.en === question.correctAnswer));
                                          
                                          return (
                                            <div 
                                              key={opt.id || optIdx}
                                              className={`text-sm p-2 rounded ${
                                                showAnswers && isCorrect
                                                  ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-l-4 border-green-500"
                                                  : "text-gray-600 dark:text-gray-400"
                                              }`}
                                            >
                                              {String.fromCharCode(65 + optIdx)}. {getLocalizedOptionText(opt)}
                                              {showAnswers && isCorrect && (
                                                <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Correct Answer)</span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Fact Section */}
                                    {question.fact && (
                                      <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div className="flex items-start gap-2">
                                          <Lightbulb size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Educational Fact</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{getLocalizedText(question.fact)}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Flat Test View
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {questions.map((question, index) => (
                <div key={question._id || index} className="p-6">
                  <button
                    onClick={() => toggleQuestionExpand(index)}
                    className="w-full text-left flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                          Question {index + 1}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty || "medium"}
                        </span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          {question.marks} mark{question.marks !== 1 ? 's' : ''}
                        </span>
                        {question.negativeMarks > 0 && (
                          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                            -{question.negativeMarks} mark
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800 dark:text-white font-medium">
                        {getLocalizedText(question.questionText)}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          {typeof question.subject === 'object' ? question.subject.name : question.subject || "No subject"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          {typeof question.topic === 'object' ? question.topic.name : question.topic || "No topic"}
                        </span>
                      </div>
                    </div>
                    {expandedQuestions[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {expandedQuestions[index] && (
                    <div className="mt-4 pl-4 border-l-4 border-purple-200 dark:border-purple-800">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Options:</p>
                          <div className="space-y-2">
                            {question.options?.map((opt, optIdx) => {
                              const isCorrect = question.correctAnswer && 
                                ((typeof question.correctAnswer === 'string' && opt.id === question.correctAnswer) ||
                                 (typeof question.correctAnswer === 'string' && opt.en === question.correctAnswer));
                              
                              return (
                                <div 
                                  key={opt.id || optIdx}
                                  className={`text-sm p-2 rounded ${
                                    showAnswers && isCorrect
                                      ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-l-4 border-green-500"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}. {getLocalizedOptionText(opt)}
                                  {showAnswers && isCorrect && (
                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Correct Answer)</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Fact Section */}
                        {question.fact && (
                          <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Lightbulb size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Educational Fact</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{getLocalizedText(question.fact)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary Footer */}
          {questions.length > 0 && (
            <div className="p-6 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Questions</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{questions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Marks</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{totalMarks}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Difficulty Distribution</p>
                  <div className="flex gap-1 mt-1">
                    <div className="h-2 bg-green-500 rounded" style={{ width: `${(questions.filter(q => q.difficulty === "easy").length / questions.length) * 100}%` }} />
                    <div className="h-2 bg-yellow-500 rounded" style={{ width: `${(questions.filter(q => q.difficulty === "medium").length / questions.length) * 100}%` }} />
                    <div className="h-2 bg-red-500 rounded" style={{ width: `${(questions.filter(q => q.difficulty === "hard").length / questions.length) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Easy: {questions.filter(q => q.difficulty === "easy").length}</span>
                    <span>Medium: {questions.filter(q => q.difficulty === "medium").length}</span>
                    <span>Hard: {questions.filter(q => q.difficulty === "hard").length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-end">
          <button
            onClick={() => router.push("/admin/tests")}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
          >
            Back to Tests
          </button>
          <button
            onClick={handleEdit}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-medium flex items-center gap-2"
          >
            <Edit size={18} />
            Edit Test
          </button>
        </div>
      </div>
    </div>
  );
}