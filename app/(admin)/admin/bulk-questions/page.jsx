"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Upload,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  FileJson,
  Database,
  Zap,
  TrendingUp,
  Award,
  BookOpen,
  CheckSquare,
  AlertTriangle,
  Info
} from "lucide-react";

export default function BulkUploadQuestionsPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [jsonFile, setJsonFile] = useState(null);
  const [jsonPreview, setJsonPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [results, setResults] = useState(null);
  
  // Duplicate handling options
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [checkDatabase, setCheckDatabase] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    defaultDifficulty: "",
    defaultMarks: "",
    defaultNegativeMarks: ""
  });

  // Validation state
  const [validation, setValidation] = useState({
    isValid: false,
    errors: [],
    warnings: []
  });

  useEffect(() => {
    fetchSubjects();
    fetchTopics();
  }, []);

  useEffect(() => {
    if (formData.subject) {
      const filtered = topics.filter(topic => topic.subject._id === formData.subject);
      setFilteredTopics(filtered);
      if (formData.topic && !filtered.find(t => t._id === formData.topic)) {
        setFormData(prev => ({ ...prev, topic: "" }));
      }
    } else {
      setFilteredTopics([]);
    }
  }, [formData.subject, topics]);

  useEffect(() => {
    if (jsonPreview) {
      validateJSON();
    }
  }, [jsonPreview, formData.subject, formData.topic]);

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      showNotification("error", "Please upload a JSON file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotification("error", "File size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        
        // Validate JSON structure
        if (!Array.isArray(jsonData)) {
          showNotification("error", "JSON must be an array of questions");
          return;
        }

        if (jsonData.length === 0) {
          showNotification("error", "JSON array cannot be empty");
          return;
        }

        if (jsonData.length > 500) {
          showNotification("error", "Maximum 500 questions allowed per upload");
          return;
        }

        setJsonFile(file);
        setJsonPreview(jsonData);
        showNotification("success", `Loaded ${jsonData.length} questions successfully`);
      } catch (error) {
        showNotification("error", "Invalid JSON format: " + error.message);
      }
    };
    reader.readAsText(file);
  };

  const validateJSON = () => {
    const errors = [];
    const warnings = [];

    if (!jsonPreview) return;

    jsonPreview.forEach((question, index) => {
      const qNum = index + 1;
      
      // Required field validation
      if (!question.questionText?.en) {
        errors.push(`Question ${qNum}: English question text is required`);
      }
      
      if (!question.options || !Array.isArray(question.options)) {
        errors.push(`Question ${qNum}: Options array is required`);
      } else if (question.options.length < 2) {
        errors.push(`Question ${qNum}: At least 2 options required (found ${question.options.length})`);
      } else {
        // Check each option
        question.options.forEach((opt, optIdx) => {
          if (!opt.en) {
            errors.push(`Question ${qNum}, Option ${optIdx + 1}: English text is required`);
          }
        });
      }
      
      // Correct answer validation
      if (question.correctAnswer === undefined) {
        errors.push(`Question ${qNum}: correctAnswer is required`);
      } else if (typeof question.correctAnswer === "number") {
        if (question.correctAnswer < 0 || question.correctAnswer >= (question.options?.length || 0)) {
          errors.push(`Question ${qNum}: correctAnswer index out of range`);
        }
      } else if (typeof question.correctAnswer === "string") {
        const found = question.options?.find(opt => opt.en === question.correctAnswer);
        if (!found) {
          errors.push(`Question ${qNum}: correctAnswer text does not match any option`);
        }
      } else {
        errors.push(`Question ${qNum}: correctAnswer must be a number (index) or string (option text)`);
      }
      
      // Warnings for missing optional fields
      if (!question.questionText?.hi && !question.questionText?.bn) {
        warnings.push(`Question ${qNum}: No Hindi or Bengali translations provided (optional)`);
      }
      
      if (question.options?.some(opt => !opt.hi && !opt.bn)) {
        warnings.push(`Question ${qNum}: Some options missing Hindi/Bengali translations (optional)`);
      }
      
      if (question.difficulty && !["easy", "medium", "hard"].includes(question.difficulty)) {
        warnings.push(`Question ${qNum}: Invalid difficulty value, will use default`);
      }
      
      if (question.marks && (question.marks < 0 || isNaN(question.marks))) {
        warnings.push(`Question ${qNum}: Invalid marks value, will use default`);
      }
    });

    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!jsonPreview) {
      showNotification("error", "Please upload a JSON file first");
      return;
    }
    
    if (!formData.subject || !formData.topic) {
      showNotification("error", "Please select subject and topic");
      return;
    }
    
    if (!validation.isValid) {
      showNotification("error", "Please fix validation errors before uploading");
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    
    // Prepare questions data
    const questionsData = jsonPreview.map(q => ({
      questionText: {
        en: q.questionText.en,
        hi: q.questionText.hi || "",
        bn: q.questionText.bn || ""
      },
      questionImage: q.questionImage || "",
      options: q.options.map(opt => ({
        en: opt.en,
        hi: opt.hi || "",
        bn: opt.bn || ""
      })),
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty || formData.defaultDifficulty || undefined,
      marks: q.marks || (formData.defaultMarks ? parseFloat(formData.defaultMarks) : undefined),
      negativeMarks: q.negativeMarks || (formData.defaultNegativeMarks ? parseFloat(formData.defaultNegativeMarks) : undefined),
      fact: {
        en: q.fact?.en || "",
        hi: q.fact?.hi || "",
        bn: q.fact?.bn || ""
      }
    }));
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/bulk`,
        {
          questions: questionsData,
          subject: formData.subject,
          topic: formData.topic,
          defaultDifficulty: formData.defaultDifficulty || undefined,
          defaultMarks: formData.defaultMarks ? parseFloat(formData.defaultMarks) : undefined,
          defaultNegativeMarks: formData.defaultNegativeMarks ? parseFloat(formData.defaultNegativeMarks) : undefined,
          skipDuplicates: skipDuplicates,
          checkAgainstDatabase: checkDatabase
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          }
        }
      );
      
      setResults(response.data.results);
      showNotification("success", response.data.msg);
      
      // Don't clear results immediately to let user see them
      setTimeout(() => {
        setJsonFile(null);
        setJsonPreview(null);
        setValidation({ isValid: false, errors: [], warnings: [] });
        setFormData(prev => ({ ...prev, topic: "" }));
        setUploadProgress(0);
      }, 5000);
      
    } catch (error) {
      console.error("Error uploading questions:", error);
      showNotification(
        "error",
        error.response?.data?.msg || "Failed to upload questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        questionText: {
          en: "What is the capital of France?",
          hi: "फ्रांस की राजधानी क्या है?",
          bn: "ফ্রান্সের রাজধানী কি?"
        },
        questionImage: "",
        options: [
          { en: "London", hi: "लंदन", bn: "লন্ডন" },
          { en: "Berlin", hi: "बर्लिन", bn: "বার্লিন" },
          { en: "Paris", hi: "पेरिस", bn: "প্যারিস" },
          { en: "Madrid", hi: "मैड्रिड", bn: "মাদ্রিদ" }
        ],
        correctAnswer: 2,
        difficulty: "easy",
        marks: 1,
        negativeMarks: 0,
        fact: {
          en: "Paris is also known as the City of Light",
          hi: "पेरिस को रोशनी का शहर भी कहा जाता है",
          bn: "প্যারিস আলোর শহর নামেও পরিচিত"
        }
      },
      {
        questionText: {
          en: "Which planet is known as the Red Planet?",
          hi: "किस ग्रह को लाल ग्रह के नाम से जाना जाता है?",
          bn: "কোন গ্রহটি লাল গ্রহ নামে পরিচিত?"
        },
        questionImage: "",
        options: [
          { en: "Mars", hi: "मंगल", bn: "মঙ্গল" },
          { en: "Jupiter", hi: "बृहस्पति", bn: "বৃহস্পতি" },
          { en: "Venus", hi: "शुक्र", bn: "শুক্র" },
          { en: "Saturn", hi: "शनि", bn: "শনি" }
        ],
        correctAnswer: "Mars",
        difficulty: "medium",
        marks: 2,
        negativeMarks: 0.5,
        fact: {
          en: "Mars appears red due to iron oxide (rust) on its surface",
          hi: "मंगल अपनी सतह पर आयरन ऑक्साइड (जंग) के कारण लाल दिखता है",
          bn: "মঙ্গল তার পৃষ্ঠে আয়রন অক্সাইড (মরিচা) এর কারণে লাল দেখায়"
        }
      }
    ];
    
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = "data:application/json;charset=utf-8,"+ encodeURIComponent(dataStr);
    const exportFileDefaultName = "questions_template.json";
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const removeFile = () => {
    setJsonFile(null);
    setJsonPreview(null);
    setValidation({ isValid: false, errors: [], warnings: [] });
    setResults(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearResults = () => {
    setResults(null);
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
                Bulk Upload Questions
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Upload multiple questions at once using JSON format
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition"
            >
              <Download size={18} />
              <span>Download Template</span>
            </button>
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

        {/* Results Summary */}
        {results && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <CheckSquare className="mr-2 text-green-600" />
                Upload Results
              </h3>
              <button
                onClick={clearResults}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {results.successful || 0}
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Skipped (Duplicates)</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {results.skipped || 0}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {results.failed || 0}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {results.total || 0}
                </p>
              </div>
            </div>
            
            {/* Show skipped duplicates details */}
            {results.details?.skipped?.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  View Skipped Duplicates ({results.details.skipped.length})
                </summary>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {results.details.skipped.map((skip, idx) => (
                    <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                      <p className="font-semibold text-yellow-700 dark:text-yellow-300">
                        Question {skip.index}
                      </p>
                      <p className="text-yellow-600 dark:text-yellow-400">{skip.reason}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                        Text: {skip.questionText}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            )}
            
            {/* Show failed questions details */}
            {results.details?.failed?.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-red-600 dark:text-red-400">
                  View Failed Questions ({results.details.failed.length})
                </summary>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {results.details.failed.map((fail, idx) => (
                    <div key={idx} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm">
                      <p className="font-semibold text-red-700 dark:text-red-300">
                        Question {fail.index}
                      </p>
                      <p className="text-red-600 dark:text-red-400">{fail.error}</p>
                      {fail.questionText && (
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          Text: {fail.questionText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Show successful questions summary */}
            {results.details?.successful?.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-green-600 dark:text-green-400">
                  View Successful Questions ({results.details.successful.length})
                </summary>
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {results.details.successful.map((success, idx) => (
                    <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 p-1">
                      • Question {success.index}: {success.questionText}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Upload JSON File <span className="text-red-500">*</span>
              </label>
              
              {!jsonFile ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-gray-400 mb-3 group-hover:text-purple-500 transition" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to upload JSON file
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      JSON array format, max 500 questions, up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="application/json"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </label>
              ) : (
                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileJson className="text-purple-600 dark:text-purple-400" size={24} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{jsonFile.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(jsonFile.size / 1024).toFixed(2)} KB • {jsonPreview?.length || 0} questions
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-3">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-purple-600 h-2 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Subject and Topic Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BookOpen size={18} className="mr-2 text-purple-600" />
                Subject & Topic Assignment
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                </div>
              </div>
            </div>

            {/* Default Values Override */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Database size={18} className="mr-2 text-purple-600" />
                Default Values (Optional)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                These values will override missing values in individual questions
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Difficulty
                  </label>
                  <select
                    name="defaultDifficulty"
                    value={formData.defaultDifficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Not set (use individual)</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Marks
                  </label>
                  <div className="relative">
                    <Award size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="defaultMarks"
                      value={formData.defaultMarks}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Negative Marks
                  </label>
                  <div className="relative">
                    <TrendingUp size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="defaultNegativeMarks"
                      value={formData.defaultNegativeMarks}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Duplicate Handling Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle size={18} className="mr-2 text-purple-600" />
                Duplicate Handling
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Skip duplicate questions automatically
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      When enabled, duplicate questions will be skipped and the rest will be uploaded. 
                      When disabled, the entire upload will fail if any duplicates are found.
                    </p>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkDatabase}
                    onChange={(e) => setCheckDatabase(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Check against existing questions in database
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      When enabled, questions will be checked against existing questions in the selected subject and topic.
                      When disabled, only duplicate detection within the current batch will be performed.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !jsonPreview || !validation.isValid || !formData.subject || !formData.topic}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Uploading Questions...</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span>Upload {jsonPreview?.length || 0} Questions</span>
                </>
              )}
            </button>
          </div>

          {/* Validation & Preview Section */}
          <div className="space-y-6">
            {jsonPreview && (
              <>
                {/* Validation Summary */}
                <div className={`rounded-xl border-2 p-6 ${
                  validation.isValid 
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    {validation.isValid ? (
                      <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                    ) : (
                      <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {validation.isValid ? "Validation Passed" : "Validation Failed"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {jsonPreview.length} questions analyzed
                      </p>
                    </div>
                  </div>

                  {validation.errors.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center">
                        <AlertTriangle size={14} className="mr-1" />
                        Errors ({validation.errors.length})
                      </p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {validation.errors.slice(0, 10).map((error, idx) => (
                          <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                            • {error}
                          </p>
                        ))}
                        {validation.errors.length > 10 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ... and {validation.errors.length - 10} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {validation.warnings.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center">
                        <Info size={14} className="mr-1" />
                        Warnings ({validation.warnings.length})
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {validation.warnings.slice(0, 5).map((warning, idx) => (
                          <p key={idx} className="text-xs text-yellow-600 dark:text-yellow-400">
                            • {warning}
                          </p>
                        ))}
                        {validation.warnings.length > 5 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ... and {validation.warnings.length - 5} more warnings
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview of First Few Questions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                    <h3 className="text-white font-semibold flex items-center">
                      <FileJson size={18} className="mr-2" />
                      JSON Preview (First 3 Questions)
                    </h3>
                  </div>
                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {jsonPreview.slice(0, 3).map((question, idx) => (
                      <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                          Q{idx + 1}: {question.questionText?.en}
                        </p>
                        <div className="space-y-1 ml-4">
                          {question.options?.map((opt, optIdx) => (
                            <p key={optIdx} className="text-sm text-gray-600 dark:text-gray-400">
                              {String.fromCharCode(65 + optIdx)}. {opt.en}
                            </p>
                          ))}
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                          Correct: {typeof question.correctAnswer === "number" 
                            ? String.fromCharCode(65 + question.correctAnswer)
                            : question.correctAnswer}
                        </p>
                        {question.difficulty && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Difficulty: {question.difficulty} | Marks: {question.marks || 1}
                          </p>
                        )}
                      </div>
                    ))}
                    {jsonPreview.length > 3 && (
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        ... and {jsonPreview.length - 3} more questions
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Info Card */}
            {!jsonPreview && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                <div className="flex items-start space-x-3">
                  <Info className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      How to format your JSON file
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• JSON must be an array of question objects</li>
                      <li>• Each question requires: questionText.en, options array (min 2), correctAnswer</li>
                      <li>• correctAnswer can be index (0-based) OR exact English text of option</li>
                      <li>• All fields support multilingual (en, hi, bn) - only English required</li>
                      <li>• Download the template for a complete example</li>
                    </ul>
                  </div>
                </div>
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