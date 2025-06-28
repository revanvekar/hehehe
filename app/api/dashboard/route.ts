import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Subject from '@/models/Subject';
import Flashcard from '@/models/Flashcard';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    await connectDB();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get subjects
    const subjects = await Subject.find({ userId: decoded.userId }).sort({ createdAt: -1 });
    
    // Get flashcards
    const flashcards = await Flashcard.find({ userId: decoded.userId });
    
    // Calculate stats
    const stats = {
      totalSubjects: subjects.length,
      totalFlashcards: flashcards.length,
      streakDays: user.streakDays || 0,
      todayRevised: user.todayRevised || 0,
    };

    // Daily prompts
    const prompts = [
      "What did you learn today?",
      "What concept would you like to revise?",
      "Any new insights to add?",
      "What topic challenged you today?",
      "Ready to add today's learning?"
    ];
    
    const dailyPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    return NextResponse.json({
      subjects,
      stats,
      dailyPrompt,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}