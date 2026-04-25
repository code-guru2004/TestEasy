'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ==================== API HELPERS ====================
const mathAPI = {
  async generateMixedQuestion(difficulty) {
    const params = new URLSearchParams({
      mode: 'mixed',
      difficulty,
    });
    const response = await fetch(`/api/question/generate?${params}`);
    if (!response.ok) throw new Error('Failed to generate question');
    return response.json();
  },
  
  async validateAnswer(userAnswer, correctAnswer, questionType, timeTaken) {
    const response = await fetch('/api/question/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAnswer, correctAnswer, questionType, timeTaken })
    });
    if (!response.ok) throw new Error('Validation failed');
    return response.json();
  }
};

// ==================== TIMER COMPONENT ====================
function Timer({ timeLimit, onTimeOut, isActive, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (!isActive) return;
    setTimeLeft(timeLimit);
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, isActive, resetKey, onTimeOut]);

  const percentage = (timeLeft / timeLimit) * 100;
  const getColor = () => {
    if (percentage > 60) return '#10b981';
    if (percentage > 30) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="relative">
      <div className="text-center">
        <div className="text-3xl font-bold font-mono text-gray-800">{timeLeft}s</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
          <div 
            className="h-full transition-all duration-1000"
            style={{ width: `${percentage}%`, backgroundColor: getColor() }}
          />
        </div>
      </div>
    </div>
  );
}

// ==================== DIFFICULTY INDICATOR ====================
function DifficultyIndicator({ difficulty }) {
  const config = {
    easy: { color: '#10b981', bg: '#d1fae5', label: 'Easy' },
    medium: { color: '#f59e0b', bg: '#fef3c7', label: 'Medium' },
    hard: { color: '#ef4444', bg: '#fee2e2', label: 'Hard' }
  };
  const { color, bg, label } = config[difficulty];
  return (
    <div 
      className="px-3 py-1 rounded-full text-sm font-semibold"
      style={{ backgroundColor: bg, color: color }}
    >
      {label}
    </div>
  );
}

// ==================== RANK BADGE ====================
function RankBadge({ rank }) {
  const colors = {
    Beginner: { bg: '#9ca3af', text: '#ffffff' },
    Intermediate: { bg: '#3b82f6', text: '#ffffff' },
    Advanced: { bg: '#8b5cf6', text: '#ffffff' },
    Pro: { bg: '#f59e0b', text: '#ffffff' }
  };
  const { bg, text } = colors[rank];
  return (
    <div 
      className="px-3 py-1 rounded-full text-sm font-bold"
      style={{ backgroundColor: bg, color: text }}
    >
      {rank}
    </div>
  );
}

