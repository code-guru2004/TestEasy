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
  AlertTriangle
} from "lucide-react";

export default function CreateTopicPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    subjectId: ""
  });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Update selected subject when subjectId changes
  useEffect(() => {
    if (formData.subjectId) {
      const subject = subjects.find(s => s._id === formData.subjectId);
      setSelectedSubject(subject);
    } else {
      setSelectedSubject(null);
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects/search`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      showNotification("error", "Failed to load subjects");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          subjectId: formData.subjectId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      showNotification("success", "Topic created successfully!");
      
      setTimeout(() => {
        setFormData({
          name: "",
          subjectId: ""
        });
        setSelectedSubject(null);
        setLoading(false);
        
        // Optional: Redirect after 2 seconds
        setTimeout(() => {
          router.push("/admin/topics/create");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Add topics under subjects to organize questions effectively
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
                  placeholder="e.g., Algebra, Calculus, Trigonometry"
                  autoFocus
                  disabled={!formData.subjectId}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.name.length}/100 characters
              </p>
            </div>

            {/* Preview Card */}
            {formData.name && selectedSubject && (
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles size={16} className="text-emerald-600" />
                  <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Preview</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <FolderTree className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      {formData.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <BookOpen size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {selectedSubject.name}
                      </span>
                    </div>
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
                <li>• Ensure topics clearly belong to their parent subject</li>
                <li>• Use consistent naming conventions across topics</li>
                <li>• Topics help students navigate and find relevant questions easily</li>
                <li>• Each question must be associated with a topic under a subject</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {subjects.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Subjects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{subjects.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">Ready to Create</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Topics Created</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">—</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <FolderTree size={20} className="text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </div>
          </div>
        )}
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