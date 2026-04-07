"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Save,
  X,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Tag,
  BarChart3,
  Award,
  Lightbulb,
  Info
} from "lucide-react";

export default function CreateQuestionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    subject: "",
    topic: "",
    difficulty: "easy",
    fact: "",
    marks: 1,
    negativeMarks: 0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
    
    // If correct answer is set and option changes, clear correct answer
    if (form.correctAnswer === form.options[index]) {
      setForm({ ...form, options: newOptions, correctAnswer: "" });
    } else {
      setForm({ ...form, options: newOptions });
    }
  };

  const addOption = () => {
    if (form.options.length < 6) {
      setForm({ ...form, options: [...form.options, ""] });
    }
  };

  const removeOption = (index) => {
    if (form.options.length > 2) {
      const newOptions = form.options.filter((_, i) => i !== index);
      setForm({ ...form, options: newOptions });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.questionText.trim()) {
      newErrors.questionText = "Question text is required";
    }
    
    if (form.options.some(opt => !opt.trim())) {
      newErrors.options = "All options must be filled";
    }
    
    if (!form.correctAnswer) {
      newErrors.correctAnswer = "Please select the correct answer";
    }
    
    if (!form.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    
    if (!form.topic.trim()) {
      newErrors.topic = "Topic is required";
    }
    
    if (form.marks < 0) {
      newErrors.marks = "Marks cannot be negative";
    }
    
    if (form.negativeMarks < 0) {
      newErrors.negativeMarks = "Negative marks cannot be negative";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(
        "https://govt-quiz-app.onrender.com/api/admin/questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Question created successfully! ✅");
        setForm({
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          subject: "",
          topic: "",
          difficulty: "easy",
          fact: "",
          marks: 1,
          negativeMarks: 0
        });
      } else {
        alert(data.msg || "Failed to create question");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Create New Question
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 ml-12">
            Add questions to your quiz bank with detailed information
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Question Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <HelpCircle className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Question Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question Text *
                </label>
                <textarea
                  name="questionText"
                  placeholder="Enter your question here..."
                  value={form.questionText}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-gray-50 dark:bg-gray-700 dark:text-white ${
                    errors.questionText
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                />
                {errors.questionText && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {errors.questionText}
                  </p>
                )}
              </div>

              {/* Options Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Answer Options *
                  </label>
                  {form.options.length < 6 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add Option
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                            errors.options
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          required
                        />
                        {form.correctAnswer === opt && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle size={20} className="text-green-500" />
                          </div>
                        )}
                      </div>
                      {form.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.options && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {errors.options}
                  </p>
                )}
              </div>

              {/* Correct Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Correct Answer *
                </label>
                <select
                  name="correctAnswer"
                  value={form.correctAnswer}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                    errors.correctAnswer
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                >
                  <option value="">Select Correct Answer</option>
                  {form.options.map((opt, i) => (
                    <option key={i} value={opt} disabled={!opt}>
                      {opt || `Option ${i + 1} (Empty)`}
                    </option>
                  ))}
                </select>
                {errors.correctAnswer && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {errors.correctAnswer}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Classification</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="e.g., Mathematics, Science"
                  value={form.subject}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                    errors.subject
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topic *
                </label>
                <input
                  type="text"
                  name="topic"
                  placeholder="e.g., Algebra, Physics"
                  value={form.topic}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                    errors.topic
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                />
                {errors.topic && (
                  <p className="text-red-500 text-xs mt-1">{errors.topic}</p>
                )}
              </div>
            </div>
          </div>

          {/* Fact Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Educational Fact</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interesting Fact (Optional)
              </label>
              <div className="relative">
                <textarea
                  name="fact"
                  placeholder="Add an interesting fact related to this question... This will be shown to students after answering the question."
                  value={form.fact}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white resize-none"
                />
                <div className="absolute bottom-3 right-3 text-gray-400 text-xs">
                  <Info size={14} />
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                <Lightbulb size={12} />
                A fun fact or educational insight that will enhance learning experience
              </p>
            </div>
          </div>

          {/* Scoring Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Scoring & Difficulty</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marks *
                </label>
                <input
                  type="number"
                  name="marks"
                  value={form.marks}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                    errors.marks
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                />
                {errors.marks && (
                  <p className="text-red-500 text-xs mt-1">{errors.marks}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Negative Marks
                </label>
                <input
                  type="number"
                  name="negativeMarks"
                  value={form.negativeMarks}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white ${
                    errors.negativeMarks
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                <p className="text-gray-500 text-xs mt-1">
                  Deduction for incorrect answers
                </p>
                {errors.negativeMarks && (
                  <p className="text-red-500 text-xs mt-1">{errors.negativeMarks}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty Level *
                </label>
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                >
                  <option value="easy">🟢 Easy</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="hard">🔴 Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="p-6 bg-gray-50 dark:bg-gray-700/30">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Preview</h2>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
              <p className="text-gray-800 dark:text-white font-medium mb-3">
                {form.questionText || "Question preview will appear here"}
              </p>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      form.correctAnswer === opt 
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`} />
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {opt || `Option ${i + 1}`}
                    </span>
                    {form.correctAnswer === opt && (
                      <span className="text-xs text-green-500">(Correct)</span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Fact Preview */}
              {form.fact && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Lightbulb size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Did You Know?</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{form.fact}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-4 text-sm">
                <span className="text-purple-600 dark:text-purple-400">
                  📝 {form.marks} mark{form.marks !== 1 ? 's' : ''}
                </span>
                {form.negativeMarks > 0 && (
                  <span className="text-red-600 dark:text-red-400">
                    ➖ {form.negativeMarks} negative mark{form.negativeMarks !== 1 ? 's' : ''}
                  </span>
                )}
                <span className="text-gray-500">
                  🎯 {form.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium flex items-center justify-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}