// app/api/question/generate/route.js
import { NextResponse } from 'next/server';
import {
  generateAddition,
  generateSubtraction,
  generateMultiplication,
  generateFraction,
  generatePercentage,
  generateRatio,
  generateMixedQuestion
} from '@/lib/speed-boost/questionGenerators';

// Cache for quick responses (optional)
const responseCache = new Map();
const CACHE_TTL = 1000; // 1 second cache for identical requests

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty') || 'easy';
    const mode = searchParams.get('mode') || 'single'; // 'single' or 'mixed'
    const excludeTopics = searchParams.get('exclude')?.split(',') || [];
    
    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Use easy, medium, or hard' },
        { status: 400 }
      );
    }
    
    // Create cache key
    const cacheKey = `${topic}-${difficulty}-${mode}-${excludeTopics.join(',')}`;
    
    // Check cache
    if (responseCache.has(cacheKey)) {
      const { data, timestamp } = responseCache.get(cacheKey);
      if (Date.now() - timestamp < CACHE_TTL) {
        return NextResponse.json(data);
      } else {
        responseCache.delete(cacheKey);
      }
    }
    
    let question;
    
    // Generate based on mode
    if (mode === 'mixed') {
      question = generateMixedQuestion(difficulty, excludeTopics);
    } else {
      // Single topic mode
      switch(topic) {
        case 'addition':
          question = generateAddition(difficulty);
          break;
        case 'subtraction':
          question = generateSubtraction(difficulty);
          break;
        case 'multiplication':
          question = generateMultiplication(difficulty);
          break;
        case 'fraction':
          question = generateFraction(difficulty);
          break;
        case 'percentage':
          question = generatePercentage(difficulty);
          break;
        case 'ratio':
          question = generateRatio(difficulty);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid topic. Choose from: addition, subtraction, multiplication, fraction, percentage, ratio' },
            { status: 400 }
          );
      }
    }
    
    // Add timestamp for reference
    const response = {
      ...question,
      generatedAt: Date.now(),
      sessionId: Math.random().toString(36).substring(7)
    };
    
    // Cache the response
    responseCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    // Add cache headers
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=1',
        'X-Generated-At': Date.now().toString()
      }
    });
    
  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question', details: error.message },
      { status: 500 }
    );
  }
}

// POST method for batch generation (optional)
export async function POST(request) {
  try {
    const { count = 1, topic, difficulty = 'easy', mode = 'single' } = await request.json();
    
    if (count > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 questions per batch' },
        { status: 400 }
      );
    }
    
    const questions = [];
    for (let i = 0; i < count; i++) {
      let question;
      if (mode === 'mixed') {
        question = generateMixedQuestion(difficulty);
      } else {
        switch(topic) {
          case 'addition':
            question = generateAddition(difficulty);
            break;
          case 'subtraction':
            question = generateSubtraction(difficulty);
            break;
          case 'multiplication':
            question = generateMultiplication(difficulty);
            break;
          case 'fraction':
            question = generateFraction(difficulty);
            break;
          case 'percentage':
            question = generatePercentage(difficulty);
            break;
          case 'ratio':
            question = generateRatio(difficulty);
            break;
          default:
            question = generateAddition(difficulty);
        }
      }
      questions.push(question);
    }
    
    return NextResponse.json({
      questions,
      count: questions.length,
      generatedAt: Date.now()
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate questions', details: error.message },
      { status: 500 }
    );
  }
}