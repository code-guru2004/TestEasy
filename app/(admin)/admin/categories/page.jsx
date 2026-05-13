"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Layers,
  BookOpen,
  TrendingUp,
  Tag,
  MapPin,
  MoreVertical,
  Archive,
  EyeOff,
  Globe,
  Loader
} from "lucide-react";
import AdminHeader from "../../../../components/admin/AdminHeader";

export default function CategoriesListPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchCategories();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showNotification("error", "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    
    setDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${selectedCategory._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      showNotification("success", "Category deleted successfully!");
      fetchCategories();
      setShowDeleteModal(false);
      setSelectedCategory(null);
      
    } catch (error) {
      console.error("Error deleting category:", error);
      showNotification("error", error.response?.data?.message || "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusToggle = async (category) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${category._id}`,
        { isActive: !category.isActive },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      showNotification("success", `Category ${!category.isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchCategories();
      
    } catch (error) {
      console.error("Error updating category status:", error);
      showNotification("error", "Failed to update category status");
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && category.isActive) ||
                         (statusFilter === "inactive" && !category.isActive);
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const getIconComponent = (iconName) => {
    switch(iconName) {
      case 'FolderTree': return FolderTree;
      case 'Layers': return Layers;
      case 'BookOpen': return BookOpen;
      case 'TrendingUp': return TrendingUp;
      case 'Tag': return Tag;
      case 'MapPin': return MapPin;
      default: return FolderTree;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ">
      <AdminHeader 
        showBackButton={true}
        showDashboardButton={true}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
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

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl">
                  <FolderTree className="text-white" size={28} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Categories
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-14">
                Manage categories to organize subjects and topics
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/categories/create")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all hover:scale-105 shadow-lg"
            >
              <Plus size={20} />
              <span>Create Category</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center space-x-2"
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
              
              <button
                onClick={fetchCategories}
                className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center space-x-2"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="animate-spin text-purple-600" size={48} />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FolderTree size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Categories Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? "No categories match your search criteria" : "Get started by creating your first category"}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => router.push("/admin/categories/create")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
              >
                Create Category
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <div
                    key={category._id}
                    className={`group bg-white dark:bg-gray-800 rounded-xl shadow-lg border transition-all hover:shadow-xl hover:scale-105 ${
                      category.isActive 
                        ? "border-gray-200 dark:border-gray-700" 
                        : "border-red-200 dark:border-red-800 opacity-75"
                    }`}
                  >
                    {/* Card Header */}
                    <div 
                      className="h-32 rounded-t-xl relative overflow-hidden"
                      style={{ backgroundColor: category.colorCode }}
                    >
                      <div className="absolute inset-0 bg-black opacity-10"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between">
                          <IconComponent className="text-white" size={40} />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/admin/categories/edit/${category._id}`)}
                              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white"
                              title="Edit Category"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusToggle(category)}
                              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white"
                              title={category.isActive ? "Deactivate" : "Activate"}
                            >
                              {category.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCategory(category);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 bg-white/20 hover:bg-red-500/50 rounded-lg transition text-white"
                              title="Delete Category"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {category.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span 
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: category.colorCode }}
                            ></span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Order: {category.order}
                            </span>
                            {!category.isActive && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between text-sm">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {category.subjects?.length || 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Subjects</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {category.totalTopics || 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Topics</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {category.totalQuestions || 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/categories/${category._id}`)}
                          className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium flex items-center justify-center space-x-1"
                        >
                          <Eye size={14} />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => router.push(`/admin/categories/edit/${category._id}`)}
                          className="flex-1 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition text-sm font-medium flex items-center justify-center space-x-1"
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition ${
                        currentPage === page
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                          : "border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </nav>
              </div>
            )}

            {/* Results Info */}
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCategories.length)} of {filteredCategories.length} categories
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 animate-slide-down">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                  <Trash2 className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Category</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedCategory.name}</span>? 
                This action cannot be undone and may affect associated subjects and topics.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCategory(null);
                  }}
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