// ==================== STAT CARD ====================
function StatCard({ icon, label, value, color }) {
  const colorMap = {
    blue: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    green: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    purple: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
    orange: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
    yellow: { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' },
    cyan: { bg: '#ecfeff', text: '#0891b2', border: '#cffafe' },
  };
  const { bg, text, border } = colorMap[color];

  return (
    <div 
      className="rounded-xl p-4 border"
      style={{ backgroundColor: bg, borderColor: border }}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs font-medium" style={{ color: text }}>{label}</div>
      <div className="text-2xl font-bold mt-1 text-gray-800">{value}</div>
    </div>
  );
}

// ==================== MAIN PRACTICE COMPONENT ====================
export default function PracticePage() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    avgTime: 0,
    totalTime: 0,
  });
  const [rank, setRank] = useState('Beginner');
  const [currentDifficulty, setCurrentDifficulty] = useState('easy');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [sessionEndData, setSessionEndData] = useState(null);
  const [adaptiveAccuracy, setAdaptiveAccuracy] = useState(100);
  const [adaptiveAvgTime, setAdaptiveAvgTime] = useState(0);
  const [recentResults, setRecentResults] = useState([]);
  
  const questionStartTimeRef = useRef(null);
  const inputRef = useRef(null);
  const sessionActiveRef = useRef(true);

  // Generate question
  const generateQuestion = useCallback(async () => {
    if (!sessionActiveRef.current) return;
    setIsLoading(true);
    try {
      const question = await mathAPI.generateMixedQuestion(currentDifficulty);
      setCurrentQuestion(question);
      questionStartTimeRef.current = Date.now();
    } catch (error) {
      console.error('Failed to generate question:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDifficulty]);

  // Update adaptive difficulty
  const updateAdaptiveDifficulty = useCallback((isCorrect, timeTaken) => {
    const newResults = [...recentResults, { isCorrect, timeTaken }];
    if (newResults.length > 20) newResults.shift();
    
    const accuracy = (newResults.filter(r => r.isCorrect).length / newResults.length) * 100;
    const avgTime = newResults.reduce((sum, r) => sum + r.timeTaken, 0) / newResults.length;
    
    setAdaptiveAccuracy(accuracy);
    setAdaptiveAvgTime(avgTime);
    setRecentResults(newResults);
    
    if (newResults.length >= 10) {
      const timeLimit = currentDifficulty === 'easy' ? 10 : currentDifficulty === 'medium' ? 12 : 15;
      if (accuracy > 80 && avgTime < timeLimit) {
        setCurrentDifficulty(prev => {
          if (prev === 'easy') return 'medium';
          if (prev === 'medium') return 'hard';
          return prev;
        });
      } else if (accuracy < 50) {
        setCurrentDifficulty(prev => {
          if (prev === 'hard') return 'medium';
          if (prev === 'medium') return 'easy';
          return prev;
        });
      }
    }
  }, [recentResults, currentDifficulty]);

  // Update rank
  const updateRank = useCallback(() => {
    const totalAccuracy = stats.totalAttempts === 0 ? 0 : (stats.correctAnswers / stats.totalAttempts) * 100;
    const avgResponseTime = stats.avgTime;
    
    let newRank = rank;
    if (totalAccuracy > 85 && avgResponseTime < 8 && stats.totalAttempts >= 50) {
      newRank = 'Pro';
    } else if (totalAccuracy > 80 && avgResponseTime < 10 && stats.totalAttempts >= 30) {
      newRank = 'Advanced';
    } else if (totalAccuracy > 70 && stats.totalAttempts >= 15) {
      newRank = 'Intermediate';
    } else if (stats.totalAttempts >= 5) {
      newRank = 'Beginner';
    }
    
    if (totalAccuracy < 50 && stats.totalAttempts >= 20) {
      if (rank === 'Pro') newRank = 'Advanced';
      else if (rank === 'Advanced') newRank = 'Intermediate';
      else if (rank === 'Intermediate') newRank = 'Beginner';
    }
    
    if (newRank !== rank) setRank(newRank);
  }, [stats, rank]);

  // Submit answer
  const submitAnswer = useCallback(async (userAnswer) => {
    if (!currentQuestion || isAnswering) return;
    
    setIsAnswering(true);
    const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000;
    
    let isCorrect = false;
    if (userAnswer !== null && userAnswer.trim() !== '') {
      const validation = await mathAPI.validateAnswer(
        userAnswer,
        currentQuestion.answer,
        currentQuestion.type,
        timeTaken
      );
      isCorrect = validation.isCorrect;
      setFeedback({ type: isCorrect ? 'correct' : 'wrong', message: validation.message });
      setTimeout(() => setFeedback(null), 1500);
    } else if (userAnswer === null) {
      setFeedback({ type: 'wrong', message: 'Time\'s up!' });
      setTimeout(() => setFeedback(null), 1500);
    }
    
    setStats(prev => {
      const newTotalAttempts = prev.totalAttempts + 1;
      const newCorrectAnswers = prev.correctAnswers + (isCorrect ? 1 : 0);
      const newWrongAnswers = prev.wrongAnswers + (isCorrect ? 0 : 1);
      const newCurrentStreak = isCorrect ? prev.currentStreak + 1 : 0;
      const newBestStreak = Math.max(prev.bestStreak, newCurrentStreak);
      const newTotalTime = prev.totalTime + timeTaken;
      const newAvgTime = newTotalTime / newTotalAttempts;
      
      return {
        totalAttempts: newTotalAttempts,
        correctAnswers: newCorrectAnswers,
        wrongAnswers: newWrongAnswers,
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        avgTime: newAvgTime,
        totalTime: newTotalTime,
      };
    });
    
    updateAdaptiveDifficulty(isCorrect, timeTaken);
    setAnswer('');
    
    setTimeout(() => {
      generateQuestion();
      setIsAnswering(false);
    }, 300);
    
    setTimeout(() => updateRank(), 100);
  }, [currentQuestion, isAnswering, generateQuestion, updateAdaptiveDifficulty, updateRank]);

  // Stop session
  const stopSession = useCallback(() => {
    sessionActiveRef.current = false;
    
    const accuracy = stats.totalAttempts === 0 ? 0 : (stats.correctAnswers / stats.totalAttempts) * 100;
    const roundedAccuracy = Math.round(accuracy * 100) / 100;
    
    const sessionData = {
      accuracy: roundedAccuracy,
      avgTime: stats.avgTime || 0,
      totalQuestions: stats.totalAttempts,
      correctAnswers: stats.correctAnswers,
      wrongAnswers: stats.wrongAnswers,
      maxStreak: stats.bestStreak,
      finalDifficulty: currentDifficulty,
      rank: rank,
      sessionDuration: Math.round(stats.totalTime),
      completedAt: new Date().toLocaleString()
    };
    
    setSessionEndData(sessionData);
    setShowResults(true);
  }, [stats, currentDifficulty, rank]);

  // Reset session
  const resetSession = useCallback(() => {
    sessionActiveRef.current = true;
    setStats({
      totalAttempts: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
      avgTime: 0,
      totalTime: 0,
    });
    setRank('Beginner');
    setCurrentDifficulty('easy');
    setAdaptiveAccuracy(100);
    setAdaptiveAvgTime(0);
    setRecentResults([]);
    setShowResults(false);
    setSessionEndData(null);
    setFeedback(null);
    generateQuestion();
  }, [generateQuestion]);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim() || isAnswering) return;
    submitAnswer(answer);
  };

  // Handle timeout
  const handleTimeOut = () => {
    if (!isAnswering) {
      submitAnswer(null);
    }
  };

  // Auto-focus input
  useEffect(() => {
    if (!isLoading && !isAnswering && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion, isLoading, isAnswering]);

  // Initialize
  useEffect(() => {
    generateQuestion();
    return () => {
      sessionActiveRef.current = false;
    };
  }, [generateQuestion]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        resetSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetSession]);

  const accuracy = stats.totalAttempts === 0 ? 0 : (stats.correctAnswers / stats.totalAttempts) * 100;

  // Results Modal
  const ResultsModal = () => {
    if (!showResults || !sessionEndData) return null;
    
    const getPerformanceMessage = () => {
      if (sessionEndData.accuracy >= 90) return 'Outstanding! Elite performance! 🎉';
      if (sessionEndData.accuracy >= 75) return 'Great job! Keep pushing! 👍';
      if (sessionEndData.accuracy >= 60) return 'Good effort! Room to grow! 📈';
      return 'Keep practicing! You\'ll improve! 💪';
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowResults(false)} />
        <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Session Complete!</h2>
              <button onClick={() => setShowResults(false)} className="text-gray-400 hover:text-gray-600 transition-colors text-2xl">✕</button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="text-center py-4">
              <div className="text-5xl mb-2">{sessionEndData.accuracy >= 90 ? '🏆' : sessionEndData.accuracy >= 75 ? '🎯' : '💪'}</div>
              <p className="text-lg font-semibold text-gray-700">{getPerformanceMessage()}</p>
              {sessionEndData.completedAt && (
                <p className="text-xs text-gray-400 mt-2">Completed at: {sessionEndData.completedAt}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: sessionEndData.totalQuestions, label: 'Questions', color: '#3b82f6' },
                { value: `${sessionEndData.accuracy}%`, label: 'Accuracy', color: '#10b981' },
                { value: `${sessionEndData.avgTime}s`, label: 'Avg Time', color: '#f59e0b' },
                { value: sessionEndData.maxStreak, label: 'Best Streak', color: '#ef4444' },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <div className="text-2xl font-bold text-gray-800">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Final Rank</div>
                  <div className={`text-3xl font-bold mt-1 ${
                    sessionEndData.rank === 'Pro' ? 'text-amber-500' :
                    sessionEndData.rank === 'Advanced' ? 'text-purple-500' :
                    sessionEndData.rank === 'Intermediate' ? 'text-blue-500' : 'text-gray-500'
                  }`}>
                    {sessionEndData.rank}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Difficulty Reached</div>
                  <div className={`text-2xl font-bold mt-1 ${
                    sessionEndData.finalDifficulty === 'hard' ? 'text-red-500' :
                    sessionEndData.finalDifficulty === 'medium' ? 'text-amber-500' : 'text-green-500'
                  }`}>
                    {sessionEndData.finalDifficulty.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Correct Answers</div>
                  <div className="text-2xl font-bold text-green-600 mt-1">{sessionEndData.correctAnswers}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Wrong Answers</div>
                  <div className="text-2xl font-bold text-red-500 mt-1">{sessionEndData.wrongAnswers}</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-semibold text-blue-700 mb-2">💡 Tips for Improvement:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {sessionEndData.avgTime > 8 && (
                  <li>• Focus on improving speed - try mental math techniques</li>
                )}
                {sessionEndData.accuracy < 80 && (
                  <li>• Take a moment to verify answers before submitting</li>
                )}
                {sessionEndData.maxStreak < 10 && (
                  <li>• Build consistency - aim for longer answer streaks</li>
                )}
                {sessionEndData.finalDifficulty === 'easy' && sessionEndData.totalQuestions > 20 && (
                  <li>• You're ready to increase difficulty! Answer faster to level up</li>
                )}
                <li>• Practice daily to maintain and improve your rank</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => {
                  setShowResults(false);
                  resetSession();
                }} 
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200"
              >
                Start New Session
              </button>
              <button 
                onClick={() => setShowResults(false)} 
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Speed Math Training</h1>
            <p className="text-gray-500 mt-2">Infinite practice • Adaptive difficulty • Track progress</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={resetSession} 
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New Session
            </button>
            <button 
              onClick={stopSession} 
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Session
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Question Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              {currentQuestion ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-3">
                      <DifficultyIndicator difficulty={currentQuestion.difficulty} />
                      <RankBadge rank={rank} />
                    </div>
                    <Timer 
                      timeLimit={currentQuestion.timeLimit} 
                      onTimeOut={handleTimeOut} 
                      isActive={!isAnswering && !isLoading} 
                      resetKey={currentQuestion.question} 
                    />
                  </div>
                  <div className="text-center mb-8">
                    <div className="text-sm text-gray-500 mb-2 uppercase tracking-wider">{currentQuestion.type}</div>
                    <div className="text-5xl md:text-6xl font-bold text-gray-800 font-mono">{currentQuestion.question}</div>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Enter your answer..."
                      disabled={isAnswering || isLoading}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 text-xl text-center focus:outline-none focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
                      autoComplete="off"
                    />
                    <button 
                      type="submit" 
                      disabled={isAnswering || isLoading || !answer.trim()} 
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnswering ? 'Checking...' : 'Submit Answer (Enter)'}
                    </button>
                  </form>
                  {feedback && (
                    <div className={`mt-4 p-3 rounded-lg text-center ${
                      feedback.type === 'correct' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {feedback.message}
                    </div>
                  )}
                  <div className="mt-6 text-xs text-center text-gray-400">
                    Tip: Type fractions as "3/4" or decimals as "0.75"
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-12">Loading...</div>
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Rank Card */}
            <div className="bg-blue-600 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-sm uppercase tracking-wider text-blue-100">Current Rank</div>
              <div className="text-4xl font-bold text-white mt-2">{rank}</div>
              <div className="text-xs mt-2 text-blue-100">
                {rank === 'Beginner' && 'Complete 50 questions to advance'}
                {rank === 'Intermediate' && '80%+ accuracy to reach Advanced'}
                {rank === 'Advanced' && '85%+ accuracy & speed to reach Pro'}
                {rank === 'Pro' && 'Elite level! Keep practicing'}
              </div>
            </div>

            {/* Difficulty Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-500 mb-3">Current Difficulty</div>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${
                  currentDifficulty === 'easy' ? 'text-green-600' : 
                  currentDifficulty === 'medium' ? 'text-amber-600' : 
                  'text-red-600'
                }`}>
                  {currentDifficulty.toUpperCase()}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Easy</span>
                  <span>Medium</span>
                  <span>Hard</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500" 
                    style={{ width: currentDifficulty === 'easy' ? '33%' : currentDifficulty === 'medium' ? '66%' : '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon="📝" label="Questions" value={stats.totalAttempts} color="blue" />
              <StatCard icon="✓" label="Correct" value={stats.correctAnswers} color="green" />
              <StatCard icon="🎯" label="Accuracy" value={`${Math.round(accuracy)}%`} color="purple" />
              <StatCard icon="🔥" label="Streak" value={stats.currentStreak} color="orange" />
              <StatCard icon="🏆" label="Best Streak" value={stats.bestStreak} color="yellow" />
              <StatCard icon="⚡" label="Avg Time" value={`${stats.avgTime.toFixed(1)}s`} color="cyan" />
            </div>

            {/* Performance Meter */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-500 mb-3">Performance Score</div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600">{Math.round(adaptiveAccuracy)}% Accuracy</span>
                  <span className="text-xs font-semibold text-blue-600">{adaptiveAvgTime.toFixed(1)}s Avg Time</span>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div 
                    style={{ width: `${adaptiveAccuracy}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                  />
                </div>
              </div>
              <div className="text-xs text-center text-gray-500 mt-2">
                {adaptiveAccuracy > 80 && adaptiveAvgTime < (currentDifficulty === 'easy' ? 10 : currentDifficulty === 'medium' ? 12 : 15) ? (
                  <span className="text-green-600">⬆️ Ready to level up! Keep up the speed!</span>
                ) : adaptiveAccuracy < 50 ? (
                  <span className="text-red-600">⚠️ Difficulty will decrease soon. Focus on accuracy.</span>
                ) : (
                  <span>📈 Answer accurately & fast to increase difficulty</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="fixed bottom-4 right-4 bg-gray-800 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-400">
          <div className="flex gap-4">
            <span><kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300">Enter</kbd> Submit</span>
            <span><kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300">Ctrl+Shift+R</kbd> Reset</span>
          </div>
        </div>
      </div>

      <ResultsModal />
    </div>
  );
}