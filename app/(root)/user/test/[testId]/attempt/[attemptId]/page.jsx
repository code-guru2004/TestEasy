"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Pause,
  PlayCircle,
  Moon,
  Sun,
  CheckCircle,
  XCircle,
  AlertCircle,
  Menu,
  FileText
} from "lucide-react";

export default function AttemptPage() {
  const { testId, attemptId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const agreed = searchParams.get("agreed");

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [testTitle, setTestTitle] = useState("");

  // 🚨 SECURITY CHECK
  useEffect(() => {
    if (agreed !== "true") {
      alert("Unauthorized Access");
      router.push(`/user/test/${testId}`);
    }
  }, [agreed, testId, router]);

  useEffect(() => {
    if (attemptId) {
      fetchAttempt();
      fetchTestDetails();
    }
  }, [attemptId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !isPaused) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isPaused]);

  const fetchTestDetails = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/test/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = await res.json();
      //console.log("Test details:", data);
      setTestTitle(data.test?.title || "Test");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttempt = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts/${attemptId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    const data = await res.json();
   // console.log(data);
    setQuestions(data.questions || []);
    setCurrent(data.currentQuestionIndex || 0);
    setTimeLeft(data.remainingTime);
    
    // Initialize marked for review
    const marked = data.questions
      .filter(q => q.isMarkedForReview)
      .map(q => q._id);
    setMarkedForReview(marked);
  };

  const saveAnswerToDB = async (questionId, selectedOption, isMarkedForReview, currentQuestionIndex) => {
    if (!attemptId) return;
    
    setSavingAnswer(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts/${attemptId}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            questionId,
            selectedOption,
            isMarkedForReview,
            currentQuestionIndex,
            timeSpent: 0
          })
        }
      );
      
      if (!res.ok) {
        const data = await res.json();
        if (data.msg === "Time is over") {
          alert("Time's up! Submitting test...");
          submitTest();
        }
      }
    } catch (err) {
      console.error("Failed to save answer:", err);
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleAnswer = async (questionId, answer) => {
    const currentQ = questions[current];
    
    // Update local state
    const updatedQuestions = [...questions];
    updatedQuestions[current] = {
      ...currentQ,
      selectedOption: answer
    };
    setQuestions(updatedQuestions);
    
    // Save to database
    await saveAnswerToDB(questionId, answer, markedForReview.includes(questionId), current);
  };

  const toggleMarkForReview = async (questionId) => {
    let newMarked;
    if (markedForReview.includes(questionId)) {
      newMarked = markedForReview.filter(id => id !== questionId);
    } else {
      newMarked = [...markedForReview, questionId];
    }
    setMarkedForReview(newMarked);
    
    // Save to database
    const currentQ = questions[current];
    await saveAnswerToDB(questionId, currentQ?.selectedOption || null, newMarked.includes(questionId), current);
  };

  const pauseTest = async () => {
    if (!attemptId) return;
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts/${attemptId}/pausetest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      if (res.ok) {
        setIsPaused(true);
        alert("Test paused successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resumeTest = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts/${attemptId}/resume`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      const data = await res.json();
      
      if (res.ok) {
        setTimeLeft(data.remainingTime);
        setIsPaused(false);
        await fetchAttempt();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const nextQuestion = async () => {
    if (current < questions.length - 1) {
      // Save current position
      if (attemptId && questions[current]) {
        await saveAnswerToDB(
          questions[current]._id,
          questions[current].selectedOption || null,
          markedForReview.includes(questions[current]._id),
          current
        );
      }
      setCurrent(current + 1);
    }
  };

  const prevQuestion = async () => {
    if (current > 0) {
      // Save current position
      if (attemptId && questions[current]) {
        await saveAnswerToDB(
          questions[current]._id,
          questions[current].selectedOption || null,
          markedForReview.includes(questions[current]._id),
          current
        );
      }
      setCurrent(current - 1);
    }
  };

  const goToQuestion = async (index) => {
    // Save current position before moving
    if (attemptId && questions[current]) {
      await saveAnswerToDB(
        questions[current]._id,
        questions[current].selectedOption || null,
        markedForReview.includes(questions[current]._id),
        current
      );
    }
    setCurrent(index);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const submitTest = async () => {
    if (!confirm("Are you sure you want to submit the test?")) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts/${attemptId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      const data = await res.json();
      if (res.ok) {
        router.push(`/user/test/${testId}/result?attemptId=${attemptId}`);
      } else {
        alert(data.msg);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft < 300) return "text-red-600 dark:text-red-400";
    if (timeLeft < 600) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getQuestionStatus = (index) => {
    const question = questions[index];
    if (!question) return "not-visited";
    if (question.selectedOption) return "answered";
    if (markedForReview.includes(question._id)) return "marked";
    return "not-answered";
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "answered": return "bg-green-500";
      case "marked": return "bg-purple-500";
      case "not-answered": return "bg-red-500";
      default: return "bg-gray-300 dark:bg-gray-600";
    }
  };

  const currentQ = questions[current];
  const answeredCount = questions.filter(q => q.selectedOption).length;
  const progress = (answeredCount / questions.length) * 100;

  if (!currentQ) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading test...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${isDarkMode ? "dark" : ""}`}>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu size={20} />
            </button>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800 dark:text-white">{testTitle}</h1>
              <p className="text-xs text-gray-500">Question {current + 1} of {questions.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {!isPaused && (
              <button
                onClick={pauseTest}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Pause Test"
              >
                <Pause size={18} />
              </button>
            )}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
              <Clock size={18} className={getTimeColor()} />
              <span className={`font-mono font-bold ${getTimeColor()}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Question Sidebar */}
        <div className={`fixed left-0 top-16 bottom-0 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 z-30 overflow-y-auto ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}>
          <div className="p-4">
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>Answered: {answeredCount}</span>
                <span>Marked: {markedForReview.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remaining: {questions.length - answeredCount}</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const status = getQuestionStatus(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => goToQuestion(idx)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      current === idx
                        ? "ring-2 ring-purple-500 scale-105"
                        : ""
                    } ${getStatusColor(status)} text-white hover:opacity-80`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600 dark:text-gray-300">Answered</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-gray-600 dark:text-gray-300">Marked for Review</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600 dark:text-gray-300">Not Answered</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="text-gray-600 dark:text-gray-300">Not Visited</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 md:ml-72 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Question {current + 1}
                  </h2>
                  <button
                    onClick={() => toggleMarkForReview(currentQ._id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                      markedForReview.includes(currentQ._id)
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Flag size={16} />
                    <span className="text-sm">Mark for Review</span>
                  </button>
                </div>
                
                <p className="text-gray-800 dark:text-white text-lg mb-4">
                  {currentQ?.questionText}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {currentQ?.options?.map((option, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        currentQ.selectedOption === option
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="question"
                        value={option}
                        checked={currentQ.selectedOption === option}
                        onChange={(e) => handleAnswer(currentQ._id, e.target.value)}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                        disabled={savingAnswer}
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {String.fromCharCode(65 + idx)}. {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={prevQuestion}
                  disabled={current === 0 || savingAnswer}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                
                {current === questions.length - 1 ? (
                  <button
                    onClick={submitTest}
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition flex items-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                    Submit Test
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    disabled={savingAnswer}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                  >
                    Save & Next
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
              
              {savingAnswer && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving answer...
                </div>
              )}
            </div>

            {/* Question Stats */}
            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <span>Answered: {answeredCount}/{questions.length}</span>
              <span>Marked for Review: {markedForReview.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Paused Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full inline-flex mb-4">
              <Pause size={32} className="text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Test Paused</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your test has been paused. Click resume to continue where you left off.
            </p>
            <button
              onClick={resumeTest}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <PlayCircle size={18} />
              Resume Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}