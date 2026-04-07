"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  Eye,
  Edit,
  HelpCircle,
  Award,
  Target,
  BookOpen,
  Clock,
  TrendingUp,
  Zap,
  FileText,
  Image as ImageIcon
} from "lucide-react";

export default function CreateQuestionPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [selectedTopicName, setSelectedTopicName] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    questionText: "",
    questionImage: "",
    options: ["", ""],
    correctAnswer: "",
    subject: "",
    topic: "",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    fact: ""
  });

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Filter topics when subject changes
  useEffect(() => {
    if (formData.subject) {
      const filtered = topics.filter(topic => topic.subject._id === formData.subject);
      setFilteredTopics(filtered);
      // Get subject name
      const subject = subjects.find(s => s._id === formData.subject);
      setSelectedSubjectName(subject?.name || "");
      // Reset topic if it doesn't belong to new subject
      if (formData.topic && !filtered.find(t => t._id === formData.topic)) {
        setFormData(prev => ({ ...prev, topic: "" }));
        setSelectedTopicName("");
      }
    } else {
      setFilteredTopics([]);
      setSelectedSubjectName("");
      setSelectedTopicName("");
    }
  }, [formData.subject, topics, subjects]);

  // Update topic name when topic changes
  useEffect(() => {
    if (formData.topic) {
      const topic = filteredTopics.find(t => t._id === formData.topic);
      setSelectedTopicName(topic?.name || "");
    } else {
      setSelectedTopicName("");
    }
  }, [formData.topic, filteredTopics]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects/search`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      showNotification("error", "Failed to load subjects");
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/topics/search`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopics(response.data.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
      showNotification("error", "Failed to load topics");
    }
  };

  // Fetch topics when component mounts
  useEffect(() => {
    fetchTopics();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({ ...prev, options: [...prev.options, ""] }));
    } else {
      showNotification("error", "Maximum 6 options allowed");
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
      
      // If removed option was the correct answer, reset correct answer
      if (formData.correctAnswer === formData.options[index]) {
        setFormData(prev => ({ ...prev, correctAnswer: "" }));
      }
    } else {
      showNotification("error", "Minimum 2 options required");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification("error", "Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "Image size must be less than 5MB");
      return;
    }

    const formDataImage = new FormData();
    formDataImage.append('image', file);

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        formDataImage,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      setFormData(prev => ({ ...prev, questionImage: response.data.url }));
      showNotification("success", "Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      showNotification("error", "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, questionImage: "" }));
  };

  const validateForm = () => {
    if (!formData.questionText.trim()) {
      showNotification("error", "Question text is required");
      return false;
    }
    
    if (formData.options.some(opt => !opt.trim())) {
      showNotification("error", "All options must have text");
      return false;
    }
    
    if (!formData.correctAnswer) {
      showNotification("error", "Please select the correct answer");
      return false;
    }
    
    if (!formData.subject) {
      showNotification("error", "Please select a subject");
      return false;
    }
    
    if (!formData.topic) {
      showNotification("error", "Please select a topic");
      return false;
    }
    
    if (formData.marks < 0) {
      showNotification("error", "Marks cannot be negative");
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/questions`,
        {
          questionText: formData.questionText,
          questionImage: formData.questionImage || undefined,
          options: formData.options,
          correctAnswer: formData.correctAnswer,
          subject: formData.subject,
          topic: formData.topic,
          difficulty: formData.difficulty,
          marks: formData.marks,
          negativeMarks: formData.negativeMarks,
          fact: formData.fact || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      showNotification("success", "Question created successfully!");
      
      setTimeout(() => {
        setFormData({
          questionText: "",
          questionImage: "",
          options: ["", ""],
          correctAnswer: "",
          subject: "",
          topic: "",
          difficulty: "easy",
          marks: 1,
          negativeMarks: 0,
          fact: ""
        });
        setLoading(false);
        setPreviewMode(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error creating question:", error);
      showNotification(
        "error",
        error.response?.data?.msg || "Failed to create question"
      );
      setLoading(false);
    }
  };

  // Preview Component
  const QuestionPreview = () => (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden shadow-xl">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="text-white" size={20} />
            <h3 className="text-white font-semibold text-lg">Live Preview</h3>
          </div>
          <button
            onClick={() => setPreviewMode(false)}
            className="text-white hover:text-gray-200 transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Question Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <HelpCircle className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  formData.difficulty === "easy" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  formData.difficulty === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}>
                  {formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  • {formData.marks} mark{formData.marks !== 1 ? 's' : ''}
                  {formData.negativeMarks > 0 && ` • -${formData.negativeMarks} mark for wrong`}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {selectedSubjectName} • {selectedTopicName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Question Bank</span>
          </div>
        </div>

        {/* Question Text */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <p className="text-gray-800 dark:text-gray-200 text-lg font-medium">
            {formData.questionText || "Question text will appear here..."}
          </p>
          {formData.questionImage && (
            <div className="mt-4">
              <img 
                src={formData.questionImage} 
                alt="Question" 
                className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md"
              />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Select your answer:</p>
          {formData.options.map((option, index) => (
            option && (
              <div 
                key={index}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.correctAnswer === option
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    formData.correctAnswer === option
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-gray-800 dark:text-gray-200">{option}</span>
                  {formData.correctAnswer === option && (
                    <CheckCircle size={16} className="text-green-500 ml-auto" />
                  )}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Fun Fact */}
        {formData.fact && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-2">
              <Zap size={18} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Did You Know?</p>
                <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">{formData.fact}</p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Footer */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>✓ Valid question</span>
              <span>• {formData.options.filter(opt => opt).length} options</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target size={14} />
              <span>Ready to publish</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "easy": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "hard": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

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
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create New Question
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Build your question bank with detailed questions and answers
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg shadow-sm">
                <p className="text-white text-sm font-medium">Admin Access</p>
              </div>
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

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Form Header with Preview Toggle */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit size={20} className="text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">Question Editor</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
              >
                <Eye size={16} />
                <span className="text-sm font-medium">Preview</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question Text */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Type your question here..."
                  required
                />
              </div>

              {/* Question Image */}
              {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Question Image <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </label>
                {formData.questionImage ? (
                  <div className="relative inline-block">
                    <img 
                      src={formData.questionImage} 
                      alt="Question" 
                      className="max-h-48 rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-purple-500 transition" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={loading}
                    />
                  </label>
                )}
              </div> */}

              {/* Options */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Answer Options <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
                  >
                    <Plus size={14} />
                    <span>Add Option</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                  Minimum 2 options, maximum 6 options
                </p>
              </div>

              {/* Correct Answer */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Correct Answer <span className="text-red-500">*</span>
                </label>
                <select
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select the correct answer</option>
                  {formData.options.map((option, index) => (
                    option && (
                      <option key={index} value={option}>
                        {String.fromCharCode(65 + index)}. {option}
                      </option>
                    )
                  ))}
                </select>
                {formData.correctAnswer && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✓ Correct answer selected
                  </p>
                )}
              </div>

              {/* Subject and Topic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    disabled={!formData.subject}
                  >
                    <option value="">
                      {!formData.subject ? "Select subject first" : "Select topic"}
                    </option>
                    {filteredTopics.map((topic) => (
                      <option key={topic._id} value={topic._id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                  {formData.subject && filteredTopics.length === 0 && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      ⚠️ No topics found. Please create a topic first.
                    </p>
                  )}
                </div>
              </div>

              {/* Difficulty and Marks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${getDifficultyColor(formData.difficulty)}`}
                  >
                    <option value="easy">🌟 Easy</option>
                    <option value="medium">⚡ Medium</option>
                    <option value="hard">🔥 Hard</option>
                  </select>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Marks
                  </label>
                  <div className="relative">
                    <Award size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="marks"
                      value={formData.marks}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Negative Marks
                  </label>
                  <div className="relative">
                    <TrendingUp size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="negativeMarks"
                      value={formData.negativeMarks}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Fun Fact */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Fun Fact <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </label>
                <textarea
                  name="fact"
                  value={formData.fact}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Add an interesting fact to engage students..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Create Question</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-8 h-fit">
            {previewMode ? (
              <QuestionPreview />
            ) : (
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Live Preview
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Click the preview button to see how your question will look to students
                </p>
                <button
                  onClick={() => setPreviewMode(true)}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Enable Preview
                </button>
              </div>
            )}
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