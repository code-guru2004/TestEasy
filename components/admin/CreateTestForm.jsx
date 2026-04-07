// components/admin/CreateTestForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  TrendingUp
} from "lucide-react";

export default function CreateTestForm() {
  const router = useRouter();
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
    passingPercentage: 40,
    totalMarks: 0,
    negativeMarking: 0,
    isPublished: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState({});

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
    
    if (form.passingPercentage < 0 || form.passingPercentage > 100) {
      newErrors.passingPercentage = "Passing percentage must be between 0 and 100";
    }
    
    if (form.negativeMarking < 0) {
      newErrors.negativeMarking = "Negative marking cannot be negative";
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
      const res = await fetch("https://govt-quiz-app.onrender.com/api/admin/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          duration: Number(form.duration),
          maxAttempts: Number(form.maxAttempts),
          totalMarks: Number(form.totalMarks),
          passingPercentage: Number(form.passingPercentage),
          negativeMarking: Number(form.negativeMarking)
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg);

      setMessageType("success");
      setMessage("✅ Test created successfully!");
      
      // Reset form
      setForm({
        title: "",
        description: "",
        duration: "",
        startTime: "",
        endTime: "",
        maxAttempts: 1,
        allowResume: false,
        shuffleQuestions: false,
        showResultImmediately: false,
        passingPercentage: 40,
        totalMarks: 0,
        negativeMarking: 0,
        isPublished: false
      });
      
      // Optional: Redirect after 2 seconds
      setTimeout(() => {
        router.push("/admin/tests");
      }, 2000);
      
    } catch (err) {
      setMessageType("error");
      setMessage("❌ " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Create New Test
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 ml-12">
          Set up a new assessment with detailed configuration
        </p>
      </div>

      {/* Form Card */}
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
                Test Title *
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g., JavaScript Fundamentals Quiz"
                value={form.title}
                onChange={handleChange}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-gray-50 dark:bg-gray-700 dark:text-white ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                required
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
                placeholder="Describe what this test covers..."
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Duration & Timing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  placeholder="60"
                  value={form.duration}
                  onChange={handleChange}
                  min="1"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                    errors.duration
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
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
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                    errors.maxAttempts
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.maxAttempts && (
                  <p className="text-red-500 text-xs mt-1">{errors.maxAttempts}</p>
                )}
              </div>
            </div>
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
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                    errors.startTime
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                />
                {errors.startTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                    errors.endTime
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                />
                {errors.endTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scoring Section */}
       

        {/* Advanced Settings (Collapsible) */}
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
                <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
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

                <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
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

                <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
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

                <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
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

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center space-x-2 ${
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

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium flex items-center justify-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Test...
              </>
            ) : (
              <>
                <Save size={18} />
                Create Test
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}