"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Layers,
  Sparkles,
  Calendar,
  User
} from "lucide-react";

export default function SubjectsListPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    fetchSubjects();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl">
                  <BookOpen className="text-white" size={28} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Subjects
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-14">
                Manage your subject categories
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/subjects/create")}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus size={18} />
              <span>Create Subject</span>
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
            notification.type === "success" 
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
          }`}>
            {notification.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="flex-1">{notification.message}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Subjects Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No subjects found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? "Try a different search term" : "Create your first subject to get started"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push("/admin/subjects/create")}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                Create Subject
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <div
                key={subject._id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <BookOpen className="text-white" size={24} />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/admin/subjects/${subject._id}/edit`)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition text-white"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this subject?")) {
                            // Delete logic here
                          }
                        }}
                        className="p-2 rounded-lg bg-white/20 hover:bg-red-500/80 transition text-white"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {subject.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{new Date(subject.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full ${
                      subject.isActive 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {subject.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
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