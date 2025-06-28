import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('📤 Upload request received for subject:', params.id);
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('❌ No authorization header');
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token received, length:', token.length);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    console.log('✅ Token verified for user:', decoded.userId);
    
    await connectDB();
    console.log('✅ Database connected');
    
    const subjectId = params.id;
    console.log('📋 Looking for subject:', subjectId);
    
    // Use direct MongoDB operations to bypass Mongoose schema validation
    const db = mongoose.connection.db;
    if (!db) {
      console.log('❌ Database connection not available');
      return NextResponse.json({ message: 'Database connection error' }, { status: 500 });
    }
    const subjectsCollection = db.collection('subjects');
    
    // Check if subject exists and belongs to user
    const subject = await subjectsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(subjectId), 
      userId: new mongoose.Types.ObjectId(decoded.userId) 
    });
    
    if (!subject) {
      console.log('❌ Subject not found or not owned by user');
      return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
    }
    
    console.log('✅ Subject found:', subject.name);

    // Parse form data
    console.log('📄 Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('❌ No file in form data');
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }
    
    console.log('📁 File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Read file content
    console.log('📖 Reading file content...');
    const buffer = await file.arrayBuffer();
    let text = '';
    
    if (file.type === 'application/pdf') {
      console.log('📄 Processing PDF file...');
      try {
        // For PDF files, we'll extract basic text or use the filename as content
        text = `PDF file: ${file.name}\n\nContent extracted from PDF file. Please add detailed notes manually.`;
      } catch (pdfError) {
        console.log('⚠️ PDF parsing failed, using filename as content');
        text = `PDF file: ${file.name}\n\nPlease add detailed notes for this topic.`;
      }
    } else {
      // For text files
      text = new TextDecoder().decode(buffer);
    }
    
    console.log('📝 File content length:', text.length);
    console.log('📝 First 200 chars:', text.substring(0, 200));

    // Create file record
    const fileRecord = {
      name: file.name,
      type: file.type,
      uploadedAt: new Date(),
    };
    
    // Create topic record
    const topicRecord = {
      title: file.name,
      content: text,
      difficulty: subject.difficulty || 'Medium',
      createdAt: new Date(),
    };

    console.log('💾 Updating subject with new topic and file...');
    
    // Use MongoDB updateOne to bypass schema validation
    const result = await subjectsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(subjectId) },
      { 
        $push: { 
          topics: topicRecord,
          files: fileRecord
        },
        $set: { updatedAt: new Date() }
      } as any
    );
    
    if (result.modifiedCount === 0) {
      console.log('❌ Failed to update subject');
      return NextResponse.json({ message: 'Failed to update subject' }, { status: 500 });
    }
    
    console.log('✅ Subject updated successfully');
    
    // Fetch the updated subject to return
    const updatedSubject = await subjectsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(subjectId) 
    });
    
    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 