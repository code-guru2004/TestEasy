// components/practice/Timer.jsx
'use client';

import { useState, useEffect, useRef } from 'react';

export default function Timer({ timeLimit, onTimeOut, isActive, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    setTimeLeft(timeLimit);
    
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeLimit, isActive, resetKey]);

  // Calculate percentage for progress bar
  const percentage = (timeLeft / timeLimit) * 100;
  
  // Determine color based on time left
  const getColor = () => {
    if (percentage > 60) return 'from-green-500 to-green-400';
    if (percentage > 30) return 'from-yellow-500 to-yellow-400';
    return 'from-red-500 to-red-400';
  };

  return (
    <div className="relative w-24">
      <div className="text-center">
        <div className="text-3xl font-bold font-mono text-white">
          {timeLeft}s
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${getColor()} h-full transition-all duration-1000 ease-linear`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}