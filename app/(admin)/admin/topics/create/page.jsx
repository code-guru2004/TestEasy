"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  FolderTree,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  X,
  Layers,
  Sparkles,
  Info,
  Hash,
  BookOpen,
  Link as LinkIcon,
  AlertTriangle,
  TrendingUp,
  Tag,
  Clock,
  Award,
  Briefcase,
  Plus,
  Trash2,
  Star,
  AlertOctagon
} from "lucide-react";

export default function CreateTopicPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    subjectId: "",
    summary: "",
    order: 0,
    readTime: null,
    importanceLevel: "High",
    prerequisites: [],
    examSpecific: [],
    tags: [],
    metadata: {
      totalQuestions: 0,
      averageTimePerQuestion: null,
      successRate: null
    }
  });
  
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  
  // Exam mapping state
  const [selectedExams, setSelectedExams] = useState([]);
  const availableExams = [
    { value: 'SSC', label: 'SSC', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    { value: 'RRB_NTPC', label: 'RRB NTPC', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    { value: 'UPSC', label: 'UPSC', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    { value: 'STATE_PSC', label: 'State PSC', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    { value: 'BANKING', label: 'Banking', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    { value: 'OTHER', label: 'Other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' }
  ];

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Fetch topics when subject is selected (for prerequisites)
  useEffect(() => {
    if (formData.subjectId) {
      fetchTopicsBySubject(formData.subjectId);
      const subject = subjects.find(s => s._id === formData.subjectId);
      setSelectedSubject(subject);
    } else {
      setSelectedSubject(null);
      setTopics([]);
    }
  }, [formData.subjectId, subjects]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data.data)
      setSubjects(response.data.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      showNotification("error", "Failed to load subjects");
    }
  };

  const fetchTopicsBySubject = async (subjectId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/topics/subject/${subjectId}?includeInactive=false`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTopics(response.data.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExamMappingChange = (examValue, field, value) => {
    setFormData(prev => {
      const existingIndex = prev.examSpecific.findIndex(e => e.exam === examValue);
      let newExamSpecific = [...prev.examSpecific];
      
      if (existingIndex >= 0) {
        newExamSpecific[existingIndex] = {
          ...newExamSpecific[existingIndex],
          [field]: value
        };
      } else {
        newExamSpecific.push({
          exam: examValue,
          importance: field === 'importance' ? value : 'Medium',
          weightage: field === 'weightage' ? value : 0,
          previousYearCount: field === 'previousYearCount' ? value : 0
        });
      }
      
      return { ...prev, examSpecific: newExamSpecific };
    });
  };

  const addExamToTopic = (examValue) => {
    if (!selectedExams.includes(examValue)) {
      setSelectedExams([...selectedExams, examValue]);
      setFormData(prev => ({
        ...prev,
        examSpecific: [
          ...prev.examSpecific,
          { exam: examValue, importance: 'Medium', weightage: 0, previousYearCount: 0 }
        ]
      }));
    }
  };

  const removeExamFromTopic = (examValue) => {
    setSelectedExams(selectedExams.filter(e => e !== examValue));
    setFormData(prev => ({
      ...prev,
      examSpecific: prev.examSpecific.filter(e => e.exam !== examValue)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePrerequisiteChange = (topicId) => {
    setFormData(prev => {
      const isSelected = prev.prerequisites.includes(topicId);
      const newPrerequisites = isSelected
        ? prev.prerequisites.filter(id => id !== topicId)
        : [...prev.prerequisites, topicId];
      return { ...prev, prerequisites: newPrerequisites };
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showNotification("error", "Topic name is required");
      return false;
    }
    
    if (formData.name.length < 2) {
      showNotification("error", "Topic name must be at least 2 characters");
      return false;
    }
    
    if (formData.name.length > 100) {
      showNotification("error", "Topic name must be less than 100 characters");
      return false;
    }
    
    if (!formData.subjectId) {
      showNotification("error", "Please select a subject for this topic");
      return false;
    }
    
    if (formData.summary && formData.summary.length > 500) {
      showNotification("error", "Summary must be less than 500 characters");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/topics/create`,
        {
          name: formData.name,
          subjectId: formData.subjectId,
          summary: formData.summary || undefined,
          order: formData.order,
          readTime: formData.readTime || undefined,
          importanceLevel: formData.importanceLevel,
          prerequisites: formData.prerequisites,
          examSpecific: formData.examSpecific.filter(e => e.weightage > 0 || e.importance !== 'Medium'),
          tags: formData.tags,
          metadata: formData.metadata
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      showNotification("success", "Topic created successfully!");
      
      setTimeout(() => {
        // Reset form
        setFormData({
          name: "",
          subjectId: "",
          summary: "",
          order: 0,
          readTime: null,
          importanceLevel: "High",
          prerequisites: [],
          examSpecific: [],
          tags: [],
          metadata: {
            totalQuestions: 0,
            averageTimePerQuestion: null,
            successRate: null
          }
        });
        setSelectedExams([]);
        setNewTag("");
        setLoading(false);
        
        // Optional: Redirect after 2 seconds
        setTimeout(() => {
          router.push("/admin/topics");
        }, 1500);
      }, 2000);
      
    } catch (error) {
      console.error("Error creating topic:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to create topic"
      );
      setLoading(false);
    }
  };

  const getImportanceColor = (level) => {
    switch(level) {
      case 'Very High': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Topics</span>
          </button>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-xl">
                  <FolderTree className="text-white" size={28} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Create New Topic
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-14">
                Add topics under subjects with advanced configuration
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-lg shadow-sm">
              <p className="text-white text-sm font-medium flex items-center space-x-2">
                <Sparkles size={16} />
                <span>Admin Action</span>
              </p>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 animate-slide-down ${
            notification.type === "success" 
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}>
            {notification.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="flex-1">{notification.message}</span>
            <button 
              onClick={() => setNotification({ show: false, type: "", message: "" })}
              className="hover:opacity-70 transition"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
            <div className="flex items-center space-x-2">
              <Layers className="text-white" size={20} />
              <h2 className="text-white font-semibold text-lg">Topic Information</h2>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Subject Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Select Subject <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BookOpen size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition appearance-none cursor-pointer"
                  required
                >
                  <option value="">Choose a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {subjects.length === 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center space-x-1 mt-1">
                  <AlertTriangle size={12} />
                  <span>No subjects available. Please create a subject first.</span>
                </p>
              )}
            </div>

            {/* Selected Subject Preview */}
            {selectedSubject && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center space-x-2">
                  <LinkIcon size={14} className="text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Selected Subject:</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{selectedSubject.name}</span>
                </div>
                {selectedSubject.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 ml-6">
                    {selectedSubject.description}
                  </p>
                )}
              </div>
            )}

            {/* Topic Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Topic Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  placeholder="e.g., Percentage, Averages, Profit & Loss"
                  autoFocus
                  disabled={!formData.subjectId}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.name.length}/100 characters
              </p>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Summary <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Info size={18} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Brief description of the topic and key concepts covered..."
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.summary.length}/500 characters
              </p>
            </div>

            {/* Display Order & Read Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Display Order
                </label>
                <div className="relative">
                  <TrendingUp size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Lower numbers appear first</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Read Time (minutes)
                </label>
                <div className="relative">
                  <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="readTime"
                    value={formData.readTime || ""}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Estimated reading time"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Importance Level */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Importance Level
              </label>
              <div className="relative">
                <Award size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="importanceLevel"
                  value={formData.importanceLevel}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                >
                  <option value="Very High">Very High</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Importance level for exam preparation prioritization
              </p>
            </div>

            {/* Prerequisites */}
            {topics.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Prerequisites <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </label>
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Select topics that should be completed before this one
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {topics.filter(t => t._id !== formData._id).map((topic) => (
                      <label key={topic._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.prerequisites.includes(topic._id)}
                          onChange={() => handlePrerequisiteChange(topic._id)}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{topic.name}</p>
                          {topic.summary && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{topic.summary.substring(0, 100)}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getImportanceColor(topic.importanceLevel)}`}>
                          {topic.importanceLevel}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Exam Mapping */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Exam Mapping
              </label>
              <div className="space-y-3">
                {/* Add Exam Button */}
                <div className="flex flex-wrap gap-2">
                  {availableExams
                    .filter(exam => !selectedExams.includes(exam.value))
                    .map((exam) => (
                      <button
                        key={exam.value}
                        type="button"
                        onClick={() => addExamToTopic(exam.value)}
                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center space-x-1"
                      >
                        <Plus size={14} />
                        <span>{exam.label}</span>
                      </button>
                    ))}
                </div>

                {/* Selected Exams with Configuration */}
                {selectedExams.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Configure Exam Details:</p>
                    {selectedExams.map((examValue) => {
                      const exam = availableExams.find(e => e.value === examValue);
                      const examData = formData.examSpecific.find(e => e.exam === examValue);
                      return (
                        <div key={examValue} className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                          <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${exam.color}`}>
                              {exam.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeExamFromTopic(examValue)}
                              className="text-red-500 hover:text-red-700 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Importance
                              </label>
                              <select
                                value={examData?.importance || "Medium"}
                                onChange={(e) => handleExamMappingChange(examValue, 'importance', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Weightage (%)
                              </label>
                              <input
                                type="number"
                                value={examData?.weightage || 0}
                                onChange={(e) => handleExamMappingChange(examValue, 'weightage', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="e.g., 15"
                                min="0"
                                max="100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Previous Year Count
                              </label>
                              <input
                                type="number"
                                value={examData?.previousYearCount || 0}
                                onChange={(e) => handleExamMappingChange(examValue, 'previousYearCount', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Times appeared"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tags <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Add tags (e.g., algebra, basic-math, shortcuts)"
                  />
                </div>
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition"
                >
                  <Plus size={18} />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500 transition"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Preview Card */}
            {formData.name && selectedSubject && (
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles size={16} className="text-emerald-600" />
                  <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Preview</h3>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <FolderTree className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-white text-lg">
                        {formData.name}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getImportanceColor(formData.importanceLevel)}`}>
                        {formData.importanceLevel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <BookOpen size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {selectedSubject.name}
                      </span>
                    </div>
                    {formData.summary && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {formData.summary}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs text-gray-500 dark:text-gray-400">
                          #{tag}
                        </span>
                      ))}
                      {formData.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{formData.tags.length - 3} more
                        </span>
                      )}
                    </div>
                    {selectedExams.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedExams.slice(0, 2).map((exam) => (
                          <span key={exam} className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                            {exam}
                          </span>
                        ))}
                        {selectedExams.length > 2 && (
                          <span className="text-xs text-gray-500">+{selectedExams.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.subjectId}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Create Topic</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Card */}
        <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                <Sparkles size={16} className="text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-teal-900 dark:text-teal-300 mb-1">
                Best practices for topics
              </h4>
              <ul className="text-xs text-teal-800 dark:text-teal-400 space-y-1">
                <li>• Create specific, focused topics rather than broad categories</li>
                <li>• Set appropriate importance level based on exam relevance</li>
                <li>• Add tags to improve search and categorization</li>
                <li>• Configure exam mapping to track topic importance across different exams</li>
                <li>• Define prerequisites to create learning paths for students</li>
                <li>• Add a clear summary to help students understand what they'll learn</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

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