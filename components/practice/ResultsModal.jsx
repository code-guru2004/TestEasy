// components/practice/ResultsModal.jsx
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResultsModal({ isOpen, onClose, onNewSession, sessionData }) {
  useEffect(() => {
    if (isOpen && sessionData) {
      // Play completion sound (optional)
      console.log('Session completed:', sessionData);
    }
  }, [isOpen, sessionData]);

  if (!isOpen || !sessionData) return null;

  const getRankColor = (rank) => {
    switch(rank) {
      case 'Beginner': return 'text-gray-400';
      case 'Intermediate': return 'text-blue-400';
      case 'Advanced': return 'text-purple-400';
      case 'Pro': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  const getPerformanceMessage = () => {
    if (sessionData.accuracy >= 90) return 'Outstanding! Elite performance! 🎉';
    if (sessionData.accuracy >= 75) return 'Great job! Keep pushing! 👍';
    if (sessionData.accuracy >= 60) return 'Good effort! Room to grow! 📈';
    return 'Keep practicing! You\'ll improve! 💪';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700"
        >
          <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Session Complete!
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Performance Message */}
            <div className="text-center py-4">
              <div className="text-5xl mb-2">
                {sessionData.accuracy >= 90 ? '🏆' : sessionData.accuracy >= 75 ? '🎯' : '💪'}
              </div>
              <p className="text-lg font-semibold text-white">{getPerformanceMessage()}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{sessionData.totalQuestions}</div>
                <div className="text-xs text-gray-400 mt-1">Questions</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{sessionData.accuracy}%</div>
                <div className="text-xs text-gray-400 mt-1">Accuracy</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{sessionData.avgTime}s</div>
                <div className="text-xs text-gray-400 mt-1">Avg Time</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{sessionData.maxStreak}</div>
                <div className="text-xs text-gray-400 mt-1">Best Streak</div>
              </div>
            </div>

            {/* Rank Info */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">Final Rank</div>
                  <div className={`text-3xl font-bold mt-1 ${getRankColor(sessionData.rank)}`}>
                    {sessionData.rank}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Difficulty Reached</div>
                  <div className={`text-2xl font-bold mt-1 ${
                    sessionData.finalDifficulty === 'easy' ? 'text-green-400' :
                    sessionData.finalDifficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {sessionData.finalDifficulty.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Tips & Next Steps */}
            <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4">
              <h3 className="font-semibold text-blue-400 mb-2">💡 Tips for Improvement:</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                {sessionData.avgTime > 8 && (
                  <li>• Focus on improving speed - try mental math techniques</li>
                )}
                {sessionData.accuracy < 80 && (
                  <li>• Take a moment to verify answers before submitting</li>
                )}
                {sessionData.maxStreak < 10 && (
                  <li>• Build consistency - aim for longer answer streaks</li>
                )}
                <li>• Practice daily to maintain your rank</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={onNewSession}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-200"
              >
                Start New Session
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}