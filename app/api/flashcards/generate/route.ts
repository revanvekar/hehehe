import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Subject from '@/models/Subject';
import Flashcard from '@/models/Flashcard';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    await connectDB();
    
    // Get user's subjects with topics
    const subjects = await Subject.find({ userId: decoded.userId });
    
    console.log(`Found ${subjects.length} subjects for user ${decoded.userId}`);
    
    if (subjects.length === 0) {
      return NextResponse.json(
        { message: 'No subjects found. Create subjects first.' },
        { status: 400 }
      );
    }

    const generatedFlashcards = [];

    // Generate flashcards for each subject
    for (const subject of subjects) {
      console.log(`Processing subject: ${subject.name}`);
      
      if (subject.topics && subject.topics.length > 0) {
        console.log(`Found ${subject.topics.length} topics in ${subject.name}`);
        
        for (const topic of subject.topics) {
          console.log(`Processing topic: ${topic.title}`);
          
          // Use Gemini API for flashcard generation
          const aiFlashcards = await generateGeminiFlashcards(topic, subject._id, decoded.userId);
          if (aiFlashcards && aiFlashcards.length > 0) {
            console.log(`Generated ${aiFlashcards.length} AI flashcards for topic: ${topic.title}`);
            generatedFlashcards.push(...aiFlashcards);
          } else {
            console.log(`Using fallback generation for topic: ${topic.title}`);
            // fallback to basic
            const fallback = await generateFlashcardsForTopic(topic, subject._id, decoded.userId);
            generatedFlashcards.push(...fallback);
          }
        }
      } else {
        console.log(`No topics found in ${subject.name}, generating basic flashcards`);
        // Generate basic flashcards for subject
        const basicFlashcards = await generateBasicFlashcards(subject, decoded.userId);
        generatedFlashcards.push(...basicFlashcards);
      }
    }

    console.log(`Total flashcards generated: ${generatedFlashcards.length}`);

    // Save flashcards to database
    if (generatedFlashcards.length > 0) {
      await Flashcard.insertMany(generatedFlashcards);
      console.log(`Saved ${generatedFlashcards.length} flashcards to database`);
    }

    return NextResponse.json({
      message: `Generated ${generatedFlashcards.length} flashcards`,
      count: generatedFlashcards.length,
    });
  } catch (error) {
    console.error('Generate flashcards error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateGeminiFlashcards(topic: any, subjectId: string, userId: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('No Gemini API key found, using fallback generation');
      return [];
    }

    console.log(`Generating Gemini flashcards for topic: ${topic.title}`);
    
    const prompt = `Generate 3 high-quality flashcards for a computer science student studying "${topic.title}". 

Topic content: ${topic.content}

Requirements:
- Each flashcard should be challenging but appropriate for a CS student
- Questions should test understanding, not just memorization
- Answers should be clear and educational
- Return ONLY a valid JSON array with this exact format:
[
  {
    "question": "What is...",
    "answer": "The answer is..."
  }
]

Do not include any other text, just the JSON array.`;

    console.log('Sending request to Gemini API...');
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    console.log(`Gemini API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return [];
    }

    const data = await response.json();
    console.log('Gemini API response received');
    
    // Gemini returns the answer in data.candidates[0].content.parts[0].text
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.log('No text in Gemini response');
      return [];
    }

    console.log('Gemini response text:', text.substring(0, 200) + '...');

    // Try to parse the JSON array from the response
    let cards = [];
    try {
      // Clean the text - remove any markdown formatting
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      cards = JSON.parse(cleanText);
      console.log(`Successfully parsed ${cards.length} cards from Gemini`);
    } catch (parseError) {
      console.log('Failed to parse JSON from Gemini, trying fallback parsing...');
      // fallback: try to extract Q&A pairs from text
      const matches = text.match(/Q:.*?A:.*?(?=Q:|$)/gs);
      if (matches) {
        cards = matches.map(pair => {
          const q = pair.match(/Q:(.*?)A:/s)?.[1]?.trim() || '';
          const a = pair.match(/A:(.*)/s)?.[1]?.trim() || '';
          return { question: q, answer: a };
        });
        console.log(`Extracted ${cards.length} cards using fallback parsing`);
      }
    }

    const validCards = cards.filter(card => card.question && card.answer);
    console.log(`Generated ${validCards.length} valid flashcards from Gemini`);

    return validCards.map(card => ({
      userId,
      subjectId,
      question: card.question,
      answer: card.answer,
      difficulty: topic.difficulty || 'Medium',
      isGenerated: true,
    }));
  } catch (e) {
    console.error('Gemini flashcard generation error:', e);
    return [];
  }
}

async function generateFlashcardsForTopic(topic: any, subjectId: string, userId: string) {
  // This is a simplified version. In production, you'd use Groq/Gemini API
  const flashcards = [];
  
  // Basic question generation based on topic
  const questions = [
    {
      question: `What is the main concept of ${topic.title}?`,
      answer: topic.content || `${topic.title} is an important concept in this subject.`,
      difficulty: topic.difficulty || 'Medium',
    },
    {
      question: `Explain the key points of ${topic.title}`,
      answer: topic.content || `Key points include understanding the fundamentals of ${topic.title}.`,
      difficulty: topic.difficulty || 'Medium',
    },
  ];

  for (const q of questions) {
    flashcards.push({
      userId,
      subjectId,
      question: q.question,
      answer: q.answer,
      difficulty: q.difficulty,
      isGenerated: true,
    });
  }

  return flashcards;
}

async function generateBasicFlashcards(subject: any, userId: string) {
  const flashcards = [];
  
  // Generate basic flashcards for subject without topics
  const basicQuestions = [
    {
      question: `What is ${subject.name}?`,
      answer: subject.description || `${subject.name} is an important subject for learning.`,
      difficulty: subject.difficulty || 'Medium',
    },
    {
      question: `Why is ${subject.name} important?`,
      answer: `${subject.name} is important because it helps build foundational knowledge in this area.`,
      difficulty: subject.difficulty || 'Medium',
    },
  ];

  for (const q of basicQuestions) {
    flashcards.push({
      userId,
      subjectId: subject._id,
      question: q.question,
      answer: q.answer,
      difficulty: q.difficulty,
      isGenerated: true,
    });
  }

  return flashcards;
}