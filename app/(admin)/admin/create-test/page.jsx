"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  FileText,
  Clock,
  Calendar,
  Award,
  Settings,
  Shield,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Save,
  X,
  Zap,
  BarChart3,
  Users,
  Repeat,
  Shuffle,
  FileCheck,
  TrendingUp,
  BookOpen,
  FolderTree,
  Layers,
  Plus,
  Trash2,
  Search,
  Filter,
  FileQuestion
} from "lucide-react";

export default function CreateTestPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    startTime: "",
    endTime: "",
    maxAttempts: 1,
    allowResume: false,
    shuffleQuestions: false,
    showResultImmediately: false,
    isPublished: false,
    testType: "full", // topic, subject, full
    subject: "",
    topic: "",
    subjects: [],
    questions: []
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Data from API
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState("");
  
  // Pagination for questions
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
    fetchTopics();
    fetchQuestions();
  }, []);

  // Filter topics when subject changes in form
  useEffect(() => {
    if (form.subject) {
      const filtered = topics.filter(topic => topic.subject?._id === form.subject || topic.subject === form.subject);
      setFilteredTopics(filtered);
      if (form.topic && !filtered.find(t => t._id === form.topic)) {
        setForm(prev => ({ ...prev, topic: "" }));
      }
    } else {
      setFilteredTopics([]);
    }
  }, [form.subject, topics]);

  // Fetch questions with filters
  useEffect(() => {
    fetchQuestions();
  }, [currentPage, searchTerm, selectedSubjectFilter, selectedTopicFilter]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects/search`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/topics/search`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopics(response.data.data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/questions?page=${currentPage}&limit=10`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (selectedSubjectFilter) url += `&subject=${selectedSubjectFilter}`;
      if (selectedTopicFilter) url += `&topic=${selectedTopicFilter}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableQuestions(response.data.questions || []);
      setTotalPages(response.data.pages || 1);
      setTotalQuestions(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleTestTypeChange = (type) => {
    setForm(prev => ({ ...prev, testType: type }));
  };

  const toggleQuestionSelection = (question) => {
    const isSelected = selectedQuestions.find(q => q._id === question._id);
    if (isSelected) {
      setSelectedQuestions(selectedQuestions.filter(q => q._id !== question._id));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const addSelectedQuestionsToTest = () => {
    const questionIds = selectedQuestions.map(q => q._id);
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, ...questionIds]
    }));
    setShowQuestionSelector(false);
    setMessageType("success");
    setMessage(`✅ Added ${selectedQuestions.length} questions to test`);
    setTimeout(() => setMessage(""), 3000);
  };

  const removeQuestionFromTest = (questionId) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter(id => id !== questionId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) {
      newErrors.title = "Test title is required";
    }
    
    if (!form.duration || form.duration <= 0) {
      newErrors.duration = "Valid duration is required";
    }
    
    if (!form.startTime) {
      newErrors.startTime = "Start time is required";
    }
    
    if (!form.endTime) {
      newErrors.endTime = "End time is required";
    }
    
    if (form.startTime && form.endTime && new Date(form.startTime) >= new Date(form.endTime)) {
      newErrors.endTime = "End time must be after start time";
    }
    
    if (form.maxAttempts < 1) {
      newErrors.maxAttempts = "Max attempts must be at least 1";
    }
    
    if (form.testType === "topic" && !form.topic) {
      newErrors.topic = "Please select a topic for topic-based test";
    }
    
    if (form.testType === "subject" && !form.subject) {
      newErrors.subject = "Please select a subject for subject-based test";
    }
    
    if (form.testType === "full" && form.subjects.length === 0) {
      newErrors.subjects = "Please select at least one subject for full test";
    }
    
    if (form.questions.length === 0) {
      newErrors.questions = "Please add at least one question to the test";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const payload = {
        title: form.title,
        description: form.description,
        duration: Number(form.duration),
        startTime: form.startTime,
        endTime: form.endTime,
        maxAttempts: Number(form.maxAttempts),
        allowResume: form.allowResume,
        shuffleQuestions: form.shuffleQuestions,
        showResultImmediately: form.showResultImmediately,
        isPublished: form.isPublished,
        testType: form.testType,
        questions: form.questions
      };

      // Add conditional fields based on test type
      if (form.testType === "topic") {
        payload.topic = form.topic;
        payload.subject = form.subject;
      } else if (form.testType === "subject") {
        payload.subject = form.subject;
      } else if (form.testType === "full") {
        payload.subjects = form.subjects;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tests`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessageType("success");
      setMessage("✅ Test created successfully!");
      
      setTimeout(() => {
        router.push("/dashboard/admin/tests");
      }, 2000);
      
    } catch (err) {
      setMessageType("error");
      setMessage("❌ " + (err.response?.data?.msg || err.message));
    }

    setLoading(false);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject?.name || "Unknown";
  };

  const getTopicName = (topicId) => {
    const topic = topics.find(t => t._id === topicId);
    return topic?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Create New Test
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-12">
                Set up a comprehensive assessment with detailed configuration
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-lg shadow-sm">
              <p className="text-white text-sm font-medium flex items-center space-x-2">
                <Shield size={16} />
                <span>Admin Action</span>
              </p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 animate-slide-down ${
            messageType === "success" 
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}>
            {messageType === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="flex-1">{message}</span>
            <button onClick={() => setMessage("")} className="hover:opacity-70">
              <X size={18} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Basic Information</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., JavaScript Fundamentals Quiz"
                  value={form.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-gray-50 dark:bg-gray-700 dark:text-white ${
                    errors.title
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe what this test covers, learning objectives, target audience..."
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              {/* Duration & Max Attempts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration"
                    placeholder="60"
                    value={form.duration}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                      errors.duration
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.duration && (
                    <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Repeat className="inline w-4 h-4 mr-1" />
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    name="maxAttempts"
                    value={form.maxAttempts}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Test Type Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Test Type</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => handleTestTypeChange("topic")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    form.testType === "topic"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <FolderTree className={`w-6 h-6 mb-2 ${form.testType === "topic" ? "text-purple-600" : "text-gray-400"}`} />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Topic Based</h3>
                  <p className="text-xs text-gray-500 mt-1">Questions from specific topic</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTestTypeChange("subject")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    form.testType === "subject"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <BookOpen className={`w-6 h-6 mb-2 ${form.testType === "subject" ? "text-purple-600" : "text-gray-400"}`} />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Subject Based</h3>
                  <p className="text-xs text-gray-500 mt-1">Questions from entire subject</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTestTypeChange("full")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    form.testType === "full"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <Layers className={`w-6 h-6 mb-2 ${form.testType === "full" ? "text-purple-600" : "text-gray-400"}`} />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Full Test</h3>
                  <p className="text-xs text-gray-500 mt-1">Questions from multiple subjects</p>
                </button>
              </div>

              {/* Dynamic Fields based on Test Type */}
              {form.testType === "topic" && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select subject</option>
                      {subjects.map(subject => (
                        <option key={subject._id} value={subject._id}>{subject.name}</option>
                      ))}
                    </select>
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Topic <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="topic"
                      value={form.topic}
                      onChange={handleChange}
                      disabled={!form.subject}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    >
                      <option value="">{form.subject ? "Select topic" : "Select subject first"}</option>
                      {filteredTopics.map(topic => (
                        <option key={topic._id} value={topic._id}>{topic.name}</option>
                      ))}
                    </select>
                    {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
                  </div>
                </div>
              )}

              {form.testType === "subject" && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>{subject.name}</option>
                    ))}
                  </select>
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>
              )}

              {form.testType === "full" && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subjects to Include <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subjects.map(subject => (
                      <label key={subject._id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <input
                          type="checkbox"
                          value={subject._id}
                          checked={form.subjects.includes(subject._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm(prev => ({ ...prev, subjects: [...prev.subjects, subject._id] }));
                            } else {
                              setForm(prev => ({ ...prev, subjects: prev.subjects.filter(id => id !== subject._id) }));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{subject.name}</span>
                      </label>
                    ))}
                  </div>
                  {errors.subjects && <p className="text-red-500 text-xs mt-1">{errors.subjects}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Schedule</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                      errors.startTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                      errors.endTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Questions Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileQuestion className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Test Questions</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuestionSelector(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 transition"
                >
                  <Plus size={16} />
                  <span>Add Questions</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {form.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No questions added yet</p>
                  <p className="text-sm">Click "Add Questions" to select questions for this test</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.questions.map((questionId, index) => {
                    const question = availableQuestions.find(q => q._id === questionId);
                    if (!question) return null;
                    return (
                      <div key={questionId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Q{index + 1}.</span>
                          <span className="ml-2 text-gray-800 dark:text-white">{question.questionText}</span>
                          <div className="mt-1 flex items-center space-x-3 text-xs">
                            <span className="text-gray-500">{getSubjectName(question.subject)}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">{getTopicName(question.topic)}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-blue-600">{question.marks} marks</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestionFromTest(questionId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.questions && <p className="text-red-500 text-xs mt-2">{errors.questions}</p>}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Advanced Settings</h2>
              </div>
              {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {showAdvanced && (
              <div className="p-6 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <input
                      type="checkbox"
                      name="allowResume"
                      checked={form.allowResume}
                      onChange={handleChange}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Allow Resume</p>
                      <p className="text-xs text-gray-500">Users can resume incomplete attempts</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <input
                      type="checkbox"
                      name="shuffleQuestions"
                      checked={form.shuffleQuestions}
                      onChange={handleChange}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Shuffle Questions</p>
                      <p className="text-xs text-gray-500">Randomize question order for each attempt</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <input
                      type="checkbox"
                      name="showResultImmediately"
                      checked={form.showResultImmediately}
                      onChange={handleChange}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Show Result Immediately</p>
                      <p className="text-xs text-gray-500">Display results right after submission</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={form.isPublished}
                      onChange={handleChange}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Publish Immediately</p>
                      <p className="text-xs text-gray-500">Make test available as soon as created</p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium flex items-center justify-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Test...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Create Test</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Question Selector Modal */}
      {showQuestionSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Select Questions</h2>
                <p className="text-sm text-gray-500 mt-1">Choose questions to add to your test</p>
              </div>
              <button onClick={() => setShowQuestionSelector(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1" style={{ maxHeight: "calc(80vh - 180px)" }}>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                <select
                  value={selectedTopicFilter}
                  onChange={(e) => setSelectedTopicFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Topics</option>
                  {topics.filter(t => !selectedSubjectFilter || t.subject === selectedSubjectFilter).map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {availableQuestions.map((question) => (
                  <label key={question._id} className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.some(q => q._id === question._id)}
                      onChange={() => toggleQuestionSelection(question)}
                      className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-white font-medium">{question.questionText}</p>
                      <div className="mt-2 flex items-center space-x-3 text-xs">
                        <span className="text-gray-500">{getSubjectName(question.subject)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{getTopicName(question.topic)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-blue-600">{question.marks} marks</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowQuestionSelector(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addSelectedQuestionsToTest}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Add {selectedQuestions.length} Questions
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}