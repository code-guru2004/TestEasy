"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

const EditTopicPage = () => {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Notes management state
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  // Form fields (only topic fields, no content or resources since they moved to notes)
  const [formData, setFormData] = useState({
    name: "",
    subjectId: "",
    isActive: true,
    imageUrl: "",
    summary: "",
    readTime: "",
    order: "",
  });

  const [subjectName, setSubjectName] = useState("");

  // Fetch topic data
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/topics/${topicId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          const topic = response.data.data;

          setFormData({
            name: topic.name || "",
            subjectId: topic.subject?._id || "",
            isActive: topic.isActive ?? true,
            imageUrl: topic.imageUrl || "",
            summary: topic.summary || "",
            readTime: topic.readTime || "",
            order: topic.order || "",
          });

          setSubjectName(topic.subject?.name || "");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load topic");
      } finally {
        setLoading(false);
      }
    };

    if (topicId) fetchTopic();
  }, [topicId, router]);

  // Fetch notes for this topic
  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes?topicId=${topicId}&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setNotes(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);
      setError("Failed to load notes");
    } finally {
      setLoadingNotes(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const updateData = {
        name: formData.name,
        summary: formData.summary,
        readTime: formData.readTime ? parseInt(formData.readTime) : null,
        order: formData.order ? parseInt(formData.order) : 0,
        isActive: formData.isActive,
        imageUrl: formData.imageUrl || null,
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/topics/${topicId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Topic updated successfully!");
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" });
        // Refresh topic data
        const refreshedResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/topics/${topicId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (refreshedResponse.data.success) {
          const topic = refreshedResponse.data.data;
          setFormData({
            name: topic.name || "",
            subjectId: topic.subject?._id || "",
            isActive: topic.isActive ?? true,
            imageUrl: topic.imageUrl || "",
            summary: topic.summary || "",
            readTime: topic.readTime || "",
            order: topic.order || "",
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete note
  const handleDeleteNote = async (noteId, noteTitle) => {
    if (!confirm(`Are you sure you want to delete "${noteTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingNoteId(noteId);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Remove note from list
        setNotes(notes.filter(note => note._id !== noteId));
        setSuccess("Note deleted successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete note");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeletingNoteId(null);
    }
  };

  // Open notes dialog
  const openNotesDialog = async () => {
    setShowNotesDialog(true);
    await fetchNotes();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading topic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Topic
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Topic</h1>
              {subjectName && (
                <p className="text-gray-600 mt-1">
                  Subject: <span className="font-medium">{subjectName}</span>
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Note: Topic content and resources are now managed through Notes. 
                Each topic can have multiple notes.
              </p>
            </div>
            
            {/* Create Note Button */}
            <button
              type="button"
              onClick={() => router.push(`/admin/topic/${topicId}/notes/create`)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Note
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Enter topic name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feature Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="h-32 w-auto object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order / Position
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Controls the display order of topics
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Reading Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="readTime"
                    value={formData.readTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="5"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Average time to complete all notes in this topic
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Active (visible to students)
                </label>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Summary / Short Description
            </h2>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Write a brief summary of this topic (max 500 characters)..."
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.summary.length}/500 characters
            </p>
          </div>

          {/* Notes Management Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Notes Management
              </h2>
              <button
                type="button"
                onClick={openNotesDialog}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View All Notes
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Click the button above to view, edit, or delete all notes associated with this topic.
            </p>
          </div>

          {/* Info Card about Notes */}
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">About Topic Content</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>
                    The main content, important notes, and resources have been moved to separate <strong>Notes</strong>.
                    Each topic can have multiple notes. Use the "Create New Note" button to add content.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>

        {/* Notes Dialog Modal */}
        {showNotesDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              {/* Dialog Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">All Notes</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Topic: {formData.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowNotesDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Dialog Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingNotes ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new note for this topic.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          setShowNotesDialog(false);
                          router.push(`/admin/topic/${topicId}/notes/create`);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div
                        key={note._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {note.title}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                note.isPublished 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {note.isPublished ? 'Published' : 'Draft'}
                              </span>
                              <span className="text-xs text-gray-500">
                                v{note.version}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {note.content?.replace(/<[^>]*>/g, '').substring(0, 150) || 'No content'}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                              <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                              <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => {
                                setShowNotesDialog(false);
                                router.push(`/admin/topic/${topicId}/notes/${note._id}/edit`);
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
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowNotesDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowNotesDialog(false);
                    router.push(`/admin/topic/${topicId}/notes/create`);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTopicPage;