"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  BookOpen,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Layers,
  Sparkles,
  Info,
  Hash,
  Calendar
} from "lucide-react";

export default function CreateSubjectPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showNotification("error", "Subject name is required");
      return false;
    }
    
    if (formData.name.length < 2) {
      showNotification("error", "Subject name must be at least 2 characters");
      return false;
    }
    
    if (formData.name.length > 100) {
      showNotification("error", "Subject name must be less than 100 characters");
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/create`,
        {
          name: formData.name,
          description: formData.description || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      showNotification("success", "Subject created successfully!");
      
      setTimeout(() => {
        setFormData({
          name: "",
          description: ""
        });
        setLoading(false);
        
        // Optional: Redirect after 2 seconds
        setTimeout(() => {
          router.push("/admin/subjects");
        }, 1500);
      }, 2000);
      
    } catch (error) {
      console.error("Error creating subject:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to create subject"
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Subjects</span>
          </button>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl">
                  <BookOpen className="text-white" size={28} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Subject
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-14">
                Add a new subject to organize your question bank
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-lg shadow-sm">
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
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
            <div className="flex items-center space-x-2">
              <Layers className="text-white" size={20} />
              <h2 className="text-white font-semibold text-lg">Subject Information</h2>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Subject Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  placeholder="e.g., Mathematics, Physics, Biology"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.name.length}/100 characters
              </p>
            </div>

            {/* Subject Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Info size={18} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Describe what this subject covers, key topics, and learning objectives..."
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Preview Card */}
            {formData.name && (
              <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Preview</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      {formData.name}
                    </p>
                    {formData.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {formData.description}
                      </p>
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
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Create Subject</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Card */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Tips for creating effective subjects
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Use clear, concise names that reflect the subject matter</li>
                <li>• Add detailed descriptions to help students understand what they'll learn</li>
                <li>• Create subjects that align with your curriculum structure</li>
                <li>• You can always edit subjects later from the subjects list</li>
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}