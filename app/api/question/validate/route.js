// app/api/question/validate/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userAnswer, correctAnswer, questionType, timeTaken } = await request.json();
    
    let isCorrect = false;
    let normalizedUserAnswer = userAnswer;
    let normalizedCorrectAnswer = correctAnswer;
    
    // Normalize answers based on question type
    switch(questionType) {
      case 'fraction':
        // Handle fraction answers (e.g., "3/4" or "0.75" or "3")
        if (typeof userAnswer === 'string' && userAnswer.includes('/')) {
          // Already in fraction format
          normalizedUserAnswer = userAnswer.trim();
        } else if (!isNaN(parseFloat(userAnswer))) {
          // Convert decimal to fraction approximation
          // For exact matching, we'll keep as decimal but with tolerance
          normalizedUserAnswer = parseFloat(userAnswer);
          if (typeof correctAnswer === 'string' && correctAnswer.includes('/')) {
            const [num, den] = correctAnswer.split('/').map(Number);
            normalizedCorrectAnswer = num / den;
          }
        }
        break;
        
      case 'percentage':
        // Handle percentage answers (e.g., "25" or "25%")
        normalizedUserAnswer = parseFloat(userAnswer.toString().replace('%', ''));
        normalizedCorrectAnswer = parseFloat(correctAnswer);
        break;
        
      default:
        // For number answers
        normalizedUserAnswer = parseFloat(userAnswer);
        normalizedCorrectAnswer = parseFloat(correctAnswer);
    }
    
    // Compare with small tolerance for floating point
    const tolerance = 0.01;
    if (typeof normalizedUserAnswer === 'number' && typeof normalizedCorrectAnswer === 'number') {
      isCorrect = Math.abs(normalizedUserAnswer - normalizedCorrectAnswer) < tolerance;
    } else {
      // String comparison for fractions
      isCorrect = normalizedUserAnswer.toString() === normalizedCorrectAnswer.toString();
    }
    
    // Calculate score based on speed
    const timeLimit = 15; // You can pass this from frontend
    let speedScore = 0;
    if (isCorrect && timeTaken) {
      if (timeTaken <= timeLimit * 0.3) speedScore = 100;
      else if (timeTaken <= timeLimit * 0.5) speedScore = 80;
      else if (timeTaken <= timeLimit * 0.7) speedScore = 60;
      else if (timeTaken <= timeLimit) speedScore = 40;
      else speedScore = 0;
    }
    
    return NextResponse.json({
      isCorrect,
      userAnswer: normalizedUserAnswer,
      correctAnswer: normalizedCorrectAnswer,
      speedScore,
      timeTaken,
      message: isCorrect ? 'Correct! 🎉' : `Wrong! Correct answer: ${correctAnswer}`
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.message },
      { status: 500 }
    );
  }
}