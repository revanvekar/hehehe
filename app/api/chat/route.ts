import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
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

    const { message } = await request.json();

    // This is a simplified AI response. In production, you'd integrate with:
    // - Groq API for general AI responses
    // - Ollama for local AI responses
    // - Custom logic for subject-specific responses
    
    const response = generateAIResponse(message);

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('data structure')) {
    return "Data structures are ways of organizing and storing data in a computer so that it can be accessed and modified efficiently. Common examples include arrays, linked lists, stacks, queues, trees, and graphs. Each has its own strengths and use cases. Would you like me to explain any specific data structure in detail?";
  }
  
  if (message.includes('algorithm')) {
    return "Algorithms are step-by-step procedures for solving problems or performing tasks. They're fundamental to computer science and programming. Key concepts include time complexity (how long it takes) and space complexity (how much memory it uses). Some important algorithms include sorting (like quicksort), searching (like binary search), and graph algorithms. What specific algorithm would you like to learn about?";
  }
  
  if (message.includes('study plan') || message.includes('study tips')) {
    return "Here's an effective study plan strategy:\n\n1. **Active Recall**: Test yourself regularly instead of just re-reading\n2. **Spaced Repetition**: Review material at increasing intervals\n3. **Pomodoro Technique**: Study in 25-minute focused blocks\n4. **Feynman Technique**: Explain concepts simply to test understanding\n5. **Practice Problems**: Apply concepts through exercises\n\nWould you like me to create a specific study schedule for any subject?";
  }
  
  if (message.includes('recursion')) {
    return "Recursion is a programming technique where a function calls itself to solve a problem. It has two essential components:\n\n1. **Base Case**: The condition that stops the recursion\n2. **Recursive Case**: The function calling itself with a modified parameter\n\nExample: Calculating factorial\n- Base case: factorial(0) = 1\n- Recursive case: factorial(n) = n × factorial(n-1)\n\nRecursion is useful for problems that can be broken down into similar smaller problems, like tree traversal or mathematical sequences.";
  }
  
  if (message.includes('design pattern')) {
    return "Design patterns are reusable solutions to common problems in software design. They're like templates that help you write better, more maintainable code. Common patterns include:\n\n1. **Singleton**: Ensures only one instance of a class\n2. **Factory**: Creates objects without specifying their exact class\n3. **Observer**: Defines a one-to-many dependency between objects\n4. **Strategy**: Defines a family of algorithms and makes them interchangeable\n\nThese patterns help solve recurring design problems and improve code organization. Which pattern interests you most?";
  }
  
  if (message.includes('help') || message.includes('explain')) {
    return "I'm here to help you with your studies! I can:\n\n• Explain complex concepts in simple terms\n• Create personalized study plans\n• Answer questions about your subjects\n• Provide practice problems and solutions\n• Give study tips and techniques\n• Help with exam preparation\n\nWhat specific topic would you like to explore? Feel free to ask about programming, algorithms, data structures, or any other subject you're studying.";
  }
  
  // Default response
  return "That's an interesting question! While I can provide general guidance on study topics, I'd recommend being more specific about what you'd like to learn. For example, you could ask about:\n\n• Specific programming concepts\n• Study strategies\n• Problem-solving techniques\n• Subject explanations\n\nWhat particular topic would you like to dive deeper into?";
}