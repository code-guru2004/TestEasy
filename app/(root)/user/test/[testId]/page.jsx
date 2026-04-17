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
  ArrowRight
} from "lucide-react";

export default function TestDetails() {
  const { testId } = useParams();
  const router = useRouter();

  const [test, setTest] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    fetchTest();
  }, []);

  const fetchTest = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/test/${testId}`,
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
      router.push(
        `/user/test/${testId}/attempt/${attemptInfo.activeAttemptId}?agreed=${checked}`
      );
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
      router.push(
        `/user/test/${testId}/attempt/${data?.attemptId}?agreed=${checked}`
      );
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
      <div className="max-w-4xl mx-auto">
        {/* Test Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h1 className="text-xl font-bold text-white">{test.title}</h1>
            {test.description && (
              <p className="text-blue-100 text-sm mt-1">{test.description}</p>
            )}
          </div>
          
          <div className="p-6">
            {/* Test Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-lg font-semibold text-gray-800">{test.duration} min</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileQuestion className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Questions</p>
                  <p className="text-lg font-semibold text-gray-800">{test.questions?.length || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Trophy className="w-5 h-5 text-purple-600" />
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

            {/* Subject/Topic Info */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
              {test.subject && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Subject:</span>
                  <span className="text-sm font-medium text-gray-800">{test.subject.name}</span>
                </div>
              )}
              {test.topic && (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Topic:</span>
                  <span className="text-sm font-medium text-gray-800">{test.topic.name}</span>
                </div>
              )}
              {test.subjects && test.subjects.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Subjects:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {test.subjects.map(s => s.name).join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Attempt Info Badge */}
            {attemptInfo && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                  <span className="text-xs text-gray-600">Attempt:</span>
                  <span className="text-xs font-semibold text-gray-800">
                    {attemptInfo.attemptCount} / {attemptInfo.maxAttempts}
                  </span>
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
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <FileQuestion className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Question Pattern</p>
                    <p className="text-xs text-gray-500">Total {test.questions?.length || 0} questions with multiple choice answers.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-1 rounded-full mt-0.5">
                    <Trophy className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Marking Scheme</p>
                    <p className="text-xs text-gray-500">
                      Each question carries {test.totalMarks / test.questions?.length || 0} marks.
                      {test.negativeMarks > 0 && ` Negative marking: ${test.negativeMarks} marks per wrong answer.`}
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
                      • Ensure stable internet connection.
                    </p>
                  </div>
                </div>
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
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Test Duration:</span>
                      <span className="font-medium text-gray-800">{test.duration} minutes</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Total Questions:</span>
                      <span className="font-medium text-gray-800">{test.questions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Maximum Marks:</span>
                      <span className="font-medium text-gray-800">{test.totalMarks}</span>
                    </div>
                    {attemptInfo && attemptInfo.attemptCount > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Previous Attempts:</span>
                        <span className="font-medium text-orange-600">{attemptInfo.attemptCount}</span>
                      </div>
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
                </div>
              </div>
            </div>
          </div>
        </div>

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