"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  Globe,
  Lock,
  Wifi,
  WifiOff
} from "lucide-react";
import Image from "next/image";

export default function AttemptPage() {
  const { testId, attemptId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const agreed = searchParams.get("agreed");

  // State
  const [user, setUser] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [hasSections, setHasSections] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [markedForReview, setMarkedForReview] = useState([]);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [testTitle, setTestTitle] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState("synced");

  // Refs
  const timerIntervalRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const currentAttemptIdRef = useRef(attemptId);
  const isMountedRef = useRef(true);

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "bn", name: "বাংলা", flag: "🇧🇩" }
  ];

  // Helper functions
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

  // Security check
  useEffect(() => {
    if (agreed !== "true") {
      alert("Unauthorized Access");
      router.push(`/user/test/${testId}`);
    }
  }, [agreed, testId, router]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  // Fetch attempt data (Main sync API)
  // Fetch attempt data (Main sync API)
  const fetchAttempt = useCallback(async (showSync = true) => {
    if (!currentAttemptIdRef.current) return;

    if (showSync) {
      setSyncStatus("syncing");
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts/${currentAttemptIdRef.current}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await res.json();

      if (!isMountedRef.current) return;
      //console.log(data)
      // Check if test is completed (different response structure)
      if (data.status === "completed" || data.attempt?.status === "completed") {
        //console.log("submited")
        // Test is already completed - redirect to results
        router.push(`/user/test/${testId}/result?attemptId=${currentAttemptIdRef.current}`);
        return;
      }

      // Normal in-progress test response
      setIsPaused(data.attempt.status === "paused");
      setUser(data.user);
      setAttempt(data.attempt);
      setHasSections(data.attempt.hasSections);
      setCurrentSectionIndex(data.attempt.currentSectionIndex);
      setCurrentQuestionIndex(data.attempt.currentQuestionIndex);
      setTimeLeft(data.attempt.remainingTime);

      // Process questions
      const processedQuestions = data.questions.map(q => ({
        ...q,
        selectedOptionId: q.selectedOption || null
      }));
      setQuestions(processedQuestions);

      // Set sections
      if (data.sections) {
        setSections(data.sections);
      }

      // Set marked for review
      const marked = processedQuestions
        .filter(q => q.isMarkedForReview)
        .map(q => q._id);
      setMarkedForReview(marked);

      setSyncStatus("synced");
      setIsOnline(true);

    } catch (err) {
      console.error("Error fetching attempt:", err);
      setIsOnline(false);
      setSyncStatus("offline");
    }
  }, [testId, router]);

  // Save answer
  const saveAnswer = async (questionId, selectedOptionId, isMarked) => {
    if (!currentAttemptIdRef.current) return;

    setSavingAnswer(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts/${currentAttemptIdRef.current}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            questionId,
            selectedOption: selectedOptionId,
            isMarkedForReview: isMarked,
            currentQuestionIndex,
            sectionIndex: hasSections ? currentSectionIndex : undefined,
            timeSpent: 0
          })
        }
      );

      if (!res.ok) {
        const error = await res.json();
        if (error.msg === "Time is over" || error.msg === "Section locked") {
          await fetchAttempt();
        }
      }
    } catch (err) {
      console.error("Failed to save answer:", err);
      setIsOnline(false);
    } finally {
      setSavingAnswer(false);
    }
  };

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
  // Auto sync every 15 seconds
  useEffect(() => {
    if (!isPaused && !submitting && isOnline) {
      syncIntervalRef.current = setInterval(() => {
        fetchAttempt(false);
      }, 15000);

      return () => {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      };
    }
  }, [isPaused, submitting, isOnline, fetchAttempt]);

  // Timer effect
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !isPaused && !submitting) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            // Time's up - sync to let backend handle section switch
            fetchAttempt();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
    }
  }, [timeLeft, isPaused, submitting, fetchAttempt]);

  // Initial load
  useEffect(() => {
    if (testId && attemptId) {
      // Start or resume test
      // const startTest = async () => {
      //   try {
      //     const res = await fetch(
      //       `${process.env.NEXT_PUBLIC_API_URL}/api/user/tests/${testId}/start`,
      //       {
      //         method: "POST",
      //         headers: {
      //           "Content-Type": "application/json",
      //           Authorization: `Bearer ${localStorage.getItem("token")}`
      //         }
      //       }
      //     );
      //     const data = await res.json();
      //     if (data.attemptId) {
      //       currentAttemptIdRef.current = data.attemptId;
      //       await fetchAttempt();
      //     }

      //     // Get test title
      //     const testRes = await fetch(
      //       `${process.env.NEXT_PUBLIC_API_URL}/api/user/test/${testId}`,
      //       {
      //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      //       }
      //     );
      //     const testData = await testRes.json();
      //     setTestTitle(testData.test?.title || "Test");
      //   } catch (err) {
      //     console.error("Error starting test:", err);
      //   }
      // };
      // startTest();
      fetchTestDetails();
      fetchAttempt();

    }
  }, [testId, attemptId]);

  // Handle answer selection
  const handleAnswer = async (questionId, selectedOptionId) => {
    // Update local state
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...questions[currentQuestionIndex],
      selectedOptionId: selectedOptionId
    };
    setQuestions(updatedQuestions);

    // Save to backend
    await saveAnswer(questionId, selectedOptionId, markedForReview.includes(questionId));
  };

  // Toggle mark for review
  const toggleMarkForReview = async (questionId) => {
    const newMarked = markedForReview.includes(questionId)
      ? markedForReview.filter(id => id !== questionId)
      : [...markedForReview, questionId];

    setMarkedForReview(newMarked);

    const currentQ = questions[currentQuestionIndex];
    await saveAnswer(questionId, currentQ?.selectedOptionId || null, newMarked.includes(questionId));
  };

  // Navigation - Previous Question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Navigation - Next Question
  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Save current answer before moving
      const currentQ = questions[currentQuestionIndex];
      if (currentQ) {
        await saveAnswer(currentQ._id, currentQ.selectedOptionId || null, markedForReview.includes(currentQ._id));
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Pause test
  const pauseTest = async () => {
    if (!currentAttemptIdRef.current) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts/${currentAttemptIdRef.current}/pausetest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (res.ok) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setIsPaused(true);
      }
    } catch (err) {
      console.error("Error pausing test:", err);
    }
  };

  // Resume test
  const resumeTest = async () => {
    if (!currentAttemptIdRef.current) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts/${currentAttemptIdRef.current}/resume`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (res.ok) {
        await fetchAttempt();
        setIsPaused(false);
      }
    } catch (err) {
      console.error("Error resuming test:", err);
    }
  };

  // Submit test
  // Submit test
  const submitTest = async () => {
    if (!confirm("Are you sure you want to submit the test?")) return;

    setSubmitting(true);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/attempts/${currentAttemptIdRef.current}/submit`,
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
        // Check if response has the completed structure
        if (data.status === "completed" || data.attempt?.status === "completed") {
          router.push(`/user/test/${testId}/result?attemptId=${currentAttemptIdRef.current}`);
        } else {
          // Fallback - just redirect
          router.push(`/user/test/${testId}/result?attemptId=${currentAttemptIdRef.current}`);
        }
      } else {
        alert(data.msg || "Failed to submit test");
      }
    } catch (err) {
      console.error("Error submitting test:", err);
      alert("Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!timeLeft) return "text-gray-500";
    if (timeLeft < 300) return "text-red-700 animate-pulse dark:text-red-400";
    if (timeLeft < 600) return "text-red-600 dark:text-yellow-400";
    return "text-gray-500 dark:text-green-400";
  };

  const getQuestionStatus = (index) => {
    const q = questions[index];
    if (!q) return "not-visited";

    if (markedForReview.includes(q._id) && q.selectedOptionId) return "answered-marked";
    if (markedForReview.includes(q._id)) return "marked";
    if (q.selectedOptionId) return "answered";
    if (index < currentQuestionIndex) return "not-answered";
    return "not-visited";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "answered": return "bg-green-500";
      case "marked": return "bg-purple-400";
      case "answered-marked": return "bg-yellow-400";
      case "not-answered": return "bg-red-400";
      default: return "bg-gray-300 dark:bg-gray-600";
    }
  };

  const currentQ = questions[currentQuestionIndex];
  const currentSection = sections[currentSectionIndex];
  const isLastSection = hasSections && currentSectionIndex === sections.length - 1;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isSectionLocked = hasSections && currentSection?.sectionLocked === true;

  // Calculate progress
  const answeredCount = questions.filter(q => q.selectedOptionId).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (!currentQ && !submitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading test...</p>
        </div>
      </div>
    );
  }

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
              <p className="text-xs text-gray-500">
                {hasSections && currentSection ? (
                  <>Section {currentSectionIndex + 1}: {currentSection.sectionTitle} • Question {currentQuestionIndex + 1} of {questions.length}</>
                ) : (
                  <>Question {currentQuestionIndex + 1} of {questions.length}</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {syncStatus === "syncing" && (
              <div className="flex items-center gap-1 text-xs text-blue-500">
                <Loader2 size={14} className="animate-spin" />
                <span className="hidden sm:inline">Syncing...</span>
              </div>
            )}
            {syncStatus === "offline" && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <WifiOff size={14} />
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}

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

            {!isPaused && !isSectionLocked && (
              <button onClick={pauseTest} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
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

        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <div className={`fixed left-0 top-16 bottom-0 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 z-30 overflow-y-auto ${showSidebar ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
          <div className="p-4">
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Image src={"/images/person.jpg"} alt="img" width={100} height={100} />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xs font-light text-gray-700 dark:text-gray-300">
                  User: {user?.email || ""}
                </h3>
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <h3 className="text-xs font-light text-gray-700 dark:text-gray-300">
                  Roll No: {user?.id || ""}
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

            {/* Sections */}
            {hasSections && sections.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Sections</h3>
                <div className="space-y-2">
                  {sections.map((section, idx) => {
                    const isCurrent = idx === currentSectionIndex;
                    return (
                      <div
                        key={idx}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${isCurrent
                            ? "bg-blue-500 text-white"
                            : section.sectionLocked
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                              : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{section.sectionTitle}</span>
                          {section.sectionLocked && <Lock size={12} />}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {formatTime(section.remainingTime)} • {section.totalQuestions} Qs
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Questions Grid */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Questions {hasSections && `(${currentSection?.sectionTitle})`}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const status = getQuestionStatus(idx);
                  const isMarked = markedForReview.includes(q?._id);
                  return (
                    <button
                      key={q._id || idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`
                        relative w-8 h-8 rounded text-sm font-semibold
                        transition-all duration-200
                        ${currentQuestionIndex === idx ? "ring-2 ring-purple-600 scale-110" : ""}
                        ${getStatusColor(status)}
                        hover:scale-105 hover:shadow-md
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
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500" /><span>Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-400" /><span>Marked for Review</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-400" /><span>Answered & Marked</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500" /><span>Not Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600" /><span>Not Visited</span></div>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 md:ml-72 p-6 relative">
          {/* Watermark Container - Kept as is */}
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
                    {user?.id}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto relative z-10">
            {isSectionLocked ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center">
                <Lock size={48} className="mx-auto mb-4 text-yellow-600" />
                <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-400 mb-2">Section Locked</h2>
                <p className="text-gray-600 dark:text-gray-300">Please complete the current section first.</p>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h2>
                    <button
                      onClick={() => toggleMarkForReview(currentQ._id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${markedForReview.includes(currentQ._id)
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      <Flag size={16} />
                      Mark for Review
                    </button>
                  </div>

                  <p className="text-gray-800 dark:text-white text-lg mb-6">
                    {getLocalizedText(currentQ?.questionText)}
                  </p>

                  <div className="space-y-3">
                    {currentQ?.options?.map((option, idx) => {
                      const optionText = getLocalizedOptionText(option);
                      const isChecked = currentQ.selectedOptionId === option.id;
                      return (
                        <label
                          key={option.id || idx}
                          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${isChecked
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                        >
                          <input
                            type="radio"
                            name="question"
                            value={option.id}
                            checked={isChecked}
                            onChange={() => handleAnswer(currentQ._id, option.id)}
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

                <div className="flex justify-between gap-3 mt-6">
                  <button
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0 || savingAnswer}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>

                  {isLastQuestion && isLastSection ? (
                    <button
                      onClick={submitTest}
                      disabled={submitting}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={18} />}
                      Submit Test
                    </button>
                  ) : isLastQuestion && !isLastSection ? (
                    <button
                      onClick={() => fetchAttempt()}
                      disabled={true}
                      className="px-6 py-2 bg-blue-600/50 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      Section End
                      <ChevronRight size={18} />
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
              </>
            )}
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
            <p className="text-gray-600 dark:text-gray-300 mb-6">Click resume to continue where you left off.</p>
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