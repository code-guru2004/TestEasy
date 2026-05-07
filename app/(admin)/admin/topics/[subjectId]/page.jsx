"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Layers,
  Calendar,
  ArrowLeft,
  FileText,
  Clock,
  Eye,
  ChevronRight,
  Hash,
  List,
  X
} from "lucide-react";

export default function TopicsListPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useSelector((state) => state.auth);
  const subjectId = params.subjectId;
  
  const [topics, setTopics] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  
  // Notes dialog state
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  useEffect(() => {
    if (subjectId) {
      fetchTopics();
      fetchSubjectDetails();
    }
  }, [subjectId]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const fetchSubjectDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/${subjectId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setSubject(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching subject details:", error);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/topics/subject/${subjectId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTopics(response.data.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
      showNotification("error", "Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes for a specific topic
  const fetchNotesForTopic = async (topicId) => {
    setLoadingNotes(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes?topicId=${topicId}&limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setNotes(response.data.data);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Open notes dialog for a topic
  const openNotesDialog = async (topic, e) => {
    e.stopPropagation();
    setSelectedTopic(topic);
    setShowNotesDialog(true);
    await fetchNotesForTopic(topic._id);
  };

  // Handle delete note
  const handleDeleteNote = async (noteId, noteTitle) => {
    if (!confirm(`Are you sure you want to delete "${noteTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingNoteId(noteId);
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Remove note from list
        setNotes(notes.filter(note => note._id !== noteId));
        showNotification("success", "Note deleted successfully!");
        
        // Refresh topics list to update note counts
        await fetchTopics();
      }
    } catch (err) {
      showNotification("error", err.response?.data?.message || "Failed to delete note");
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleEditTopic = (topicId, e) => {
    e.stopPropagation();
    router.push(`/admin/topic/${topicId}/edit`);
  };

  const handleDeleteTopic = async (topicId, topicName, e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${topicName}"?`)) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/topics/${topicId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        showNotification("success", "Topic deleted successfully");
        fetchTopics(); // Refresh the list
      } catch (error) {
        console.error("Error deleting topic:", error);
        showNotification("error", "Failed to delete topic");
      }
    }
  };

  const handleTopicClick = (topicId) => {
    router.push(`/admin/topic/${topicId}`);
  };

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (isActive) => {
    return isActive 
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-4 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Subjects</span>
          </button>

          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl">
                  <Layers className="text-white" size={28} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Topics
                </h1>
              </div>
              {subject && (
                <div className="ml-14">
                  <p className="text-gray-600 dark:text-gray-400">
                    Managing topics for: 
                    <span className="font-semibold text-purple-600 dark:text-purple-400 ml-1">
                      {subject.name}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => router.push(`/admin/topics/create?subjectId=${subjectId}`)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus size={18} />
              <span>Create Topic</span>
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
            notification.type === "success" 
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : notification.type === "info"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
          }`}>
            {notification.type === "success" ? (
              <CheckCircle size={20} />
            ) : notification.type === "info" ? (
              <AlertCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="flex-1">{notification.message}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Topics</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{topics.length}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <FileText className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Active Topics</p>
                <p className="text-2xl font-bold text-green-600">{topics.filter(t => t.isActive).length}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <Eye className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Ordered Topics</p>
                <p className="text-2xl font-bold text-blue-600">{topics.filter(t => t.order > 0).length}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <Hash className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Topics Table */}
        {filteredTopics.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No topics found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? "Try a different search term" : "Create your first topic to get started"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push(`/admin/topics/create?subjectId=${subjectId}`)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                Create Topic
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Topic Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTopics.map((topic, index) => (
                    <tr
                      key={topic._id}
                      onClick={() => handleTopicClick(topic._id)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <FileText size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {topic.name}
                            </p>
                            {topic.summary && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                {topic.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(topic.isActive)}`}>
                          {topic.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => openNotesDialog(topic, e)}
                          className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        >
                          <List size={14} />
                          <span className="text-sm font-medium">View Notes</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Hash size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {topic.order || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(topic.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handleEditTopic(topic._id, e)}
                            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            title="Edit Topic"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteTopic(topic._id, topic.name, e)}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            title="Delete Topic"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTopicClick(topic._id);
                            }}
                            className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                            title="View Topic"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Info */}
        {filteredTopics.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredTopics.length} of {topics.length} topics
          </div>
        )}
      </div>

      {/* Notes Dialog Modal */}
      {showNotesDialog && selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Dialog Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notes for Topic</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedTopic.name}
                </p>
              </div>
              <button
                onClick={() => setShowNotesDialog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingNotes ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notes found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Get started by creating a new note for this topic.
                  </p>
                  <button
                    onClick={() => {
                      setShowNotesDialog(false);
                      router.push(`/topics/${selectedTopic._id}/notes/create`);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus size={16} className="mr-2" />
                    Create New Note
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div
                      key={note._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {note.title}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              note.isPublished 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            }`}>
                              {note.isPublished ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              v{note.version}
                            </span>
                          </div>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <div 
                              className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2"
                              dangerouslySetInnerHTML={{ 
                                __html: note.content?.substring(0, 200) + (note.content?.length > 200 ? '...' : '') || 'No content' 
                              }}
                            />
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              Created: {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              Updated: {new Date(note.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          {note.importantNotes && (
                            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">Important Notes:</p>
                              <p className="text-xs text-yellow-700 dark:text-yellow-400 line-clamp-1">
                                {note.importantNotes}
                              </p>
                            </div>
                          )}
                          {note.resources && note.resources.length > 0 && (
                            <div className="mt-2 flex items-center gap-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                📎 {note.resources.length} resource(s)
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setShowNotesDialog(false);
                              router.push(`/topics/${selectedTopic._id}/notes/${note._id}/edit`);
                            }}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note._id, note.title)}
                            disabled={deletingNoteId === note._id}
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingNoteId === note._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-between items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowNotesDialog(false);
                  router.push(`/topics/${selectedTopic._id}/notes/create`);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Create New Note
              </button>
              <button
                onClick={() => setShowNotesDialog(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
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