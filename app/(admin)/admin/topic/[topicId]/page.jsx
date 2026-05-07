"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  BookOpen,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  FileText,
  Clock,
  Eye,
  Plus,
  Calendar,
  User,
  Tag,
  Link as LinkIcon,
  Video,
  File,
  FileText as FileDoc,
  ChevronRight,
  Layers,
  Info,
  Download,
  ExternalLink
} from "lucide-react";

export default function TopicDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useSelector((state) => state.auth);
  const topicId = params.topicId;

  const [topic, setTopic] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [expandedNote, setExpandedNote] = useState(null);

  useEffect(() => {
    if (topicId) {
      fetchTopicDetails();
      fetchNotes();
    }
  }, [topicId]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const fetchTopicDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/topics/${topicId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setTopic(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching topic details:", error);
      showNotification("error", "Failed to load topic details");
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes?topicId=${topicId}&limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setNotes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      showNotification("error", "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

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
        setNotes(notes.filter(note => note._id !== noteId));
        showNotification("success", "Note deleted successfully!");
      }
    } catch (err) {
      showNotification("error", err.response?.data?.message || "Failed to delete note");
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleEditTopic = () => {
    router.push(`/admin/topic/${topicId}/edit`);
  };

  const handleDeleteTopic = async () => {
    if (!confirm(`Are you sure you want to delete "${topic?.name}"? This will also delete all notes under this topic.`)) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/topics/${topicId}?cascadeDeleteNotes=true`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      showNotification("success", "Topic deleted successfully");
      setTimeout(() => {
        router.push(`/subjects/${topic?.subject?._id}/topics`);
      }, 1500);
    } catch (error) {
      console.error("Error deleting topic:", error);
      showNotification("error", "Failed to delete topic");
    }
  };

  const handleEditNote = (noteId) => {
    router.push(`/admin/topic/${topicId}/notes/${noteId}/edit`);
  };

  const handleCreateNote = () => {
    router.push(`/admin/topic/${topicId}/notes/create`);
  };

  const handleViewNote = (noteId) => {
    router.push(`/admin/topic/${topicId}/notes/${noteId}/view`);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video size={16} />;
      case 'document':
        return <FileDoc size={16} />;
      case 'pdf':
        return <FileText size={16} />;
      default:
        return <LinkIcon size={16} />;
    }
  };

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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading topic details...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Topic Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The topic you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
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
            <span>Back to Topics</span>
          </button>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl">
                  <Layers className="text-white" size={28} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {topic.name}
                </h1>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(topic.isActive)}`}>
                  {topic.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {topic.subject && (
                <div className="ml-14">
                  <p className="text-gray-600 dark:text-gray-400">
                    Subject: 
                    <span className="font-semibold text-purple-600 dark:text-purple-400 ml-1">
                      {topic.subject.name}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEditTopic}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={18} />
                <span>Edit Topic</span>
              </button>
              <button
                onClick={handleDeleteTopic}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={18} />
                <span>Delete Topic</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
            notification.type === "success" 
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
          }`}>
            {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="flex-1">{notification.message}</span>
          </div>
        )}

        {/* Topic Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Summary Card */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Info size={20} className="text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Summary</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {topic.summary || "No summary provided."}
            </p>
          </div>

          {/* Metadata Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Topic Details</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Order Position</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{topic.order || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Reading Time</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {topic.readTime ? `${topic.readTime} min` : 'Not specified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Notes</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{notes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Published Notes</span>
                <span className="text-sm font-medium text-green-600">{notes.filter(n => n.isPublished).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(topic.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Image */}
        {topic.imageUrl && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <img
              src={topic.imageUrl}
              alt={topic.name}
              className="w-full h-64 object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        )}

        {/* Notes Section Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={24} className="text-purple-600" />
              Notes ({notes.length})
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all learning materials for this topic
            </p>
          </div>
          <button
            onClick={handleCreateNote}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105"
          >
            <Plus size={18} />
            <span>Create New Note</span>
          </button>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notes yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first note to start adding content to this topic.
            </p>
            <button
              onClick={handleCreateNote}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Create First Note
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Note Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {note.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          note.isPublished 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {note.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Version {note.version}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Updated: {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewNote(note._id)}
                        className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 transition-colors"
                        title="View Note"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditNote(note._id)}
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 transition-colors"
                        title="Edit Note"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id, note.title)}
                        disabled={deletingNoteId === note._id}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Delete Note"
                      >
                        {deletingNoteId === note._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Note Content Preview */}
                <div className="p-6">
                  <div 
                    className={`prose prose-sm dark:prose-invert max-w-none ${
                      expandedNote === note._id ? '' : 'line-clamp-3'
                    }`}
                    dangerouslySetInnerHTML={{ 
                      __html: note.content || '<p class="text-gray-500 italic">No content available</p>'
                    }}
                  />
                  
                  {note.content && note.content.length > 300 && (
                    <button
                      onClick={() => setExpandedNote(expandedNote === note._id ? null : note._id)}
                      className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {expandedNote === note._id ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>

                {/* Important Notes */}
                {note.importantNotes && (
                  <div className="mx-6 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                      ⚡ Important Notes
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      {note.importantNotes}
                    </p>
                  </div>
                )}

                {/* Resources */}
                {note.resources && note.resources.length > 0 && (
                  <div className="px-6 pb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <LinkIcon size={14} />
                      Resources ({note.resources.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {note.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          {getResourceIcon(resource.type)}
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                            {resource.title}
                          </span>
                          <ExternalLink size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Note Footer */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Note ID: {note._id}
                  </div>
                  <button
                    onClick={() => handleViewNote(note._id)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    View Full Note
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {notes.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Showing {notes.length} note{notes.length !== 1 ? 's' : ''} • 
            {notes.filter(n => n.isPublished).length} published • 
            {notes.filter(n => !n.isPublished).length} drafts
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}