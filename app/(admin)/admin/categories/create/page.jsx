"use client";

import { useState } from "react";
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
  Image as ImageIcon,
  Palette,
  MapPin,
  TrendingUp,
  Plus,
  Tag,
  BookOpen
} from "lucide-react";

export default function CreateCategoryPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [isImageChanged, setIsImageChanged] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: 0,
    icon: "FolderTree",
    colorCode: "#3B82F6",
    imageUrl: ""
  });
  
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  // Predefined color options
  const colorOptions = [
    { value: "#3B82F6", name: "Blue", class: "bg-blue-500" },
    { value: "#10B981", name: "Green", class: "bg-green-500" },
    { value: "#F59E0B", name: "Amber", class: "bg-amber-500" },
    { value: "#EF4444", name: "Red", class: "bg-red-500" },
    { value: "#8B5CF6", name: "Purple", class: "bg-purple-500" },
    { value: "#EC4899", name: "Pink", class: "bg-pink-500" },
    { value: "#06B6D4", name: "Cyan", class: "bg-cyan-500" },
    { value: "#6366F1", name: "Indigo", class: "bg-indigo-500" },
    { value: "#14B8A6", name: "Teal", class: "bg-teal-500" },
    { value: "#F97316", name: "Orange", class: "bg-orange-500" }
  ];

  // Predefined icon options
  const iconOptions = [
    { value: "FolderTree", label: "Folder Tree", icon: FolderTree },
    { value: "Layers", label: "Layers", icon: Layers },
    { value: "BookOpen", label: "Book Open", icon: BookOpen },
    { value: "TrendingUp", label: "Trending Up", icon: TrendingUp },
    { value: "Tag", label: "Tag", icon: Tag },
    { value: "MapPin", label: "Map Pin", icon: MapPin }
  ];

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

  const validateForm = () => {
    if (!formData.name.trim()) {
      showNotification("error", "Category name is required");
      return false;
    }

    if (formData.name.length < 2) {
      showNotification("error", "Category name must be at least 2 characters");
      return false;
    }

    if (formData.name.length > 50) {
      showNotification("error", "Category name must be less than 50 characters");
      return false;
    }

    if (!formData.colorCode) {
      showNotification("error", "Please select a color for the category");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    if (image && isImageChanged) {
      await handleUpload();
    }
    
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
        {
          name: formData.name,
          description: formData.description || undefined,
          order: formData.order,
          icon: formData.icon,
          colorCode: formData.colorCode,
          imageUrl: uploadedUrl || formData.imageUrl || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showNotification("success", "Category created successfully!");

      setTimeout(() => {
        setFormData({
          name: "",
          description: "",
          order: 0,
          icon: "FolderTree",
          colorCode: "#3B82F6",
          imageUrl: ""
        });
        setImage(null);
        setUploadedUrl("");
        setLoading(false);

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/admin/categories");
        }, 1500);
      }, 2000);

    } catch (error) {
      console.error("Error creating category:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to create category"
      );
      setLoading(false);
    }
  };

  const SelectedIcon = iconOptions.find(opt => opt.value === formData.icon)?.icon || FolderTree;

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
            <span>Back to Categories</span>
          </button>

          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl">
                  <FolderTree className="text-white" size={28} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Category
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-14">
                Create categories to organize subjects for different exam sections
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

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
            <div className="flex items-center space-x-2">
              <Layers className="text-white" size={20} />
              <h2 className="text-white font-semibold text-lg">Category Information</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Category Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  placeholder="e.g., Quantitative Aptitude, Reasoning, General Knowledge"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.name.length}/50 characters
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This will be the main category grouping for subjects
              </p>
            </div>

            {/* Description */}
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
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Describe what this category covers and its importance in exams..."
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Display Order & Icon */}
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
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Lower numbers appear first in the list
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Icon
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <SelectedIcon size={18} className="text-gray-400" />
                  </div>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition appearance-none cursor-pointer"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Category Color <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, colorCode: color.value }))}
                    className={`w-10 h-10 rounded-full ${color.class} transition-all ${
                      formData.colorCode === color.value
                        ? "ring-4 ring-offset-2 ring-purple-500 scale-110"
                        : "hover:scale-105"
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Palette size={14} className="text-gray-400" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Selected color will be used for category badges and accents
                </p>
              </div>
            </div>

            {/* Category Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category Image <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                  {image ? (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Category"
                      className="w-full h-full object-cover"
                    />
                  ) : uploadedUrl ? (
                    <img
                      src={uploadedUrl}
                      alt="Category"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <ImageIcon size={32} />
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
            {formData.name && (
              <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Preview</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: formData.colorCode }}
                  >
                    <SelectedIcon className="text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-lg">
                        {formData.name}
                      </p>
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: formData.colorCode }}
                      >
                        {formData.order}
                      </span>
                    </div>
                    {formData.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {formData.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Subjects: 0
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Topics: 0
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
                    <span>Create Category</span>
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
                Category Best Practices
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Create categories for major exam sections (Quant, Reasoning, English, GK)</li>
                <li>• Choose distinct colors for better visual identification</li>
                <li>• Set display order to reflect exam importance or logical sequence</li>
                <li>• Categories help organize subjects and improve navigation</li>
                <li>• Add a meaningful description to help students understand the category scope</li>
                <li>• You can always edit categories later from the categories list</li>
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