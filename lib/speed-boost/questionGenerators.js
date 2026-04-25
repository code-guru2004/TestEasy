// lib/questionGenerators.js

// Helper function to get random number within range
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to calculate GCD for fraction simplification
const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

// Simplify fraction
const simplifyFraction = (numerator, denominator) => {
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor
  };
};

// Time limits based on difficulty
const getTimeLimit = (difficulty) => {
  const limits = {
    easy: 10,
    medium: 12,
    hard: 15
  };
  return limits[difficulty];
};

// 1. ADDITION GENERATOR
const generateAddition = (level) => {
  let num1, num2, answer;
  
  switch(level) {
    case 'easy':
      num1 = random(1, 50);
      num2 = random(1, 50);
      answer = num1 + num2;
      break;
    case 'medium':
      num1 = random(10, 999);
      num2 = random(10, 999);
      answer = num1 + num2;
      break;
    case 'hard':
      num1 = random(100, 9999);
      num2 = random(100, 9999);
      answer = num1 + num2;
      break;
  }
  
  return {
    question: `${num1} + ${num2}`,
    type: 'addition',
    difficulty: level,
    answer: answer,
    timeLimit: getTimeLimit(level)
  };
};

// 2. SUBTRACTION GENERATOR
const generateSubtraction = (level) => {
  let num1, num2, answer;
  
  switch(level) {
    case 'easy':
      num1 = random(10, 100);
      num2 = random(1, num1);
      answer = num1 - num2;
      break;
    case 'medium':
      num1 = random(100, 999);
      num2 = random(50, num1);
      answer = num1 - num2;
      break;
    case 'hard':
      num1 = random(1000, 9999);
      num2 = random(500, num1);
      answer = num1 - num2;
      break;
  }
  
  return {
    question: `${num1} - ${num2}`,
    type: 'subtraction',
    difficulty: level,
    answer: answer,
    timeLimit: getTimeLimit(level)
  };
};

// 3. MULTIPLICATION GENERATOR
const generateMultiplication = (level) => {
  let num1, num2, answer;
  
  switch(level) {
    case 'easy':
      num1 = random(1, 12);
      num2 = random(1, 12);
      answer = num1 * num2;
      break;
    case 'medium':
      num1 = random(10, 99);
      num2 = random(2, 20);
      answer = num1 * num2;
      break;
    case 'hard':
      num1 = random(20, 999);
      num2 = random(10, 99);
      answer = num1 * num2;
      break;
  }
  
  return {
    question: `${num1} × ${num2}`,
    type: 'multiplication',
    difficulty: level,
    answer: answer,
    timeLimit: getTimeLimit(level)
  };
};

// 4. FRACTION ADDITION GENERATOR (must simplify)
const generateFraction = (level) => {
  let num1, den1, num2, den2, resultNum, resultDen;
  
  switch(level) {
    case 'easy':
      // Simple fractions with same denominator
      den1 = random(2, 8);
      den2 = den1;
      num1 = random(1, den1 - 1);
      num2 = random(1, den2 - 1);
      resultNum = num1 + num2;
      resultDen = den1;
      break;
    case 'medium':
      // Different denominators
      den1 = random(2, 12);
      den2 = random(2, 12);
      num1 = random(1, den1 - 1);
      num2 = random(1, den2 - 1);
      resultNum = (num1 * den2) + (num2 * den1);
      resultDen = den1 * den2;
      break;
    case 'hard':
      // Complex fractions with larger numbers
      den1 = random(6, 24);
      den2 = random(6, 24);
      num1 = random(1, den1 - 1);
      num2 = random(1, den2 - 1);
      resultNum = (num1 * den2) + (num2 * den1);
      resultDen = den1 * den2;
      break;
  }
  
  // Simplify the fraction
  const simplified = simplifyFraction(resultNum, resultDen);
  
  // Format the question
  const formatFraction = (num, den) => {
    if (den === 1) return `${num}`;
    return `${num}/${den}`;
  };
  
  return {
    question: `${formatFraction(num1, den1)} + ${formatFraction(num2, den2)}`,
    type: 'fraction',
    difficulty: level,
    answer: simplified.denominator === 1 ? simplified.numerator : `${simplified.numerator}/${simplified.denominator}`,
    timeLimit: getTimeLimit(level),
    // Optional: store raw answer for validation
    rawAnswer: {
      numerator: simplified.numerator,
      denominator: simplified.denominator
    }
  };
};

// 5. PERCENTAGE GENERATOR
const generatePercentage = (level) => {
  let number, percent, answer;
  
  switch(level) {
    case 'easy':
      percent = random(10, 100);
      number = random(10, 100);
      answer = (percent / 100) * number;
      break;
    case 'medium':
      percent = random(5, 200);
      number = random(50, 500);
      answer = (percent / 100) * number;
      break;
    case 'hard':
      percent = random(1, 300);
      number = random(100, 2000);
      answer = (percent / 100) * number;
      break;
  }
  
  return {
    question: `What is ${percent}% of ${number}?`,
    type: 'percentage',
    difficulty: level,
    answer: Math.round(answer * 100) / 100, // Round to 2 decimals
    timeLimit: getTimeLimit(level)
  };
};

// 6. RATIO & PROPORTION GENERATOR
const generateRatio = (level) => {
  let ratio1, ratio2, part1, part2, total, answer;
  
  switch(level) {
    case 'easy':
      // Simple ratio: a:b = c:d, find d
      ratio1 = random(1, 5);
      ratio2 = random(1, 5);
      part1 = random(2, 10);
      answer = (part1 * ratio2) / ratio1;
      
      return {
        question: `If ${ratio1}:${ratio2} = ${part1}:x, find x.`,
        type: 'ratio',
        difficulty: level,
        answer: answer,
        timeLimit: getTimeLimit(level)
      };
      
    case 'medium':
      // Sharing in ratio
      total = random(100, 1000);
      ratio1 = random(1, 10);
      ratio2 = random(1, 10);
      const sum = ratio1 + ratio2;
      answer = (total * ratio1) / sum;
      
      return {
        question: `Divide ${total} in the ratio ${ratio1}:${ratio2}. Find the larger/ smaller part? (Enter just the number)`,
        type: 'ratio',
        difficulty: level,
        answer: Math.round(answer * 100) / 100,
        timeLimit: getTimeLimit(level)
      };
      
    case 'hard':
      // Complex proportion
      const a = random(2, 8);
      const b = random(2, 8);
      const c = random(3, 12);
      // a:b = c:d, find d
      answer = (b * c) / a;
      
      return {
        question: `If ${a}:${b} = ${c}:x, find the value of x.`,
        type: 'ratio',
        difficulty: level,
        answer: Math.round(answer * 100) / 100,
        timeLimit: getTimeLimit(level)
      };
  }
};

// Mixed mode generator - picks random topic
const generateMixedQuestion = (level, excludeTopics = []) => {
  const topics = ['addition', 'subtraction', 'multiplication', 'fraction', 'percentage', 'ratio'];
  const availableTopics = topics.filter(t => !excludeTopics.includes(t));
  const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
  
  const generators = {
    addition: generateAddition,
    subtraction: generateSubtraction,
    multiplication: generateMultiplication,
    fraction: generateFraction,
    percentage: generatePercentage,
    ratio: generateRatio
  };
  
  return generators[randomTopic](level);
};

module.exports = {
  generateAddition,
  generateSubtraction,
  generateMultiplication,
  generateFraction,
  generatePercentage,
  generateRatio,
  generateMixedQuestion,
  getTimeLimit
};