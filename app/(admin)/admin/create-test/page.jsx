"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  FileText,
  Clock,
  Calendar,
  Settings,
  Shield,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Save,
  X,
  Copy,
  Layers,
  Target,
  BookOpen,
  FolderTree,
  Plus,
  Trash2,
  Repeat
} from "lucide-react";

export default function CreateTestForm() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  // Add mounted state to prevent hydration mismatches
  const [mounted, setMounted] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    scheduleType: "one-time",
    recurrence: {
      timeOfDay: "",
      daysOfWeek: [],
      dayOfMonth: null
    },
    startTime: "",
    endTime: "",
    maxAttempts: 1,
    allowResume: false,
    shuffleQuestions: false,
    showResultImmediately: false,
    isPublished: false,
    testType: "full",
    subject: "",
    topic: "",
    subjects: [],
    hasSections: false,
    sections: [],
    totalMarks: 0,
    negativeMarks: 0,
    isTemplate: false,
    parentTest: "",
    validForDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Data from API
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch subjects on mount
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

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  useEffect(() => {
    if (token && mounted) {
      fetchSubjects();
      fetchTopics();
      fetchTemplates();
    }
  }, [token, mounted]);

  // Filter topics when subject changes
  const updateFilteredTopics = (subjectId) => {
    if (subjectId) {
      const filtered = topics.filter(topic => topic.subject?._id === subjectId || topic.subject === subjectId);
      setFilteredTopics(filtered);
      if (form.topic && !filtered.find(t => t._id === form.topic)) {
        setForm(prev => ({ ...prev, topic: "" }));
      }
    } else {
      setFilteredTopics([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    
    if (name === "subject") {
      updateFilteredTopics(value);
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleRecurrenceChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        [field]: value
      }
    }));
  };

  const handleDayOfWeekToggle = (day) => {
    setForm(prev => {
      const days = prev.recurrence.daysOfWeek.includes(day)
        ? prev.recurrence.daysOfWeek.filter(d => d !== day)
        : [...prev.recurrence.daysOfWeek, day];
      return {
        ...prev,
        recurrence: {
          ...prev.recurrence,
          daysOfWeek: days
        }
      };
    });
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...form.sections];
    updatedSections[index][field] = value;
    setForm(prev => ({ ...prev, sections: updatedSections }));
  };

  const addSection = () => {
    setForm(prev => ({
      ...prev,
      sections: [...prev.sections, { title: "", duration: 0, questions: [] }]
    }));
  };

  const removeSection = (index) => {
    const updatedSections = form.sections.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, sections: updatedSections }));
  };

  const handleTestTypeChange = (type) => {
    setForm(prev => ({ 
      ...prev, 
      testType: type,
      subject: "",
      topic: "",
      subjects: []
    }));
    setErrors({});
  };

  const handleSubjectToggle = (subjectId) => {
    if (form.subjects.includes(subjectId)) {
      setForm(prev => ({ ...prev, subjects: prev.subjects.filter(id => id !== subjectId) }));
    } else {
      setForm(prev => ({ ...prev, subjects: [...prev.subjects, subjectId] }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // For instance from template
    if (form.parentTest) {
      if (!form.validForDate) {
        newErrors.validForDate = "Valid for date is required";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // For template or normal test
    if (!form.title.trim()) {
      newErrors.title = "Test title is required";
    }
    
    if (!form.hasSections && !form.duration) {
      newErrors.duration = "Duration is required for non-section tests";
    }
    
    if (form.hasSections && form.sections.length === 0) {
      newErrors.sections = "At least one section is required";
    }
    
    if (form.hasSections) {
      form.sections.forEach((section, idx) => {
        if (!section.title.trim()) {
          newErrors[`section_${idx}_title`] = "Section title required";
        }
        if (!section.duration || section.duration <= 0) {
          newErrors[`section_${idx}_duration`] = "Valid duration required";
        }
      });
    }
    
    if (!form.isTemplate && form.scheduleType === "one-time") {
      if (!form.startTime) {
        newErrors.startTime = "Start time is required";
      }
      if (!form.endTime) {
        newErrors.endTime = "End time is required";
      }
      if (form.startTime && form.endTime && new Date(form.startTime) >= new Date(form.endTime)) {
        newErrors.endTime = "End time must be after start time";
      }
    }
    
    if (form.isTemplate && form.scheduleType !== "one-time") {
      if (!form.recurrence.timeOfDay) {
        newErrors.recurrence_timeOfDay = "Time of day is required for template";
      }
      if (form.scheduleType === "weekly" && form.recurrence.daysOfWeek.length === 0) {
        newErrors.recurrence_daysOfWeek = "Select at least one day for weekly template";
      }
      if (form.scheduleType === "monthly" && !form.recurrence.dayOfMonth) {
        newErrors.recurrence_dayOfMonth = "Day of month is required for monthly template";
      }
    }
    
    if (form.maxAttempts < 1) {
      newErrors.maxAttempts = "Max attempts must be at least 1";
    }
    
    if (form.testType === "topic" && !form.topic) {
      newErrors.topic = "Please select a topic for topic-based test";
    }
    
    if (form.testType === "topic" && !form.subject) {
      newErrors.subject = "Please select a subject for topic-based test";
    }
    
    if (form.testType === "subject" && !form.subject) {
      newErrors.subject = "Please select a subject for subject-based test";
    }
    
    if (form.testType === "full" && form.subjects.length === 0) {
      newErrors.subjects = "Please select at least one subject for full test";
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
      let payload = {};

      // Case 1: Instance from template
      if (form.parentTest) {
        payload = {
          parentTest: form.parentTest,
          validForDate: form.validForDate
        };
      } 
      // Case 2: Template or Normal test
      else {
        payload = {
          title: form.title,
          description: form.description,
          scheduleType: form.scheduleType,
          totalMarks: form.totalMarks || 0,
          maxAttempts: Number(form.maxAttempts),
          allowResume: form.allowResume,
          shuffleQuestions: form.shuffleQuestions,
          showResultImmediately: form.showResultImmediately,
          hasSections: form.hasSections,
          testType: form.testType,
          negativeMarks: form.negativeMarks || 0,
          isTemplate: form.isTemplate,
          isPublished: form.isPublished
        };

        // Add sections if hasSections
        if (form.hasSections) {
          payload.sections = form.sections.map(s => ({
            title: s.title,
            duration: s.duration
          }));
        } else {
          payload.duration = Number(form.duration);
        }

        // Add recurrence for templates
        if (form.isTemplate && form.scheduleType !== "one-time") {
          payload.recurrence = {
            timeOfDay: form.recurrence.timeOfDay,
            daysOfWeek: form.recurrence.daysOfWeek,
            dayOfMonth: form.recurrence.dayOfMonth
          };
        }

        // Add time range for one-time tests
        if (!form.isTemplate && form.scheduleType === "one-time") {
          payload.startTime = form.startTime;
          payload.endTime = form.endTime;
        }

        // Add test type specific fields
        if (form.testType === "topic") {
          payload.topic = form.topic;
          payload.subject = form.subject;
        } else if (form.testType === "subject") {
          payload.subject = form.subject;
        } else if (form.testType === "full") {
          payload.subjects = form.subjects;
        }
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tests/draft`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessageType("success");
      if (form.parentTest) {
        setMessage("✅ Test instance created successfully!");
      } else if (form.isTemplate) {
        setMessage("✅ Test template created successfully!");
      } else {
        setMessage("✅ Test created successfully! You can now add questions.");
      }
      
      setTimeout(() => {
        if (response.data.data?.id) {
          if (form.parentTest || form.isTemplate) {
            router.push("/dashboard/admin/tests");
          } else {
            router.push(`/admin/tests/${response.data.data.id}/edit`);
          }
        } else {
          router.push("/dashboard/admin/tests");
        }
      }, 2000);
      
    } catch (err) {
      setMessageType("error");
      setMessage("❌ " + (err.response?.data?.message || err.message));
    }

    setLoading(false);
  };

  const resetFormForTemplateInstance = () => {
    setForm({
      ...form,
      parentTest: "",
      validForDate: "",
      title: "",
      description: "",
      duration: "",
      scheduleType: "one-time",
      recurrence: { timeOfDay: "", daysOfWeek: [], dayOfMonth: null },
      startTime: "",
      endTime: "",
      hasSections: false,
      sections: [],
      testType: "full",
      subject: "",
      topic: "",
      subjects: [],
      isTemplate: false
    });
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Create a one-time test, recurring template, or generate daily test instances
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
          {/* Creation Type Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Copy className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Creation Type</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="creationType"
                    checked={!form.parentTest}
                    onChange={() => resetFormForTemplateInstance()}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">New Test / Template</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="creationType"
                    checked={!!form.parentTest}
                    onChange={() => setForm(prev => ({ ...prev, parentTest: "" }))}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Generate from Template (Daily/Weekly/Monthly)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Template Instance Section */}
          {form.parentTest !== undefined && form.parentTest !== "" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Generate Test Instance</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Template <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="parentTest"
                    value={form.parentTest}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a template</option>
                    {templates.map(template => (
                      <option key={template._id} value={template._id}>
                        {template.title} ({template.scheduleType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valid For Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="validForDate"
                    value={form.validForDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.validForDate && <p className="text-red-500 text-xs mt-1">{errors.validForDate}</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    The test will be scheduled based on the template's recurrence time
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* New Test / Template Form */}
          {(!form.parentTest || form.parentTest === "") && (
            <>
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-500" />
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
                      placeholder="Describe what this test covers, learning objectives..."
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white resize-none"
                    />
                  </div>

                  {/* Template Toggle */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <input
                      type="checkbox"
                      name="isTemplate"
                      checked={form.isTemplate}
                      onChange={handleChange}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Create as Template</p>
                      <p className="text-xs text-gray-500">Used for generating recurring tests (daily/weekly/monthly)</p>
                    </div>
                  </div>

                  {/* Schedule Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Schedule Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["one-time", "daily", "weekly", "monthly"].map(type => (
                        <label key={type} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                          <input
                            type="radio"
                            name="scheduleType"
                            value={type}
                            checked={form.scheduleType === type}
                            onChange={handleChange}
                            className="w-4 h-4 text-purple-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Recurrence Details (for templates) */}
                  {form.isTemplate && form.scheduleType !== "one-time" && (
                    <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Recurrence Settings</p>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Time of Day (24h format) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={form.recurrence.timeOfDay}
                          onChange={(e) => handleRecurrenceChange("timeOfDay", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                        {errors.recurrence_timeOfDay && <p className="text-red-500 text-xs mt-1">{errors.recurrence_timeOfDay}</p>}
                      </div>

                      {form.scheduleType === "weekly" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Days of Week <span className="text-red-500">*</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {daysOfWeek.map((day, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleDayOfWeekToggle(idx)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                  form.recurrence.daysOfWeek.includes(idx)
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                          {errors.recurrence_daysOfWeek && <p className="text-red-500 text-xs mt-1">{errors.recurrence_daysOfWeek}</p>}
                        </div>
                      )}

                      {form.scheduleType === "monthly" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Day of Month <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={form.recurrence.dayOfMonth || ""}
                            onChange={(e) => handleRecurrenceChange("dayOfMonth", parseInt(e.target.value) || null)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 15"
                          />
                          {errors.recurrence_dayOfMonth && <p className="text-red-500 text-xs mt-1">{errors.recurrence_dayOfMonth}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* One-time Test Schedule */}
                  {!form.isTemplate && form.scheduleType === "one-time" && (
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
                  )}

                  {/* Duration & Max Attempts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!form.hasSections && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Clock className="inline w-4 h-4 mr-1" />
                          Duration (minutes) {!form.hasSections && <span className="text-red-500">*</span>}
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
                    )}

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
                      {errors.maxAttempts && (
                        <p className="text-red-500 text-xs mt-1">{errors.maxAttempts}</p>
                      )}
                    </div>
                  </div>

                  {/* Negative Marks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Negative Marks
                    </label>
                    <input
                      type="number"
                      name="negativeMarks"
                      value={form.negativeMarks}
                      onChange={handleChange}
                      step="0.25"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Marks deducted per wrong answer (0 = no negative marking)</p>
                  </div>
                </div>
              </div>

              {/* Section Test Toggle */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-purple-500" />
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Test Structure</h2>
                  </div>
                </div>
                <div className="p-6">
                  <label className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <input
                      type="checkbox"
                      name="hasSections"
                      checked={form.hasSections}
                      onChange={handleChange}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Sectional Test</p>
                      <p className="text-xs text-gray-500">Divide test into multiple timed sections</p>
                    </div>
                  </label>

                  {/* Sections Builder */}
                  {form.hasSections && (
                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sections</h3>
                        <button
                          type="button"
                          onClick={addSection}
                          className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700"
                        >
                          <Plus size={16} />
                          <span>Add Section</span>
                        </button>
                      </div>
                      
                      {errors.sections && <p className="text-red-500 text-xs">{errors.sections}</p>}
                      
                      {form.sections.map((section, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Section {idx + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeSection(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Section Title <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={section.title}
                                onChange={(e) => handleSectionChange(idx, "title", e.target.value)}
                                placeholder="e.g., Quantitative Aptitude"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 dark:text-white ${
                                  errors[`section_${idx}_title`] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                              />
                              {errors[`section_${idx}_title`] && <p className="text-red-500 text-xs mt-1">{errors[`section_${idx}_title`]}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Duration (minutes) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                value={section.duration}
                                onChange={(e) => handleSectionChange(idx, "duration", parseInt(e.target.value) || 0)}
                                min="1"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 dark:text-white ${
                                  errors[`section_${idx}_duration`] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                              />
                              {errors[`section_${idx}_duration`] && <p className="text-red-500 text-xs mt-1">{errors[`section_${idx}_duration`]}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {form.sections.length === 0 && (
                        <p className="text-center text-gray-500 text-sm py-4">No sections added. Click "Add Section" to create one.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Test Type Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-purple-500" />
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Question Source</h2>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="mt-4">
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
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subjects to Include <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {subjects.map(subject => (
                          <label key={subject._id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <input
                              type="checkbox"
                              checked={form.subjects.includes(subject._id)}
                              onChange={() => handleSubjectToggle(subject._id)}
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

              {/* Summary Card */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {form.isTemplate ? "Template Creation" : "Next Steps After Creation"}
                    </h3>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                      {form.isTemplate ? (
                        <>
                          <li>• Template will be used to generate scheduled test instances</li>
                          <li>• Use "Generate from Template" to create daily/weekly/monthly tests</li>
                          <li>• Questions can be added to template before generating instances</li>
                        </>
                      ) : (
                        <>
                          <li>• You'll be redirected to add questions to this test</li>
                          <li>• Select questions from your question bank</li>
                          <li>• Set question order or shuffle if enabled</li>
                          <li>• Review and publish the test</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>
                    {form.parentTest
                      ? "Generate Test Instance"
                      : form.isTemplate
                      ? "Create Template"
                      : "Create Test & Continue"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
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