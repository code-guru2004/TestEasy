"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Undo2, ArrowLeft } from "lucide-react";

export default function AttemptResultPage() {
  const router = useRouter();
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQ, setSelectedQ] = useState(0);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attempts/result/${attemptId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getOptionStyle = (option, answer) => {
    if (option === answer.correctOption) {
      return "bg-green-50 border-green-500";
    }
    if (option === answer.selectedOption && !answer.isCorrect) {
      return "bg-red-50 border-red-500";
    }
    return "bg-white border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
      </div>
    );
  }

  if (!data) return <p className="text-center text-red-600 mt-8">Error loading result</p>;

  const { summary, answers, test } = data;
  const current = answers[selectedQ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <button 
            className="text-sm text-stone-600 flex items-center bg-green-200/50 px-2 py-1 rounded-3xl"
            onClick={()=>{
              router.back()
            }}
            >
            <ArrowLeft className="" size={15}/>
            <p>
              back to dashboard
            </p>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h1>
          <p className="text-gray-600">Test Results</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm mb-1">Total Score</p>
            <p className="text-2xl font-bold text-gray-900">{summary.score}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm mb-1">Accuracy</p>
            <p className="text-2xl font-bold text-gray-900">{summary.accuracy}%</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm mb-1">Correct</p>
            <p className="text-2xl font-bold text-green-600">{summary.correct}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm mb-1">Wrong</p>
            <p className="text-2xl font-bold text-red-600">{summary.wrong}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm mb-1">Skipped</p>
            <p className="text-2xl font-bold text-gray-600">{summary.skipped}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Palette */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
              <h2 className="font-semibold text-gray-900 mb-3">Questions</h2>
              <div className="grid grid-cols-5 gap-2">
                {answers.map((ans, idx) => {
                  let bgColor = "bg-gray-100";
                  let textColor = "text-gray-700";
                  
                  if (!ans.selectedOption) {
                    bgColor = "bg-gray-200";
                    textColor = "text-gray-500";
                  } else if (ans.isCorrect) {
                    bgColor = "bg-green-500";
                    textColor = "text-white";
                  } else {
                    bgColor = "bg-red-500";
                    textColor = "text-white";
                  }
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedQ(idx)}
                      className={`p-2 text-sm font-medium rounded transition-all ${bgColor} ${textColor} ${
                        selectedQ === idx ? "ring-2 ring-blue-500 ring-offset-2" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              
              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Correct:</span>
                  <span className="font-semibold text-green-600">{summary.correct}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Wrong:</span>
                  <span className="font-semibold text-red-600">{summary.wrong}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Skipped:</span>
                  <span className="font-semibold text-gray-600">{summary.skipped}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Detail */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Question {selectedQ + 1} of {answers.length}
                  </h2>
                  {current.selectedOption ? (
                    current.isCorrect ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-1" />
                        <span className="text-sm font-medium">Correct</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <XCircle className="w-5 h-5 mr-1" />
                        <span className="text-sm font-medium">Incorrect</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center text-gray-500">
                      <span className="text-sm font-medium">Skipped</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {current.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {current.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-3 border rounded-lg transition-colors ${getOptionStyle(opt, current)}`}
                  >
                    <div className="flex items-start">
                      <span className="font-medium text-gray-700 mr-3">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className="text-gray-800 flex-1">{opt}</span>
                      {opt === current.correctOption && (
                        <span className="text-green-600 text-sm font-medium ml-2">
                          ✓ Correct Answer
                        </span>
                      )}
                      {opt === current.selectedOption && !current.isCorrect && (
                        <span className="text-red-600 text-sm font-medium ml-2">
                          ✗ Your Answer
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {current.explanation && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Explanation</h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {current.explanation}
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedQ(Math.max(0, selectedQ - 1))}
                  disabled={selectedQ === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setSelectedQ(Math.min(answers.length - 1, selectedQ + 1))}
                  disabled={selectedQ === answers.length - 1}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}