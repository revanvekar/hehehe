"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, Brain, Check, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const response = await fetch('/api/flashcards', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFlashcards(data);
        setSessionStats(prev => ({ ...prev, total: data.length }));
      }
    } catch (error) {
      toast.error('Failed to load flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFlashcards = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        toast.success('AI flashcards generated successfully!');
        loadFlashcards();
      } else {
        toast.error('Failed to generate flashcards');
      }
    } catch (error) {
      toast.error('Failed to generate flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));

    // Update flashcard performance
    updateFlashcardPerformance(flashcards[currentIndex]._id, isCorrect);

    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Session complete
      toast.success('Study session complete!');
    }
  };

  const updateFlashcardPerformance = async (flashcardId: string, isCorrect: boolean) => {
    try {
      await fetch(`/api/flashcards/${flashcardId}/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isCorrect })
      });
    } catch (error) {
      console.error('Failed to update flashcard performance:', error);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0, total: flashcards.length });
  };

  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Flashcards</h1>
            <p className="text-muted-foreground mt-2">
              Practice with AI-generated flashcards and track your progress
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={generateFlashcards} disabled={isLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Cards
            </Button>
            {flashcards.length > 0 && (
              <Button variant="outline" onClick={resetSession}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Session
              </Button>
            )}
          </div>
        </div>

        {flashcards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Brain className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-2">No flashcards yet</h2>
            <p className="text-muted-foreground mb-6">
              Generate AI-powered flashcards from your subjects and notes
            </p>
            <Button onClick={generateFlashcards} size="lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Your First Flashcards
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Study Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Card {currentIndex + 1} of {flashcards.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">✓ {sessionStats.correct}</span>
                      <span className="text-red-600">✗ {sessionStats.incorrect}</span>
                    </div>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            {/* Flashcard */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-2xl h-96 perspective-1000">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 90 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <div 
                      className={`flashcard-flip ${isFlipped ? 'flipped' : ''} w-full h-full cursor-pointer`}
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      {/* Front */}
                      <Card className="flashcard-front border-2 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                        <CardHeader className="text-center">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">Question</Badge>
                            <Badge className={
                              currentCard?.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              currentCard?.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {currentCard?.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <p className="text-xl font-medium leading-relaxed">
                              {currentCard?.question}
                            </p>
                            <p className="text-sm text-muted-foreground mt-4">
                              Click to reveal answer
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Back */}
                      <Card className="flashcard-back border-2 shadow-lg bg-primary/5 h-full">
                        <CardHeader className="text-center">
                          <div className="flex items-center justify-between">
                            <Badge>Answer</Badge>
                            <Badge className={
                              currentCard?.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              currentCard?.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {currentCard?.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <p className="text-lg leading-relaxed">
                              {currentCard?.answer}
                            </p>
                            <div className="flex gap-4 mt-8">
                              <Button 
                                variant="outline" 
                                size="lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnswer(false);
                                }}
                                className="border-red-200 hover:bg-red-50"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Incorrect
                              </Button>
                              <Button 
                                size="lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnswer(true);
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Correct
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Session Complete */}
            {currentIndex >= flashcards.length - 1 && (sessionStats.correct + sessionStats.incorrect) === flashcards.length && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎉</div>
                      <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
                      <p className="text-muted-foreground mb-4">
                        You got {sessionStats.correct} out of {sessionStats.total} correct
                      </p>
                      <div className="flex justify-center gap-4">
                        <Button onClick={resetSession}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Study Again
                        </Button>
                        <Button variant="outline" onClick={generateFlashcards}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate More
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}