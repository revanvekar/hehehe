import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Subject from '@/models/Subject';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    await connectDB();
    const subject = await Subject.findOne({ _id: params.id, userId: decoded.userId });
    if (!subject) {
      return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
    }
    return NextResponse.json(subject);
  } catch (error) {
    console.error('Get subject by id error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 