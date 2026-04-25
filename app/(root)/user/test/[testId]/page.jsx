"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Clock, 
  FileQuestion, 
  Trophy, 
  AlertCircle, 
  CheckCircle, 
  BookOpen, 
  Target,
  ChevronRight,
  Shield,
  Monitor,
  AlertTriangle,
  ArrowRight,
  Layers,
  Calendar,
  Award,
  Users,
  BarChart3,
  TrendingUp,
  Info,
  RefreshCw,
  History
} from "lucide-react";

export default function TestDetails() {
  const { testId } = useParams();
  const router = useRouter();

  const [test, setTest] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchTest();
  }, []);

  const fetchTest = async () => {
    const token = localStorage.getItem("token")
   
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tests/${testId}/details`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    const data = await res.json();
    setTest(data.test);
    setAttemptInfo(data.attemptInfo);
  };

  const handleStart = async () => {
    if (!checked) return;

    setLoading(true);
    
    if (attemptInfo.action === "resume") {
      // Conditional redirect based on test type
      if (test.hasSections) {
        router.push(
          `/user/sectional/${testId}/attempt/${attemptInfo.activeAttemptId}?agreed=${checked}`
        );
      } else {
        router.push(
          `/user/test/${testId}/attempt/${attemptInfo.activeAttemptId}?agreed=${checked}`
        );
      }
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/tests/${testId}/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();

    if (res.ok) {
      // Conditional redirect based on test type
      if (test.hasSections) {
        router.push(
          `/user/sectional/${testId}/attempt/${data?.attemptId}?agreed=${checked}`
        );
      } else {
        router.push(
          `/user/test/${testId}/attempt/${data?.attemptId}?agreed=${checked}`
        );
      }
    }
    
    setLoading(false);
  };

  const getButtonText = () => {
    if (!attemptInfo) return "Start Test";
    if (attemptInfo.attemptCount >= attemptInfo.maxAttempts) return "No Attempts Left";
    switch (attemptInfo.action) {
      case "resume":
        return "Resume Test";
      case "reattempt":
        return "Re-attempt";
      default:
        return "Start Test";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSectionExpand = (sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading test details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Test Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{test.title}</h1>
                {test.description && (
                  <p className="text-blue-100 text-sm mt-1">{test.description}</p>
                )}
              </div>
              {test.hasSections && (
                <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <Layers className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Sectional Test</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {/* Test Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Duration</p>
                  <p className="text-lg font-semibold text-gray-800">{test.duration} min</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileQuestion className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Questions</p>
                  <p className="text-lg font-semibold text-gray-800">{test.totalQuestions || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Marks</p>
                  <p className="text-lg font-semibold text-gray-800">{test.totalMarks}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Attempts Left</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {attemptInfo?.maxAttempts - attemptInfo?.attemptCount || test.maxAttempts}
                  </p>
                </div>
              </div>
            </div>

            {/* Section Overview for Sectional Tests */}
            {test.hasSections && test.sectionOverview && test.sectionOverview.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">Test Sections</h3>
                  <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
                    {test.sectionsCount} Sections
                  </span>
                </div>
                <div className="space-y-2">
                  {test.sectionOverview.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-purple-600">Section {idx + 1}</span>
                            <span className="text-sm font-medium text-gray-800">{section.title}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {section.duration} min
                            </span>
                            <span className="flex items-center gap-1">
                              <FileQuestion size={12} />
                              {section.questionsCount} questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Award size={12} />
                              {section.marksTotal} marks
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject/Topic Info */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
              {test.subjects && test.subjects.length > 0 && (
                <div className="flex items-start gap-2 flex-wrap">
                  <BookOpen className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Subjects Covered</p>
                    <div className="flex flex-wrap gap-1">
                      {test.subjects.map((subject, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-700">
                          {typeof subject === 'object' ? subject.name : subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Schedule Info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Starts:</span>
                  <span className="font-medium text-gray-800">{formatDate(test.startTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Ends:</span>
                  <span className="font-medium text-gray-800">{formatDate(test.endTime)}</span>
                </div>
              </div>
            </div>

            {/* Attempt Info */}
            {attemptInfo && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    <span className="text-xs text-gray-600">Attempts Used:</span>
                    <span className="text-xs font-semibold text-gray-800">
                      {attemptInfo.attemptCount} / {attemptInfo.maxAttempts}
                    </span>
                  </div>
                  {attemptInfo.bestScore && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">Best Score:</span>
                      <span className="text-xs font-semibold text-green-700">
                        {attemptInfo.bestScore} / {test.totalMarks}
                      </span>
                    </div>
                  )}
                  {attemptInfo.averageScore && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                      <BarChart3 className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-600">Average:</span>
                      <span className="text-xs font-semibold text-blue-700">
                        {attemptInfo.averageScore.toFixed(1)} / {test.totalMarks}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Two Stage Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Stage 1: Instructions */}
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${!showInstructions ? 'opacity-75' : ''}`}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-white" />
                <h2 className="text-white font-semibold">Important Instructions</h2>
              </div>
            </div>
            
            <div className="p-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                    <Clock className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Time Limit</p>
                    <p className="text-xs text-gray-500">You have {test.duration} minutes to complete this test.</p>
                    {test.hasSections && test.sectionOverview && (
                      <p className="text-xs text-gray-400 mt-1">
                        • Each section has its own time limit
                        • Section timer runs independently
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <FileQuestion className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Question Pattern</p>
                    <p className="text-xs text-gray-500">
                      Total {test.totalQuestions || 0} questions with multiple choice answers.
                      {test.hasSections && ` Questions are divided into ${test.sectionsCount} sections.`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-1 rounded-full mt-0.5">
                    <Award className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Marking Scheme</p>
                    <p className="text-xs text-gray-500">
                      Total marks: {test.totalMarks}
                      {test.negativeMarks > 0 && (
                        <span className="text-red-600"> Negative marking: {test.negativeMarks} marks per wrong answer.</span>
                      )}
                      {test.negativeMarks === 0 && (
                        <span className="text-green-600"> No negative marking.</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-1 rounded-full mt-0.5">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Important Notes</p>
                    <p className="text-xs text-gray-500">
                      • Do not refresh the page during the test.<br />
                      • Answers are auto-saved.<br />
                      • Ensure stable internet connection.<br />
                      • {test.allowResume ? "You can resume the test if interrupted." : "Test cannot be resumed once interrupted."}
                    </p>
                  </div>
                </div>

                {test.shuffleQuestions && (
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-1 rounded-full mt-0.5">
                      <Info className="w-3 h-3 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Additional Info</p>
                      <p className="text-xs text-gray-500">
                        Questions will be shuffled for each attempt.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stage 2: Test Start */}
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${showInstructions ? '' : 'opacity-75'}`}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-white" />
                <h2 className="text-white font-semibold">Ready to Begin?</h2>
              </div>
            </div>
            
            <div className="p-5">
              <div className="space-y-4">
                {/* Quick Summary */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Quick Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Test Duration:</span>
                      <span className="font-medium text-gray-800">{test.duration} minutes</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Total Questions:</span>
                      <span className="font-medium text-gray-800">{test.totalQuestions || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Maximum Marks:</span>
                      <span className="font-medium text-gray-800">{test.totalMarks}</span>
                    </div>
                    {test.hasSections && test.sectionsCount > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Number of Sections:</span>
                        <span className="font-medium text-purple-600">{test.sectionsCount}</span>
                      </div>
                    )}
                    {attemptInfo && attemptInfo.attemptCount > 0 && (
                      <>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Previous Attempts:</span>
                          <span className="font-medium text-orange-600">{attemptInfo.attemptCount}</span>
                        </div>
                        {attemptInfo.bestScore && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Best Score:</span>
                            <span className="font-medium text-green-600">{attemptInfo.bestScore} / {test.totalMarks}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setChecked(!checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      I confirm that I have read and understood all instructions
                    </p>
                    <p className="text-xs text-gray-500">
                      I will not switch tabs or refresh the page during the test
                    </p>
                  </div>
                </label>

                {/* Start Button */}
                <button
                  disabled={!checked || loading || (attemptInfo && attemptInfo.attemptCount >= attemptInfo.maxAttempts)}
                  onClick={handleStart}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{getButtonText()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Additional Info */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-2">
                  <span className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    Desktop recommended
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Secure browser
                  </span>
                  {test.allowResume && (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      Resumable
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Attempts Section */}
        {attemptInfo && attemptInfo.completedAttempts && attemptInfo.completedAttempts.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-5 py-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-white" />
                <h2 className="text-white font-semibold">Previous Attempts</h2>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {attemptInfo.completedAttempts.map((attempt, idx) => (
                  <div key={attempt.attemptId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Attempt #{attemptInfo.completedAttempts.length - idx}</p>
                      <p className="text-xs text-gray-500">{formatDate(attempt.submittedAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">Score: {attempt.score}/{test.totalMarks}</p>
                      <p className="text-xs text-gray-500">Status: {attempt.status}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/user/test/${testId}/result?attemptId=${attempt.attemptId}`)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      View Result
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            By starting this test, you agree to abide by the test rules and regulations
          </p>
        </div>
      </div>
    </div>
  );
}