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
          
          // Use ONLY Gemini API for flashcard generation
          const aiFlashcards = await generateGeminiFlashcards(topic, subject._id, decoded.userId);
          if (aiFlashcards && aiFlashcards.length > 0) {
            console.log(`Generated ${aiFlashcards.length} AI flashcards for topic: ${topic.title}`);
            generatedFlashcards.push(...aiFlashcards);
          } else {
            console.log(`No flashcards generated for topic: ${topic.title} - Gemini failed`);
          }
        }
      } else {
        console.log(`No topics found in ${subject.name} - skipping`);
      }
    }

    console.log(`Total flashcards generated: ${generatedFlashcards.length}`);

    // Save flashcards to database
    if (generatedFlashcards.length > 0) {
      await Flashcard.insertMany(generatedFlashcards);
      console.log(`Saved ${generatedFlashcards.length} flashcards to database`);
    } else {
      return NextResponse.json(
        { message: 'No flashcards generated. Check if you have topics in your subjects and if Gemini API key is configured.' },
        { status: 400 }
      );
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
    console.log('🔍 Checking Gemini API key...');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
    
    if (!apiKey) {
      console.log('❌ No Gemini API key found in environment variables');
      console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
      return [];
    }

    console.log(`🚀 Generating Gemini flashcards for topic: ${topic.title}`);
    console.log(`Topic content: ${topic.content || 'No content'}`);
    
    const prompt = `You are an expert educator creating flashcards for a student studying "${topic.title}".

Topic content: ${topic.content || 'No specific content provided'}

Create 3 high-quality flashcards that:
1. Test deep understanding, not just memorization
2. Are challenging but appropriate for the topic
3. Have clear, educational answers
4. Cover different aspects of the topic

IMPORTANT: Return ONLY a valid JSON array with this exact format:
[
  {
    "question": "Your question here?",
    "answer": "Your detailed answer here."
  }
]

Do not include any other text, explanations, or markdown formatting. Just the JSON array.`;

    console.log('📤 Sending request to Gemini API...');
    console.log('Request URL:', 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + apiKey.substring(0, 10) + '...');
    
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    console.log(`📥 Gemini API response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error response:', errorText);
      return [];
    }

    const data = await response.json();
    console.log('✅ Gemini API response received');
    console.log('Response structure:', Object.keys(data));
    
    // Gemini returns the answer in data.candidates[0].content.parts[0].text
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.log('❌ No text in Gemini response');
      console.log('Full response:', JSON.stringify(data, null, 2));
      return [];
    }

    console.log('📝 Gemini response text (first 500 chars):', text.substring(0, 500) + '...');

    // Try to parse the JSON array from the response
    let cards = [];
    try {
      // Clean the text - remove any markdown formatting
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log('🧹 Cleaned text:', cleanText.substring(0, 200) + '...');
      
      // Try to fix common JSON issues
      let fixedText = cleanText;
      
      // Remove trailing commas before closing brackets/braces
      fixedText = fixedText.replace(/,(\s*[}\]])/g, '$1');
      
      // Try parsing the fixed JSON
      cards = JSON.parse(fixedText);
      console.log(`✅ Successfully parsed ${cards.length} cards from Gemini`);
    } catch (parseError) {
      console.log('❌ Failed to parse JSON from Gemini, trying additional fixes...');
      console.log('Parse error:', parseError);
      
      // Additional JSON fixing attempts
      try {
        let fixedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // More aggressive JSON cleaning
        fixedText = fixedText.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
        fixedText = fixedText.replace(/,\s*}/g, '}'); // Remove trailing commas in objects
        fixedText = fixedText.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
        
        // Try to extract just the array part if there's extra text
        const arrayMatch = fixedText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          fixedText = arrayMatch[0];
        }
        
        cards = JSON.parse(fixedText);
        console.log(`✅ Successfully parsed ${cards.length} cards after additional fixes`);
      } catch (secondError) {
        console.log('❌ Still failed to parse JSON, trying manual extraction...');
        console.log('Second parse error:', secondError);
        console.log('Raw text:', text);
        
        // Manual extraction as last resort
        const questionMatches = text.match(/"question":\s*"([^"]+)"/g);
        const answerMatches = text.match(/"answer":\s*"([^"]+)"/g);
        
        if (questionMatches && answerMatches) {
          cards = questionMatches.map((qMatch: string, index: number) => {
            const question = qMatch.match(/"question":\s*"([^"]+)"/)?.[1] || '';
            const answer = answerMatches[index]?.match(/"answer":\s*"([^"]+)"/)?.[1] || '';
            return { question, answer };
          });
          console.log(`✅ Manually extracted ${cards.length} cards`);
        }
      }
    }

    const validCards = cards.filter((card: any) => card.question && card.answer);
    console.log(`✅ Generated ${validCards.length} valid flashcards from Gemini`);

    return validCards.map((card: any) => ({
      userId,
      subjectId,
      question: card.question,
      answer: card.answer,
      difficulty: topic.difficulty || 'Medium',
      isGenerated: true,
    }));
  } catch (e) {
    console.error('❌ Gemini flashcard generation error:', e);
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