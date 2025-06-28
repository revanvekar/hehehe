import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Subject from '@/models/Subject';

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
    const { question } = await request.json();
    
    if (!question) {
      return NextResponse.json({ message: 'Question is required' }, { status: 400 });
    }

    const subject = await Subject.findOne({ _id: subjectId, userId: decoded.userId });
    if (!subject) {
      return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
    }

    // Concatenate all topic contents for context
    const allNotes = (subject.topics || []).map((t: any) => t.content).join('\n\n');
    
    // Use Gemini API for answer
    const apiKey = process.env.GEMINI_API_KEY;
    let answer = "Sorry, I couldn't find an answer in your notes.";
    
    if (apiKey && allNotes.trim()) {
      try {
        const prompt = `Based on the following notes about ${subject.name}, answer this question: "${question}"

Notes:
${allNotes}

Please provide a clear, educational answer based on the notes provided.`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            answer = text;
          }
        }
      } catch (error) {
        console.error('Gemini API error:', error);
        answer = "I'm having trouble accessing the AI service right now. Please try again later.";
      }
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 