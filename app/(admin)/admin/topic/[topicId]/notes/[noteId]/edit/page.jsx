"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

const EditNotePage = () => {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId;
  const noteId = params.noteId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [topicName, setTopicName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [noteVersion, setNoteVersion] = useState(1);

  // Editor content state
  const [editorContent, setEditorContent] = useState("");

  // Form fields
  const [formData, setFormData] = useState({
    title: "",
    isPublished: true,
    importantNotes: "",
    resources: [],
  });

  // Fetch note and topic details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch note details
        const noteResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (noteResponse.data.success) {
          const note = noteResponse.data.data;
          
          setFormData({
            title: note.title || "",
            isPublished: note.isPublished ?? true,
            importantNotes: note.importantNotes || "",
            resources: note.resources || [],
          });
          
          setEditorContent(note.content || "");
          setNoteVersion(note.version || 1);
          
          // Fetch topic details
          const topicResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/topics/${note.topic._id || topicId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          if (topicResponse.data.success) {
            const topic = topicResponse.data.data;
            setTopicName(topic.name);
            setSubjectName(topic.subject?.name || "");
          }
        } else {
          setError("Note not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load note");
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      fetchData();
    }
  }, [noteId, topicId, router]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle resource management
  const addResource = () => {
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, { title: "", url: "", type: "link" }],
    }));
  };

  const updateResource = (index, field, value) => {
    setFormData((prev) => {
      const updatedResources = [...prev.resources];
      updatedResources[index] = { ...updatedResources[index], [field]: value };
      return { ...prev, resources: updatedResources };
    });
  };

  const removeResource = (index) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Validate required fields
    if (!formData.title.trim()) {
      setError("Note title is required");
      setSaving(false);
      return;
    }

    if (!editorContent.trim()) {
      setError("Note content is required");
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const updateData = {
        title: formData.title,
        content: editorContent,
        importantNotes: formData.importantNotes,
        isPublished: formData.isPublished,
        resources: formData.resources.filter(
          (r) => r.title.trim() !== "" && r.url.trim() !== ""
        ),
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Note updated successfully!");
        setNoteVersion(response.data.data.version);
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" });
        
        // Optionally redirect after 2 seconds
        setTimeout(() => {
          router.push(`/admin/topic/${topicId}/notes/${noteId}/view`);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete note
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        router.push(`/topic/${topicId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete note");
      setSaving(false);
    }
  };

  // Handle toggle publish status
  const handleTogglePublish = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}/toggle-publish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          isPublished: !prev.isPublished
        }));
        setSuccess(`Note ${!formData.isPublished ? 'published' : 'unpublished'} successfully`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle publish status");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Note</h1>
              <div className="mt-2">
                <p className="text-gray-600">
                  Topic: <span className="font-medium">{topicName}</span>
                </p>
                {subjectName && (
                  <p className="text-gray-600">
                    Subject: <span className="font-medium">{subjectName}</span>
                  </p>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  Version: {noteVersion}
                </span>
                <span className={`text-sm px-2 py-1 rounded-full ${formData.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {formData.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTogglePublish}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.isPublished 
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {formData.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Delete Note
              </button>
            </div>
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
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Enter note title"
                />
              </div>
            </div>
          </div>

          {/* Rich Content Editor Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 pb-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Note Content <span className="text-red-500">*</span>
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Use the editor below to create rich content with formatting, images, and links
              </p>
            </div>
            
            {/* Wrap SimpleEditor in a div with light theme forced */}
            <div className="simple-editor-light-wrapper" style={{ position: 'relative', width: '100%' }}>
              <style jsx global>{`
                /* Force light mode styles for the editor area */
                .simple-editor-light-wrapper {
                  --tt-bg-color: #ffffff;
                  --tt-gray-light-900: #111827;
                  --tt-theme-text: #111827;
                  --tt-scrollbar-color: #cbd5e1;
                }
                
                .simple-editor-light-wrapper .ProseMirror {
                  color: #111827 !important;
                  background-color: #ffffff !important;
                  min-height: 400px;
                }
                
                .simple-editor-light-wrapper .tiptap.ProseMirror {
                  min-height: 400px;
                  max-width: none !important;
                  width: 100% !important;
                }
                
                /* Override SimpleEditor's default full-width styles */
                .simple-editor-light-wrapper .simple-editor-wrapper {
                  width: 100% !important;
                  height: auto !important;
                  overflow: visible !important;
                }
                
                .simple-editor-light-wrapper .simple-editor-content {
                  max-width: none !important;
                  width: 100% !important;
                  margin: 0 !important;
                }
                
                .simple-editor-light-wrapper .simple-editor-content .tiptap.ProseMirror.simple-editor {
                  padding: 1rem !important;
                }
                
                /* Toolbar styling */
                .simple-editor-light-wrapper [data-toolbar] {
                  background-color: #f9fafb !important;
                  border-bottom: 1px solid #e5e7eb !important;
                }
                
                /* Button styling */
                .simple-editor-light-wrapper button {
                  color: #374151 !important;
                }
                
                .simple-editor-light-wrapper button:hover {
                  background-color: #e5e7eb !important;
                }
              `}</style>

              <SimpleEditor
                content={editorContent}
                onUpdate={({ editor }) => {
                  setEditorContent(editor.getHTML());
                }}
              />
            </div>
          </div>

          {/* Important Notes Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Important Notes & Key Points
            </h2>
            <textarea
              name="importantNotes"
              value={formData.importantNotes}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Add important notes, key takeaways, exam pointers, or additional information here..."
            />
            <p className="text-sm text-gray-500 mt-1">
              These will be highlighted as key points for students
            </p>
          </div>

          {/* Resources Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Additional Resources
              </h2>
              <button
                type="button"
                onClick={addResource}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                + Add Resource
              </button>
            </div>

            {formData.resources.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No resources added yet. Click "Add Resource" to add links, videos, or documents.
                </p>
              </div>
            )}

            {formData.resources.map((resource, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 mb-3 relative bg-gray-50"
              >
                <button
                  type="button"
                  onClick={() => removeResource(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 transition-colors"
                >
                  ✕
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={resource.title}
                      onChange={(e) =>
                        updateResource(index, "title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="e.g., YouTube Tutorial"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={resource.url}
                      onChange={(e) =>
                        updateResource(index, "url", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Resource Type
                    </label>
                    <select
                      value={resource.type}
                      onChange={(e) =>
                        updateResource(index, "type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                      <option value="link">Link</option>
                      <option value="video">Video</option>
                      <option value="document">Document</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {formData.resources.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                * Both title and URL are recommended for each resource
              </p>
            )}
          </div>

          {/* Info Card about Versioning */}
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">About Versioning</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>
                    Each time you update this note, the version number will automatically increment.
                    Current version: <strong>v{noteVersion}</strong>
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
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNotePage;