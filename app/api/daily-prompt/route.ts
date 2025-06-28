import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import DailyEntry from '@/models/DailyEntry';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    await connectDB();
    
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { message: 'Topic is required' },
        { status: 400 }
      );
    }

    // Create daily entry
    const entry = await DailyEntry.create({
      userId: decoded.userId,
      topic,
      date: new Date(),
    });

    // Update user streak
    const user = await User.findById(decoded.userId);
    if (user) {
      const today = new Date().toDateString();
      const lastEntry = user.lastDailyEntry?.toDateString();
      
      if (lastEntry !== today) {
        user.streakDays = (user.streakDays || 0) + 1;
        user.lastDailyEntry = new Date();
        await user.save();
      }
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Daily prompt error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}