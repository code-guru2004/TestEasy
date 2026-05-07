"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  ChevronRight,
  Flag,
  Link as LinkIcon,
  Video,
  File,
  FileText as FileDoc,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  CheckCircle,
  AlertCircle,
  Printer,
  Share2,
  Download,
  FileText,
  Info
} from "lucide-react";

export default function UserViewNotePage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useSelector((state) => state.auth);
  const topicId = params.topicId;
  const noteId = params.noteId;

  const [note, setNote] = useState(null);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allNotes, setAllNotes] = useState([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  useEffect(() => {
    if (noteId) {
      fetchNoteDetails();
      fetchAllNotes();
    }
  }, [noteId]);

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
      setError("Failed to load note");
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes?topicId=${topicId}&isPublished=true&limit=100`,
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

  const navigateToNextNote = () => {
    if (currentNoteIndex < allNotes.length - 1) {
      const nextNote = allNotes[currentNoteIndex + 1];
      router.push(`/topics/${topicId}/notes/${nextNote._id}`);
    } else {
      setShowCompletionMessage(true);
      setTimeout(() => setShowCompletionMessage(false), 3000);
    }
  };

  const navigateToPrevNote = () => {
    if (currentNoteIndex > 0) {
      const prevNote = allNotes[currentNoteIndex - 1];
      router.push(`/topics/${topicId}/notes/${prevNote._id}`);
    }
  };

  const markAsComplete = () => {
    setShowCompletionMessage(true);
    setTimeout(() => setShowCompletionMessage(false), 3000);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video size={16} />;
      case 'document':
        return <File size={16} />;
      case 'pdf':
        return <FileDoc size={16} />;
      default:
        return <LinkIcon size={16} />;
    }
  };

  // Process HTML content for safe rendering
  const processContent = (content) => {
    if (!content) return '<p class="text-gray-500 italic">No content available</p>';
    
    let processed = content.replace(
      /<mark data-color="([^"]+)" style="([^"]+)">(.*?)<\/mark>/gi,
      '<span class="highlight" style="$2">$3</span>'
    );
    
    return processed;
  };

  // Generate HTML content for download
  const generateDownloadHTML = (includeImportantNotes = true) => {
    const styles = `
      <style>
        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.8;
          color: #1a1a1a;
          max-width: 900px;
          margin: 0 auto;
          padding: 40px;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #8b5cf6;
        }
        .title {
          font-size: 32px;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 10px;
        }
        .meta {
          color: #666;
          font-size: 14px;
          margin-top: 10px;
        }
        .important-notes {
          background-color: #fef9e3;
          border-left: 4px solid #fbbf24;
          padding: 20px;
          margin: 30px 0;
          border-radius: 8px;
        }
        .important-notes h3 {
          color: #92400e;
          margin-top: 0;
          font-size: 18px;
        }
        .content {
          margin: 30px 0;
        }
        .content h1 { font-size: 28px; margin-top: 30px; }
        .content h2 { font-size: 24px; margin-top: 25px; }
        .content h3 { font-size: 20px; margin-top: 20px; }
        .content p { margin: 15px 0; }
        .content ul, .content ol { margin: 15px 0; padding-left: 30px; }
        .content li { margin: 5px 0; }
        .content code {
          background: #f3f4f6;
          padding: 2px 5px;
          border-radius: 4px;
          font-family: monospace;
        }
        .content pre {
          background: #1f2937;
          color: #e5e7eb;
          padding: 15px;
          border-radius: 8px;
          overflow-x: auto;
        }
        .content blockquote {
          border-left: 4px solid #8b5cf6;
          padding-left: 20px;
          margin: 20px 0;
          font-style: italic;
          color: #666;
        }
        .resources {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        .resources h3 {
          font-size: 20px;
          margin-bottom: 15px;
        }
        .resource-item {
          margin: 10px 0;
        }
        .resource-item a {
          color: #8b5cf6;
          text-decoration: none;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        @media print {
          body {
            padding: 20px;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    `;

    let html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${note.title} - Study Note</title>
        ${styles}
      </head>
      <body>
        <div class="header">
          <div class="title">${note.title}</div>
          <div class="meta">
            Topic: ${topic?.name || 'Study Material'} | 
            Last Updated: ${new Date(note.updatedAt).toLocaleDateString()}
          </div>
        </div>
    `;

    if (includeImportantNotes && note.importantNotes) {
      html += `
        <div class="important-notes">
          <h3>📌 Key Takeaways</h3>
          <p>${note.importantNotes}</p>
        </div>
      `;
    }

    html += `
        <div class="content">
          ${note.content || '<p>No content available</p>'}
        </div>
    `;

    if (note.resources && note.resources.length > 0) {
      html += `
        <div class="resources">
          <h3>Additional Resources</h3>
          <ul>
            ${note.resources.map(resource => `
              <li class="resource-item">
                <a href="${resource.url}" target="_blank">${resource.title}</a> 
                (${resource.type})
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    html += `
        <div class="footer">
          Generated from Study Platform | ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;

    return html;
  };

  // Download as HTML
  const downloadAsHTML = () => {
    const html = generateDownloadHTML(true);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_study_note.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download as PDF (using browser print)
  const downloadAsPDF = () => {
    const originalTitle = document.title;
    document.title = `${note.title} - Study Note`;
    
    const printContent = generateDownloadHTML(true);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    document.title = originalTitle;
  };

  // Download important notes only
  const downloadImportantNotes = () => {
    if (!note.importantNotes) {
      alert("No important notes available for this topic.");
      return;
    }

    const html = generateDownloadHTML(false);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_important_notes.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      alert("Link copied to clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your study material...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 max-w-md mx-4 shadow-lg">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Note Not Found</h2>
          <p className="text-gray-600 mb-6">The study material you're looking for isn't available.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Progress Indicator Bar */}
      {allNotes.length > 1 && (
        <div className="fixed top-0 left-0 right-0 z-20">
          <div className="h-1 bg-gray-200">
            <div 
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${((currentNoteIndex + 1) / allNotes.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Topic</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              {/* Download Button with Options */}
              <div className="relative">
                <button
                  onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                  className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  title="Download"
                >
                  <Download size={18} />
                </button>
                
                {showDownloadOptions && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          downloadAsPDF();
                          setShowDownloadOptions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FileText size={16} />
                        Download as PDF
                      </button>
                      <button
                        onClick={() => {
                          downloadAsHTML();
                          setShowDownloadOptions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FileCode size={16} />
                        Download as HTML
                      </button>
                      {note.importantNotes && (
                        <button
                          onClick={() => {
                            downloadImportantNotes();
                            setShowDownloadOptions(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Info size={16} />
                          Download Important Notes Only
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handlePrint}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title="Print Note"
              >
                <Printer size={18} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title="Share Note"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Completion Message */}
        {showCompletionMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-700 font-medium">
              {currentNoteIndex === allNotes.length - 1 
                ? "🎉 Congratulations! You've completed all notes in this topic!" 
                : "✓ Great job! Keep learning!"}
            </p>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-purple-600 transition-colors" onClick={() => router.push('/dashboard')}>
            Dashboard
          </span>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="cursor-pointer hover:text-purple-600 transition-colors" onClick={() => router.push('/subjects')}>
            Subjects
          </span>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="cursor-pointer hover:text-purple-600 transition-colors" onClick={() => router.push(`/subjects/${topic?.subject?._id}/topics`)}>
            {topic?.subject?.name || 'Topics'}
          </span>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="cursor-pointer hover:text-purple-600 transition-colors" onClick={() => router.push(`/topics/${topicId}/content`)}>
            {topic?.name || 'Topic'}
          </span>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="text-gray-700 font-medium">{note.title}</span>
        </div>

        {/* Note Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700">
                Study Material
              </span>
              {topic?.readTime && (
                <span className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                  <Clock size={14} />
                  Est. {topic.readTime} min read
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {note.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
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
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Flag className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  📌 Key Takeaways
                </h3>
                <p className="text-yellow-700 whitespace-pre-wrap">
                  {note.importantNotes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-8">
            <div 
              className="note-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: processContent(note.content || '<p class="text-gray-500 italic">No content available</p>')
              }} 
            />
          </div>
        </div>

        {/* Resources Section */}
        {note.resources && note.resources.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group border border-gray-200"
                  >
                    <div className="flex-shrink-0 text-purple-600">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {resource.title}
                      </p>
                      <p className="text-xs text-gray-500">
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

        {/* Navigation Between Notes */}
        {allNotes.length > 1 && (
          <div className="flex justify-between gap-4 mb-6">
            <button
              onClick={navigateToPrevNote}
              disabled={currentNoteIndex <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} />
              Previous Note
            </button>
            
            <button
              onClick={navigateToNextNote}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
            >
              {currentNoteIndex === allNotes.length - 1 ? (
                <>
                  <CheckCircle size={18} />
                  Complete Topic
                </>
              ) : (
                <>
                  Next Note
                  <ChevronRightIcon size={18} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        {allNotes.length > 1 && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Note {currentNoteIndex + 1} of {allNotes.length}
            </p>
            <div className="mt-2 flex justify-center gap-1">
              {allNotes.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentNoteIndex
                      ? 'w-8 bg-purple-600'
                      : idx < currentNoteIndex
                      ? 'w-4 bg-green-500'
                      : 'w-4 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close download options */}
      {showDownloadOptions && (
        <div 
          className="fixed inset-0 z-20"
          onClick={() => setShowDownloadOptions(false)}
        />
      )}

      {/* Global Styles for Rich Text Content */}
      <style jsx global>{`
        /* Note Content Styling */
        .note-content {
          line-height: 1.8;
          color: #1a1a1a;
        }
        
        /* Headings */
        .note-content h1 {
          font-size: 2.2em;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.3em;
        }
        
        .note-content h2 {
          font-size: 1.8em;
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
        
        /* Links */
        .note-content a {
          color: #8b5cf6;
          text-decoration: underline;
          transition: color 0.2s;
        }
        
        .note-content a:hover {
          color: #7c3aed;
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
        }
        
        /* Blockquotes */
        .note-content blockquote {
          border-left: 4px solid #8b5cf6;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: #6b7280;
        }
        
        /* Highlights */
        .note-content .highlight,
        .note-content mark {
          background-color: #fef08a;
          padding: 0 0.2em;
          border-radius: 3px;
        }
        
        /* Images */
        .note-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
        
        .note-content th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        
        /* Animation */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Print Styles */
        @media print {
          .sticky {
            position: relative !important;
          }
          button {
            display: none !important;
          }
          .bg-yellow-50, .bg-white {
            background-color: white !important;
            border: 1px solid #ddd !important;
          }
          body {
            background: white !important;
          }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .note-content h1 {
            font-size: 1.8em;
          }
          .note-content h2 {
            font-size: 1.5em;
          }
          .note-content h3 {
            font-size: 1.3em;
          }
          .note-content {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

// Helper component for FileCode icon (if not available in lucide-react)
const FileCode = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="m10 13-2 2 2 2" />
    <path d="m14 17 2-2-2-2" />
  </svg>
);