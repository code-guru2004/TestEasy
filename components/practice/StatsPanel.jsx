// components/practice/StatsPanel.jsx
'use client';

import { motion } from 'framer-motion';

export default function StatsPanel({ stats, rank, currentDifficulty, adaptiveDifficulty }) {
  const accuracy = stats.totalAttempts === 0 ? 0 : (stats.correctAnswers / stats.totalAttempts) * 100;
  
  const statCards = [
    {
      label: 'Questions',
      value: stats.totalAttempts,
      icon: '📝',
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Correct',
      value: stats.correctAnswers,
      icon: '✓',
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Accuracy',
      value: `${Math.round(accuracy)}%`,
      icon: '🎯',
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Current Streak',
      value: stats.currentStreak,
      icon: '🔥',
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Best Streak',
      value: stats.bestStreak,
      icon: '🏆',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      label: 'Avg Time',
      value: `${stats.avgTime.toFixed(1)}s`,
      icon: '⚡',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Rank Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-center shadow-xl"
      >
        <div className="text-sm uppercase tracking-wider opacity-90">Current Rank</div>
        <div className="text-4xl font-bold mt-2">{rank}</div>
        <div className="text-xs mt-2 opacity-75">
          {rank === 'Beginner' && 'Complete 50 questions to advance'}
          {rank === 'Intermediate' && '85%+ accuracy to reach Advanced'}
          {rank === 'Advanced' && '90%+ accuracy & speed to reach Pro'}
          {rank === 'Pro' && 'Elite level! Keep practicing'}
        </div>
      </motion.div>

      {/* Difficulty Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700"
      >
        <div className="text-sm text-gray-400 mb-3">Current Difficulty</div>
        <div className="flex items-center justify-between">
          <span className={`text-2xl font-bold ${
            currentDifficulty === 'easy' ? 'text-green-400' :
            currentDifficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {currentDifficulty.toUpperCase()}
          </span>
          <div className="text-right">
            <div className="text-xs text-gray-400">Adaptive Threshold</div>
            <div className="text-sm">80% accuracy & fast response</div>
          </div>
        </div>
        
        {/* Difficulty Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Easy</span>
            <span>Medium</span>
            <span>Hard</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
              style={{ 
                width: currentDifficulty === 'easy' ? '33%' : 
                       currentDifficulty === 'medium' ? '66%' : '100%' 
              }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xs opacity-90">{stat.label}</div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Performance Meter */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
        <div className="text-sm text-gray-400 mb-3">Performance Score</div>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-purple-400">
                {Math.round(adaptiveDifficulty.accuracy)}% Accuracy
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-purple-400">
                {adaptiveDifficulty.avgTime.toFixed(1)}s Avg Time
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-700">
            <div
              style={{ width: `${adaptiveDifficulty.accuracy}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 transition-all duration-500"
            ></div>
          </div>
        </div>
        
        <div className="text-xs text-center text-gray-400 mt-2">
          {adaptiveDifficulty.accuracy > 80 && adaptiveDifficulty.avgTime < (currentDifficulty === 'easy' ? 10 : currentDifficulty === 'medium' ? 12 : 15) ? (
            <span className="text-green-400">⬆️ Ready to level up! Keep up the speed!</span>
          ) : adaptiveDifficulty.accuracy < 50 ? (
            <span className="text-red-400">⚠️ Difficulty will decrease soon. Focus on accuracy.</span>
          ) : (
            <span>📈 Answer {adaptiveDifficulty.accuracy > 80 ? 'faster' : 'more accurately'} to increase difficulty</span>
          )}
        </div>
      </div>
    </div>
  );
}