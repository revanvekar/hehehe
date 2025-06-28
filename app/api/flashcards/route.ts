import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
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
    
    const flashcards = await Flashcard.find({ userId: decoded.userId })
      .populate('subjectId', 'name')
      .sort({ nextReview: 1 });
    
    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('Get flashcards error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const flashcardId = searchParams.get('id');
    const deleteAll = searchParams.get('all') === 'true';
    
    if (deleteAll) {
      // Delete all flashcards for the user
      const result = await Flashcard.deleteMany({ userId: decoded.userId });
      return NextResponse.json({
        message: `Deleted ${result.deletedCount} flashcards`,
        deletedCount: result.deletedCount
      });
    } else if (flashcardId) {
      // Delete specific flashcard
      const result = await Flashcard.findOneAndDelete({
        _id: flashcardId,
        userId: decoded.userId
      });
      
      if (!result) {
        return NextResponse.json({ message: 'Flashcard not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Flashcard deleted successfully' });
    } else {
      return NextResponse.json({ message: 'No flashcard ID provided' }, { status: 400 });
    }
  } catch (error) {
    console.error('Delete flashcard error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}