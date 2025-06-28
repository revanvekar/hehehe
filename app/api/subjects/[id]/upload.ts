export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Subject from '@/models/Subject';
// @ts-ignore
import pdfParse from 'pdf-parse';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    await connectDB();
    const subjectId = params.id;
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data')) {
      return NextResponse.json({ message: 'Invalid content type' }, { status: 400 });
    }
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    console.log('Received file:', file);
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }
    let text = '';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('File type:', file.type);
    try {
      if (file.type === 'application/pdf') {
        const data = await pdfParse(buffer);
        text = data.text;
      } else if (file.type === 'text/plain') {
        text = buffer.toString('utf-8');
      }
    } catch (parseErr) {
      console.error('Error parsing file:', parseErr);
      return NextResponse.json({ message: 'Failed to parse file', error: String(parseErr) }, { status: 500 });
    }
    const subject = await Subject.findOne({ _id: subjectId, userId: decoded.userId });
    if (!subject) {
      return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
    }
    if (text) {
      subject.topics.push({
        title: file.name,
        content: text,
        difficulty: subject.difficulty || 'Medium',
      });
    }
    subject.files.push({
      name: file.name,
      type: file.type,
      uploadedAt: new Date(),
    });
    await subject.save();
    return NextResponse.json(subject);
  } catch (error) {
    console.error('Upload note error:', error);
    return NextResponse.json({ message: 'Internal server error', error: String(error) }, { status: 500 });
  }
} 