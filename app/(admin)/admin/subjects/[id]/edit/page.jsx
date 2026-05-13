"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Calendar,
  FolderTree,
  TrendingUp,
  Edit3,
  Trash2,
  Loader
} from "lucide-react";

export default function EditSubjectPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    category: "",
    order: 0,
    difficultyLevel: "Beginner",
    examMapping: [],
    isActive: true
  });
  
  const [image, setImage] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isImageChanged, setIsImageChanged] = useState(false);
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

  // Fetch subject data and categories on component mount
  useEffect(() => {
    if (id) {
      fetchSubjectData();
      fetchCategories();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showNotification("error", "Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSubjectData = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const subject = response.data.data;
      console.log(subject)
      setFormData({
        name: subject.name || "",
        description: subject.description || "",
        imageUrl: subject.imageUrl || "",
        category: subject.category?._id || subject.category || "",
        order: subject.order || 0,
        difficultyLevel: subject.difficultyLevel || "Beginner",
        examMapping: subject.examMapping || [],
        isActive: subject.isActive !== undefined ? subject.isActive : true
      });
      
      setUploadedUrl(subject.imageUrl || "");
      
      // Set selected exams based on examMapping
      if (subject.examMapping && subject.examMapping.length > 0) {
        const exams = subject.examMapping.map(e => e.exam);
        setSelectedExams(exams);
      }
      
    } catch (error) {
      console.error("Error fetching subject:", error);
      showNotification("error", error.response?.data?.message || "Failed to load subject data");
      
      // Redirect if subject not found
      setTimeout(() => {
        router.push("/admin/subjects");
      }, 2000);
    } finally {
      setFetchingData(false);
    }
  };

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

  const handleExamMappingChange = (examValue, field, value) => {
    setFormData(prev => {
      const existingIndex = prev.examMapping.findIndex(e => e.exam === examValue);
      let newExamMapping = [...prev.examMapping];
      
      if (existingIndex >= 0) {
        newExamMapping[existingIndex] = {
          ...newExamMapping[existingIndex],
          [field]: value
        };
      } else {
        newExamMapping.push({
          exam: examValue,
          weightage: field === 'weightage' ? value : 0,
          important: field === 'important' ? value : false
        });
      }
      
      return { ...prev, examMapping: newExamMapping };
    });
  };

  const addExamToSubject = (examValue) => {
    if (!selectedExams.includes(examValue)) {
      setSelectedExams([...selectedExams, examValue]);
      setFormData(prev => ({
        ...prev,
        examMapping: [
          ...prev.examMapping,
          { exam: examValue, weightage: 0, important: false }
        ]
      }));
    }
  };

  const removeExamFromSubject = (examValue) => {
    setSelectedExams(selectedExams.filter(e => e !== examValue));
    setFormData(prev => ({
      ...prev,
      examMapping: prev.examMapping.filter(e => e.exam !== examValue)
    }));
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

    if (!formData.category) {
      showNotification("error", "Please select a category");
      return false;
    }

    return true;
  };

  // Handle upload image to cloudinary
  const handleUpload = async () => {
    if (!image) return;
  
    setUploading(true);
  
    const uploadData = new FormData();
    uploadData.append("file", image);
  
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
  
      const data = await res.json();
  
      if (data.url) {
        setUploadedUrl(data.url);
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        setIsImageChanged(false);
        showNotification("success", "Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification("error", "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    if (image && isImageChanged) {
      await handleUpload();
    }
    
    setLoading(true);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/update/${id}`,
        {
          name: formData.name,
          description: formData.description || undefined,
          imageUrl: uploadedUrl || formData.imageUrl || undefined,
          category: formData.category,
          order: formData.order,
          difficultyLevel: formData.difficultyLevel,
          examMapping: formData.examMapping.filter(e => e.weightage > 0 || e.important),
          isActive: formData.isActive
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showNotification("success", "Subject updated successfully!");

      setTimeout(() => {
        router.push("/admin/subjects");
      }, 1500);

    } catch (error) {
      console.error("Error updating subject:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to update subject"
      );
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      showNotification("success", "Subject deleted successfully!");
      
      setTimeout(() => {
        router.push("/admin/subjects");
      }, 1500);
      
    } catch (error) {
      console.error("Error deleting subject:", error);
      showNotification("error", error.response?.data?.message || "Failed to delete subject");
      setShowDeleteModal(false);
      setDeleting(false);
    }
  };

  const getSelectedCategoryName = () => {
    const category = categories.find(c => c._id === formData.category);
    return category ? category.name : "";
  };

  const getSelectedCategoryColor = () => {
    const category = categories.find(c => c._id === formData.category);
    return category ? category.colorCode : "#6366F1";
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-purple-600" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Loading subject data...</p>
        </div>
      </div>
    );
  }

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
                  <Edit3 className="text-white" size={28} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Edit Subject
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-14">
                Update subject details and configuration
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow-sm transition flex items-center space-x-2"
            >
              <Trash2 size={16} className="text-white" />
              <span className="text-white text-sm font-medium">Delete Subject</span>
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 animate-slide-down ${notification.type === "success"
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

        {/* Status Banner */}
        {formData.isActive === false && (
          <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl border border-yellow-200 dark:border-yellow-800 flex items-center space-x-3">
            <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400" />
            <span className="text-yellow-700 dark:text-yellow-300">
              This subject is currently inactive. Students cannot see or access it.
            </span>
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
            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Subject Status</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Control whether this subject is visible to students
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  formData.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FolderTree size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition appearance-none"
                  disabled={loadingCategories}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                  </div>
                )}
              </div>
              {formData.category && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Subject is grouped under: <span className="font-semibold" style={{ color: getSelectedCategoryColor() }}>{getSelectedCategoryName()}</span>
                </p>
              )}
            </div>

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
                  placeholder="e.g., Arithmetic, Algebra, Geometry"
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

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Difficulty Level
              </label>
              <div className="relative">
                <TrendingUp size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Order */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Display Order
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  placeholder="0"
                  min="0"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Lower numbers appear first in the list
              </p>
            </div>

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
                        onClick={() => addExamToSubject(exam.value)}
                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center space-x-1"
                      >
                        <Plus size={14} />
                        <span>{exam.label}</span>
                      </button>
                    ))}
                </div>

                {/* Selected Exams with Weightage */}
                {selectedExams.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Configure Exam Details:</p>
                    {selectedExams.map((examValue) => {
                      const exam = availableExams.find(e => e.value === examValue);
                      const examData = formData.examMapping.find(e => e.exam === examValue);
                      return (
                        <div key={examValue} className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                          <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${exam.color}`}>
                              {exam.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeExamFromSubject(examValue)}
                              className="text-red-500 hover:text-red-700 transition"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Weightage (%)
                              </label>
                              <input
                                type="number"
                                value={examData?.weightage || 0}
                                onChange={(e) => handleExamMappingChange(examValue, 'weightage', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="e.g., 25"
                                min="0"
                                max="100"
                              />
                            </div>
                            <div className="flex items-center">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={examData?.important || false}
                                  onChange={(e) => handleExamMappingChange(examValue, 'important', e.target.checked)}
                                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Mark as Important for this exam</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Subject Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Subject Image <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                  {image ? (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Subject"
                      className="w-full h-full object-cover"
                    />
                  ) : uploadedUrl ? (
                    <img
                      src={uploadedUrl}
                      alt="Subject"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <BookOpen size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImage(e.target.files[0]);
                        setIsImageChanged(true);
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>{image || uploadedUrl ? "Change Image" : "Upload Image"}</span>
                  </label>
                  {(image || uploadedUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setUploadedUrl("");
                        setFormData(prev => ({ ...prev, imageUrl: "" }));
                        setIsImageChanged(true);
                      }}
                      className="ml-4 px-3 py-1 border-2 border-red-300 dark:border-red-600 rounded-xl text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-700 transition font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {/* Upload button */}
              {image && isImageChanged && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Upload Image</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            {/* Preview Card */}
            {(formData.name || formData.category || formData.difficultyLevel) && (
              <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Preview</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    {uploadedUrl ? (
                      <img src={uploadedUrl} alt="Subject" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <BookOpen className="text-white" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      {formData.name || "Subject Name"}
                    </p>
                    {formData.category && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                        Category: {getSelectedCategoryName()}
                      </p>
                    )}
                    {formData.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {formData.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      {formData.difficultyLevel && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          formData.difficultyLevel === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          formData.difficultyLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {formData.difficultyLevel}
                        </span>
                      )}
                      {selectedExams.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedExams.length} exam(s)
                        </span>
                      )}
                      {!formData.isActive && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
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
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Update Subject</span>
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
                Editing Tips
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Changes to category may affect how subjects are grouped in the UI</li>
                <li>• Inactive subjects won't appear in student-facing views</li>
                <li>• Exam mapping helps track subject importance for different competitive exams</li>
                <li>• Display order determines subject position within its category</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 animate-slide-down">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <Trash2 className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Subject</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{formData.name}</span>? 
              This action cannot be undone and will remove all associated topics and questions.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete Permanently</span>
                  </>
                )}
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