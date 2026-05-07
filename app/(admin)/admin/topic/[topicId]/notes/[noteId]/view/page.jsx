"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Eye,
  FileText,
  Link as LinkIcon,
  Video,
  File,
  FileText as FileDoc,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Printer,
  Share2,
  BookOpen,
  User,
  Tag,
  ChevronRight,
  ChevronLeft,
  Flag,
  Heart
} from "lucide-react";

export default function ViewNotePage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useSelector((state) => state.auth);
  const topicId = params.topicId;
  const noteId = params.noteId;

  const [note, setNote] = useState(null);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [allNotes, setAllNotes] = useState([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);

  useEffect(() => {
    if (noteId) {
      fetchNoteDetails();
      fetchAllNotes();
    }
  }, [noteId]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const fetchNoteDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setNote(response.data.data);
        
        if (response.data.data.topic) {
          fetchTopicDetails(response.data.data.topic._id || response.data.data.topic);
        }
      }
    } catch (error) {
      console.error("Error fetching note:", error);
      showNotification("error", "Failed to load note");
    }
  };

  const fetchTopicDetails = async (topicId) => {
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
      console.error("Error fetching topic:", error);
    }
  };

  const fetchAllNotes = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes?topicId=${topicId}&limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        const notesList = response.data.data;
        setAllNotes(notesList);
        const index = notesList.findIndex(n => n._id === noteId);
        setCurrentNoteIndex(index);
      }
    } catch (error) {
      console.error("Error fetching notes list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!confirm(`Are you sure you want to delete "${note?.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        showNotification("success", "Note deleted successfully!");
        setTimeout(() => {
          router.push(`/admin/topic/${topicId}/content`);
        }, 1500);
      }
    } catch (err) {
      showNotification("error", err.response?.data?.message || "Failed to delete note");
    }
  };

  const handleEditNote = () => {
    router.push(`/admin/topic/${topicId}/notes/${noteId}/edit`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: note?.title,
        text: note?.importantNotes,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showNotification("success", "Link copied to clipboard!");
    }
  };

  const navigateToNextNote = () => {
    if (currentNoteIndex < allNotes.length - 1) {
      const nextNote = allNotes[currentNoteIndex + 1];
      router.push(`/admin/topic/${topicId}/notes/${nextNote._id}`);
    }
  };

  const navigateToPrevNote = () => {
    if (currentNoteIndex > 0) {
      const prevNote = allNotes[currentNoteIndex - 1];
      router.push(`/admin/topic/${topicId}/notes/${prevNote._id}`);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video size={18} />;
      case 'document':
        return <File size={18} />;
      case 'pdf':
        return <FileDoc size={18} />;
      default:
        return <LinkIcon size={18} />;
    }
  };

  // Function to process HTML content and add proper styling
  const processContent = (content) => {
    if (!content) return '<p class="text-gray-500 italic">No content available</p>';
    
    // Replace mark tags with styled spans
    let processed = content.replace(
      /<mark data-color="([^"]+)" style="([^"]+)">(.*?)<\/mark>/gi,
      '<span class="highlight" style="$2">$3</span>'
    );
    
    return processed;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Note Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The note you're looking for doesn't exist.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Topic</span>
            </button>
            
            <div className="flex items-center gap-2">
              {allNotes.length > 1 && (
                <div className="flex gap-1 mr-2">
                  <button
                    onClick={navigateToPrevNote}
                    disabled={currentNoteIndex <= 0}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous Note"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={navigateToNextNote}
                    disabled={currentNoteIndex >= allNotes.length - 1}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next Note"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
              
              <button
                onClick={handlePrint}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors"
                title="Print Note"
              >
                <Printer size={18} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors"
                title="Share Note"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={handleEditNote}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={18} />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handleDeleteNote}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          <span className="cursor-pointer hover:text-purple-600" onClick={() => router.push('/subjects')}>
            Subjects
          </span>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="cursor-pointer hover:text-purple-600" onClick={() => router.push(`/subjects/${topic?.subject?._id}/topics`)}>
            {topic?.subject?.name || 'Topics'}
          </span>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="cursor-pointer hover:text-purple-600" onClick={() => router.push(`/topics/${topicId}/content`)}>
            {topic?.name || 'Topic'}
          </span>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="text-gray-700 dark:text-gray-300">{note.title}</span>
        </div>

        {/* Note Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className={`px-3 py-1 text-sm rounded-full ${
                note.isPublished 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {note.isPublished ? 'Published' : 'Draft'}
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                Version {note.version}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {note.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen size={16} />
                <span>Topic: {topic?.name || 'Loading...'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes Section */}
        {note.importantNotes && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Flag className="text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                  Important Notes & Key Takeaways
                </h3>
                <p className="text-yellow-700 dark:text-yellow-400 whitespace-pre-wrap">
                  {note.importantNotes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content with Enhanced Styling */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-8">
            <div 
              className="note-content prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: processContent(note.content || '<p class="text-gray-500 italic">No content available</p>')
              }} 
            />
          </div>
        </div>

        {/* Resources Section */}
        {note.resources && note.resources.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <LinkIcon size={22} />
                Additional Resources ({note.resources.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {note.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex-shrink-0">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {resource.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </p>
                    </div>
                    <ExternalLink size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Note ID:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-xs">{note._id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Topic ID:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-xs">{topicId}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {new Date(note.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {new Date(note.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        {allNotes.length > 1 && (
          <div className="mt-6 flex justify-between gap-4">
            <button
              onClick={navigateToPrevNote}
              disabled={currentNoteIndex <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
              Previous Note
            </button>
            <button
              onClick={navigateToNextNote}
              disabled={currentNoteIndex >= allNotes.length - 1}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next Note
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        {allNotes.length > 1 && (
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Note {currentNoteIndex + 1} of {allNotes.length}
          </div>
        )}
      </div>

      {/* Global Styles for Rich Text Content */}
      <style jsx global>{`
        /* Note Content Styling */
        .note-content {
          line-height: 1.8;
          color: #1a1a1a;
        }
        
        .dark .note-content {
          color: #e5e5e5;
        }
        
        /* Headings */
        .note-content h1 {
          font-size: 2.5em;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.3em;
        }
        
        .note-content h2 {
          font-size: 2em;
          font-weight: 600;
          margin-top: 1.2em;
          margin-bottom: 0.4em;
        }
        
        .note-content h3 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.3em;
        }
        
        .note-content h4 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 0.8em;
          margin-bottom: 0.2em;
        }
        
        /* Links */
        .note-content a {
          color: #3b82f6;
          text-decoration: underline;
          transition: color 0.2s;
        }
        
        .note-content a:hover {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .dark .note-content a {
          color: #60a5fa;
        }
        
        .dark .note-content a:hover {
          color: #93c5fd;
        }
        
        /* Lists */
        .note-content ul {
          list-style-type: disc;
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .note-content ol {
          list-style-type: decimal;
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .note-content li {
          margin: 0.5em 0;
          line-height: 1.6;
        }
        
        .note-content ul ul,
        .note-content ol ul,
        .note-content ul ol,
        .note-content ol ol {
          margin: 0.5em 0;
        }
        
        /* Code Blocks */
        .note-content code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #dc2626;
        }
        
        .dark .note-content code {
          background-color: #374151;
          color: #fca5a5;
        }
        
        .note-content pre {
          background-color: #1f2937;
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1em 0;
        }
        
        .note-content pre code {
          background-color: transparent;
          color: #e5e7eb;
          padding: 0;
          font-size: 0.9em;
          display: block;
        }
        
        /* Blockquotes */
        .note-content blockquote {
          border-left: 4px solid #8b5cf6;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .dark .note-content blockquote {
          color: #9ca3af;
          border-left-color: #a78bfa;
        }
        
        /* Text Formatting */
        .note-content strong {
          font-weight: 700;
          color: #111827;
        }
        
        .dark .note-content strong {
          color: #f9fafb;
        }
        
        .note-content em {
          font-style: italic;
        }
        
        .note-content u {
          text-decoration: underline;
        }
        
        .note-content s {
          text-decoration: line-through;
        }
        
        /* Highlights */
        .note-content .highlight,
        .note-content mark {
          background-color: #fef08a;
          padding: 0 0.2em;
          border-radius: 3px;
          color: #1a1a1a;
        }
        
        .dark .note-content .highlight,
        .dark .note-content mark {
          background-color: #854d0e;
          color: #fef08a;
        }
        
        /* Superscript and Subscript */
        .note-content sup {
          vertical-align: super;
          font-size: smaller;
        }
        
        .note-content sub {
          vertical-align: sub;
          font-size: smaller;
        }
        
        /* Text Alignment */
        .note-content [style*="text-align: center"] {
          text-align: center;
        }
        
        .note-content [style*="text-align: right"] {
          text-align: right;
        }
        
        .note-content [style*="text-align: left"] {
          text-align: left;
        }
        
        /* Tables */
        .note-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        
        .note-content th,
        .note-content td {
          border: 1px solid #e5e7eb;
          padding: 0.5em;
          text-align: left;
        }
        
        .dark .note-content th,
        .dark .note-content td {
          border-color: #374151;
        }
        
        .note-content th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        
        .dark .note-content th {
          background-color: #374151;
        }
        
        /* Images */
        .note-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }
        
        /* Horizontal Rule */
        .note-content hr {
          margin: 2em 0;
          border: none;
          border-top: 2px solid #e5e7eb;
        }
        
        .dark .note-content hr {
          border-top-color: #374151;
        }
        
        /* Print Styles */
        @media print {
          .sticky {
            position: relative !important;
          }
          button {
            display: none !important;
          }
          .bg-yellow-50, .bg-white, .bg-gray-50 {
            background-color: white !important;
            border: 1px solid #ddd !important;
          }
          body {
            background: white !important;
          }
          .note-content {
            color: black !important;
          }
          .note-content a {
            color: blue !important;
          }
          .note-content pre {
            background-color: #f5f5f5 !important;
            border: 1px solid #ddd !important;
          }
          .note-content blockquote {
            border-left-color: #666 !important;
          }
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .note-content h1 {
            font-size: 2em;
          }
          .note-content h2 {
            font-size: 1.5em;
          }
          .note-content h3 {
            font-size: 1.25em;
          }
          .note-content pre {
            font-size: 0.8em;
          }
        }
      `}</style>
    </div>
  );
}