"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

const EditTopicPage = () => {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Editor content state
  const [editorContent, setEditorContent] = useState("");

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    subjectId: "",
    isActive: true,
    imageUrl: "",
    summary: "",
    importantNotes: "",
    readTime: "",
    order: "",
    resources: [],
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
            importantNotes: topic.importantNotes || "",
            readTime: topic.readTime || "",
            order: topic.order || "",
            resources: topic.resources || [],
          });

          setSubjectName(topic.subject?.name || "");
          setEditorContent(topic.content || "");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load topic");
      } finally {
        setLoading(false);
      }
    };

    if (topicId) fetchTopic();
  }, [topicId, router]);

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

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const updateData = {
        name: formData.name,
        content: editorContent,
        summary: formData.summary,
        importantNotes: formData.importantNotes,
        readTime: formData.readTime ? parseInt(formData.readTime) : null,
        order: formData.order ? parseInt(formData.order) : 0,
        isActive: formData.isActive,
        imageUrl: formData.imageUrl || null,
        resources: formData.resources.filter(
          (r) => r.title.trim() !== "" || r.url.trim() !== ""
        ),
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
        // setTimeout(() => router.push(`/topic/${topicId}`), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Back to Topic
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Topic</h1>
          {subjectName && (
            <p className="text-gray-600 mt-1">
              Subject: <span className="font-medium">{subjectName}</span>
            </p>
          )}
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
          <div className="bg-white rounded-lg shadow-sm p-6">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reading Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="readTime"
                    value={formData.readTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="5"
                  />
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Summary / Short Description
            </h2>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Write a brief summary of this topic (max 500 characters)..."
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.summary.length}/500 characters
            </p>
          </div>

          {/* Rich Content Editor Card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 pb-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Topic Content
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
          <div className="bg-white rounded-lg shadow-sm p-6">
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
          </div>

          {/* Resources Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
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
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                >
                  ✕
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Title
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
                      URL
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
      </div>
    </div>
  );
};

export default EditTopicPage;