"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowLeft,
  Clock,
  FileText,
  Loader2,
  Award,
  Users,
  BookOpen,
  RefreshCw,
  History,
  LayoutGrid,
  List,
  Bookmark,
  Eye,
  FileText as NoteIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TopicWiseTestsPage() {
  const { subjectId, topicId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

  const topicName = searchParams.get("topicName") || "Topic";
  const subjectName = searchParams.get("subjectName") || "Subject";

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "column"
  
  // Notes dialog state
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [topicDetails, setTopicDetails] = useState(null);

  useEffect(() => {
    fetchTests();
    fetchNotes();
  }, [subjectId, topicId]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tests/subject/${subjectId}/topic/${topicId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTests(res.data.tests || []);
    } catch (err) {
      setError("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes?topicId=${topicId}&isPublished=true&limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setNotes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoadingNotes(false);
    }
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
        setTopicDetails(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching topic details:", error);
    }
  };

  const fetchAttempts = async (testId) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tests/${testId}/attempts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttempts(res.data.attempts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addBookmark = async (testId) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookmarks/${testId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update UI - could show a toast notification
    } catch (error) {
      console.error(error);
    }
  };

  const openNotesDialog = async () => {
    await fetchTopicDetails();
    setNotesDialogOpen(true);
  };

  const handleViewNote = (noteId) => {
    router.push(`/topics/${topicId}/notes/${noteId}`);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getButtonConfig = (test) => {
    if (test.canResume) return { text: "Resume Test", variant: "warning" };
    if (test.canStart && test.attemptCount >= 1) return { text: "Re-attempt", variant: "primary" };
    if (test.canStart) return { text: "Start Test", variant: "primary" };
    if (test.canViewResult) return { text: "View Result", variant: "success" };
    return { text: "Not Available", disabled: true };
  };

  const handleTestAction = (test) => {
    if (test.canResume) {
      router.push(`/user/test/${test._id}/attempt/${test.activeAttemptId}?agreed=true`);
      return;
    }
    if (test.canStart) {
      router.push(`/user/test/${test._id}`);
      return;
    }
    if (test.canViewResult) {
      router.push(`/user/result/${test.oldestCompletedAttemptId}`);
    }
  };

  const getStatusBadge = (test) => {
    if (test.canResume)
      return { text: "In Progress", color: "bg-yellow-50 text-yellow-700 border-yellow-200" };
    if (test.completedAttemptsCount > 0)
      return { text: "Completed", color: "bg-green-50 text-green-700 border-green-200" };
    if (test.canStart)
      return { text: "Available", color: "bg-blue-50 text-blue-700 border-blue-200" };
    return { text: "Locked", color: "bg-gray-50 text-gray-500 border-gray-200" };
  };

  const openHistory = async (test) => {
    setSelectedTest(test);
    await fetchAttempts(test._id);
    setHistoryOpen(true);
  };

  // Small Progress Bar Component
  const SmallProgressBar = ({ used, total }) => {
    const percent = total > 0 ? (used / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 h-1 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {used}/{total}
        </span>
      </div>
    );
  };

  // Test Card Component for both views
  const TestCard = ({ test, isGridView = false }) => {
    const status = getStatusBadge(test);
    const btn = getButtonConfig(test);
    const total = test.maxAttempts || 0;
    const used = total - (test.remainingAttempts || 0);

    if (isGridView) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow flex flex-col h-full">
          <div className="p-4 flex-1">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                  {test.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {test.description}
                </p>
              </div>
              <button 
                onClick={() => addBookmark(test._id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Bookmark Test"
              >
                <Bookmark className="text-blue-600 bg-blue-200/50 p-0.5 rounded-xs hover:bg-blue-300/50 outline-1" size={20}/>
              </button>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ml-2 flex-shrink-0 ${status.color}`}
              >
                {status.text}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>{test.duration} min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText size={12} />
                  <span>{test.totalQuestions} Q</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award size={12} />
                  <span>{test.totalMarks} marks</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Users size={12} />
                  <span>Max: {test.maxAttempts}</span>
                </div>
              </div>
            </div>

            {/* Small Progress Bar */}
            {total > 0 && (
              <div className="mb-3">
                <SmallProgressBar used={used} total={total} />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => handleTestAction(test)}
                disabled={btn.disabled}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  btn.disabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : btn.variant === "warning"
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : btn.variant === "success"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {btn.text}
              </button>

              <button
                onClick={() => openHistory(test)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <History size={12} />
                History
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Column View (original layout)
    return (
      <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {test.title}
              </h3>
              <p className="text-sm text-gray-600">
                {test.description}
              </p>
            </div>
            <div>
              <button 
                onClick={() => addBookmark(test._id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Bookmark Test"
              >
                <Bookmark className="text-blue-600 bg-blue-200 p-0.5 rounded-xs hover:bg-blue-300 outline-1"/>
              </button>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border ${status.color}`}
            >
              {status.text}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} />
              <span>{test.duration} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText size={14} />
              <span>{test.totalQuestions} questions</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award size={14} />
              <span>{test.totalMarks} marks</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={14} />
              <span>{test.maxAttempts} attempts</span>
            </div>
          </div>

          {/* Small Progress Bar */}
          {total > 0 && (
            <div className="mb-4">
              <SmallProgressBar used={used} total={total} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => handleTestAction(test)}
              disabled={btn.disabled}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                btn.disabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : btn.variant === "warning"
                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                  : btn.variant === "success"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {btn.text}
            </button>

            <button
              onClick={() => openHistory(test)}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <History size={14} />
              History
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchTests}
            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>

          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {topicName}
                </h1>
                <p className="text-gray-600 text-sm">{subjectName}</p>
              </div>
              
              {/* View Notes Button */}
              <button
                onClick={openNotesDialog}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <NoteIcon size={18} />
                <span>View Notes ({notes.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Toggle Buttons */}
        {tests.length > 0 && (
          <div className="flex justify-end mb-4 gap-2">
            <button
              onClick={() => setViewMode("column")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "column"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
              title="Column View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        )}

        {/* Tests Display */}
        {tests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No tests available for this topic</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test) => (
              <TestCard key={test._id} test={test} isGridView={true} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <TestCard key={test._id} test={test} isGridView={false} />
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {tests.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={fetchTests}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Attempt History
            </DialogTitle>
            {selectedTest && (
              <p className="text-sm text-gray-500 mt-1">{selectedTest.title}</p>
            )}
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {attempts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No attempts yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start the test to begin your first attempt
                </p>
              </div>
            ) : (
              attempts.map((attempt, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          Attempt #{attempts.length - idx}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                          Completed
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Score: <span className="font-semibold">{attempt.score}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(attempt.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setHistoryOpen(false);
                        router.push(`/user/result/${attempt._id}`);
                      }}
                      className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Result
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <NoteIcon size={22} />
              Study Notes
            </DialogTitle>
            {topicDetails && (
              <p className="text-sm text-gray-500 mt-1">
                {topicDetails.name} • {notes.length} note{notes.length !== 1 ? 's' : ''} available
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {loadingNotes ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin w-8 h-8 text-purple-600" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No notes available</h3>
                <p className="text-sm text-gray-500">
                  Study notes haven't been added for this topic yet.
                </p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note._id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all hover:border-purple-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {note.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          v{note.version}
                        </span>
                      </div>
                      
                      {/* Content Preview */}
                      {/* <div 
                        className="text-sm text-gray-600 mb-3 line-clamp-3"
                        dangerouslySetInnerHTML={{ 
                          __html: note.content?.substring(0, 300) + (note.content?.length > 300 ? '...' : '') || 'No content available'
                        }}
                      /> */}
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Updated: {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                        {note.importantNotes && (
                          <span className="flex items-center gap-1">
                            <BookOpen size={12} />
                            Has important notes
                          </span>
                        )}
                        {note.resources && note.resources.length > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText size={12} />
                            {note.resources.length} resource(s)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* View Button */}
                    <button
                      onClick={() => handleViewNote(note._id)}
                      className="ml-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with note count */}
          {notes.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                Showing {notes.length} note{notes.length !== 1 ? 's' : ''} for this topic
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}