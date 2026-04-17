"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  Menu,
  Globe
} from "lucide-react";
import Image from "next/image";

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
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Languages configuration
  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "bn", name: "বাংলা", flag: "🇧🇩" }
  ];

  // Memoized helper functions to prevent re-renders
  const getLocalizedText = useCallback((textObj) => {
    if (!textObj) return "—";
    if (typeof textObj === 'string') return textObj;
    return textObj[selectedLanguage] || textObj.en || "—";
  }, [selectedLanguage]);

  const getLocalizedOptionText = useCallback((option) => {
    if (!option) return "—";
    if (typeof option === 'string') return option;
    return option[selectedLanguage] || option.en || "—";
  }, [selectedLanguage]);

  // Helper function to get option text from ID
  const getOptionTextFromId = useCallback((question, optionId) => {
    if (!question.options || !optionId) return null;
    const option = question.options.find(opt => opt.id === optionId);
    return option ? getLocalizedOptionText(option) : null;
  }, [getLocalizedOptionText]);

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
      setTestTitle(data.test?.title || "Test");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttempt = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts/${attemptId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = await res.json();
      
      setUserEmail(data.userEmail || "");
      setUserId(data.userId || "");
      setCurrent(data.currentQuestionIndex || 0);
      setTimeLeft(data.remainingTime);
      setIsPaused(data.status === "paused" ? true : false);
      
      // Process questions to map selectedOption IDs to text for display
      const processedQuestions = data.questions.map(q => {
        // Find the option text from the selectedOption ID
        let selectedOptionText = null;
        let selectedOptionId = q.selectedOption || null;
        
        if (selectedOptionId && q.options) {
          const foundOption = q.options.find(opt => opt.id === selectedOptionId);
          if (foundOption) {
            selectedOptionText = foundOption.en; // Store English text as base
          }
        }
        
        return {
          ...q,
          selectedOption: selectedOptionText,
          selectedOptionId: selectedOptionId
        };
      });
      
      setQuestions(processedQuestions);
      
      // Initialize marked for review
      const marked = data.questions
        .filter(q => q.isMarkedForReview)
        .map(q => q._id);
      setMarkedForReview(marked);
    } catch (err) {
      console.error("Error fetching attempt:", err);
    }
  };

  const saveAnswerToDB = async (questionId, selectedOptionId, isMarkedForReview, currentQuestionIndex) => {
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
            selectedOption: selectedOptionId, // Send option ID
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

  const handleAnswer = async (questionId, selectedOptionId, selectedOptionText) => {
    const currentQ = questions[current];

    // Update local state
    const updatedQuestions = [...questions];
    updatedQuestions[current] = {
      ...currentQ,
      selectedOption: selectedOptionText,
      selectedOptionId: selectedOptionId
    };
    setQuestions(updatedQuestions);

    // Save to database with option ID
    await saveAnswerToDB(questionId, selectedOptionId, markedForReview.includes(questionId), current);
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
    const optionId = currentQ?.selectedOptionId || null;
    await saveAnswerToDB(questionId, optionId, newMarked.includes(questionId), current);
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
        const optionId = questions[current]?.selectedOptionId || null;
        await saveAnswerToDB(
          questions[current]._id,
          optionId,
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
        const optionId = questions[current]?.selectedOptionId || null;
        await saveAnswerToDB(
          questions[current]._id,
          optionId,
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
      const optionId = questions[current]?.selectedOptionId || null;
      await saveAnswerToDB(
        questions[current]._id,
        optionId,
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
    if (timeLeft < 300) return "text-red-700 animate-pulse dark:text-red-400";
    if (timeLeft < 600) return "text-red-600 dark:text-yellow-400";
    return "text-gray-500 dark:text-green-400";
  };

  const getQuestionStatus = (index) => {
    const question = questions[index];
    if (!question) return "not-visited";

    if (markedForReview.includes(question._id) && question.selectedOption) {
      return "answered-marked";
    }

    if (markedForReview.includes(question._id)) {
      return "marked";
    }

    if (question.selectedOption) {
      return "answered";
    }

    return "not-answered";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "answered":
        return "bg-green-500";
      case "marked":
        return "bg-purple-400";
      case "answered-marked":
        return "bg-yellow-400";
      case "not-answered":
        return "bg-red-400";
      default:
        return "bg-gray-300 dark:bg-gray-600";
    }
  };

  const currentQ = questions[current];
  const answeredCount = questions.filter(q => q.selectedOption).length;
  const progress = (answeredCount / questions.length) * 100;

  if (!currentQ) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
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
            <div className="p-1.5 rounded-lg">
              <Image src={"/images/exam.png"} alt="test" width={30} height={30} />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800 dark:text-white">{testTitle}</h1>
              <p className="text-xs text-gray-500">Question {current + 1} of {questions.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <Globe size={16} className="text-gray-500" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-gray-700 dark:text-gray-300 text-sm focus:outline-none cursor-pointer"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {!isPaused && (
              <button
                onClick={pauseTest}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Pause Test"
              >
                <Pause size={18} />
              </button>
            )}
            <div className="flex items-center gap-2 bg-blue-500/50 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
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
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Question Sidebar */}
        <div className={`fixed left-0 top-16 bottom-0 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 z-30 overflow-y-auto ${showSidebar ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
          <div className="p-4 flex-col gap-2">
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-not-allowed">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Image src={"/images/person.jpg"} alt="img" width={100} height={100} />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xs font-light text-gray-700 dark:text-gray-300">
                  User: {userEmail}
                </h3>
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <h3 className="text-xs font-light text-gray-700 dark:text-gray-300">
                  Roll No: {userId}
                </h3>
              </div>
              <hr className="border-gray-300 dark:border-gray-600 mb-3" />
              <div className="flex justify-between text-sm mb-2">
                <span>Answered: {answeredCount}</span>
                <span>Marked: {markedForReview.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remaining: {questions.length - answeredCount}</span>
              </div>
            </div>
            
            {/* Question Lists grid */}
            <div className="grid grid-cols-7 gap-2">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(idx);
                const isMarked = markedForReview.includes(q?._id);

                return (
                  <button
                    key={idx}
                    onClick={() => goToQuestion(idx)}
                    className={`
                      relative w-7 h-7 rounded-xs font-semibold text-sm
                      transition-all duration-200
                      ${current === idx ? "ring-2 ring-purple-600 scale-110" : ""}
                      ${getStatusColor(status)}
                      hover:scale-105 hover:shadow-md
                      ${isMarked ? "border-0.5 border-purple-800" : ""}
                    `}
                  >
                    {idx + 1}
                    {isMarked && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Color Instruction */}
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 text-sm cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Answered</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-purple-400 border-2 border-purple-800" />
                <span className="text-gray-700 dark:text-gray-300">Marked for Review</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-yellow-400 border-2 border-purple-800" />
                <span className="text-gray-700 dark:text-gray-300">Answered & Marked</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-gray-700 dark:text-gray-300">Not Answered</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600" />
                <span className="text-gray-700 dark:text-gray-300">Not Visited</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 md:ml-72 p-6 relative">
          {/* Watermark Container */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="grid grid-cols-3 gap-8 p-8">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="text-gray-400 dark:text-gray-700 text-xs opacity-20 whitespace-nowrap"
                    style={{
                      transform: `rotate(-15deg)`,
                      fontSize: '20px',
                      fontWeight: 'bold',
                      letterSpacing: '2px'
                    }}
                  >
                    {userId}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="rounded-xl dark:border-gray-700 p-6">
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Question {current + 1}
                  </h2>
                  <button
                    onClick={() => toggleMarkForReview(currentQ._id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${markedForReview.includes(currentQ._id)
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Flag size={16} />
                    <span className="text-sm">Mark for Review</span>
                  </button>
                </div>

                <p className="text-gray-800 dark:text-white text-lg mb-4 cursor-not-allowed">
                  {getLocalizedText(currentQ?.questionText)}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {currentQ?.options?.map((option, idx) => {
                    const optionText = getLocalizedOptionText(option);
                    const isChecked = currentQ.selectedOptionId === option.id;
                    
                    return (
                      <label
                        key={option.id || idx}
                        className={`flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${isChecked
                          ? "border-blue-500 bg-blue-50 dark:bg-purple-900/20"
                          : "border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="question"
                          value={option.id}
                          checked={isChecked}
                          onChange={(e) => handleAnswer(currentQ._id, e.target.value, optionText)}
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                          disabled={savingAnswer}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {String.fromCharCode(65 + idx)}. {optionText}
                        </span>
                      </label>
                    );
                  })}
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
                    className="px-6 py-2 bg-green-700 flex items-center gap-2 text-stone-50 rounded-lg"
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
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
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