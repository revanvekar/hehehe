"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RefreshCw, BookOpen, Zap, Target } from 'lucide-react';

interface FunFact {
  title: string;
  content: string;
  category: string;
  difficulty: string;
}

export default function Curiosity() {
  const [currentFact, setCurrentFact] = useState<FunFact | null>(null);
  const [facts, setFacts] = useState<FunFact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const funFacts: FunFact[] = [
    {
      title: "The Forgetting Curve",
      content: "Hermann Ebbinghaus discovered that we forget 50% of new information within an hour, and 90% within a week without review.",
      category: "Psychology",
      difficulty: "Medium"
    },
    {
      title: "Neuroplasticity",
      content: "Your brain can reorganize and form new neural connections throughout your life. This means you can literally rewire your brain through learning!",
      category: "Neuroscience",
      difficulty: "Easy"
    },
    {
      title: "The Spacing Effect",
      content: "Distributed practice (spaced repetition) is more effective than massed practice (cramming). Space out your study sessions for better retention.",
      category: "Learning",
      difficulty: "Easy"
    },
    {
      title: "Working Memory Limit",
      content: "The average person can hold 7±2 items in their working memory at once. This is why phone numbers are typically 7 digits long.",
      category: "Cognitive Science",
      difficulty: "Medium"
    },
    {
      title: "The Testing Effect",
      content: "Actively recalling information (like using flashcards) is more effective for learning than passive review like re-reading notes.",
      category: "Learning",
      difficulty: "Easy"
    },
    {
      title: "Sleep and Memory",
      content: "Sleep plays a crucial role in memory consolidation. During sleep, your brain transfers information from short-term to long-term memory.",
      category: "Neuroscience",
      difficulty: "Medium"
    },
    {
      title: "The Feynman Technique",
      content: "You truly understand something when you can explain it simply. Try explaining concepts as if teaching a child to test your understanding.",
      category: "Learning",
      difficulty: "Easy"
    },
    {
      title: "Interleaving Practice",
      content: "Mixing different types of problems or topics in a single study session improves learning compared to studying one topic at a time.",
      category: "Learning",
      difficulty: "Hard"
    },
    {
      title: "The Generation Effect",
      content: "Information that you generate yourself is better remembered than information you simply read. Try to create your own examples!",
      category: "Psychology",
      difficulty: "Medium"
    },
    {
      title: "Dual Coding Theory",
      content: "Information is better remembered when it's encoded both verbally and visually. Combine text with diagrams, charts, or mental images.",
      category: "Cognitive Science",
      difficulty: "Hard"
    }
  ];

  useEffect(() => {
    setFacts(funFacts);
    setCurrentFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
  }, []);

  const getNewFact = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newFact = funFacts[Math.floor(Math.random() * funFacts.length)];
      setCurrentFact(newFact);
      setIsLoading(false);
    }, 500);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Psychology': return <Target className="h-4 w-4" />;
      case 'Neuroscience': return <Zap className="h-4 w-4" />;
      case 'Learning': return <BookOpen className="h-4 w-4" />;
      case 'Cognitive Science': return <Lightbulb className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold gradient-text mb-4">Curiosity Hub</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover fascinating facts about learning, memory, and the science of knowledge
            </p>
          </div>
        </motion.div>

        {/* Daily Fact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Lightbulb className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold">Today's Learning Fact</h2>
              </div>
              <Button 
                onClick={getNewFact} 
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="mx-auto"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Get New Fact'}
              </Button>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {currentFact && (
                <motion.div
                  key={currentFact.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {getCategoryIcon(currentFact.category)}
                      {currentFact.category}
                    </Badge>
                    <Badge className={getDifficultyColor(currentFact.difficulty)}>
                      {currentFact.difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    {currentFact.title}
                  </h3>
                  <p className="text-lg leading-relaxed max-w-2xl mx-auto">
                    {currentFact.content}
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* All Facts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Explore All Facts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facts.map((fact, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getCategoryIcon(fact.category)}
                        {fact.category}
                      </Badge>
                      <Badge className={getDifficultyColor(fact.difficulty)}>
                        {fact.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{fact.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {fact.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Learning Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">💡 Quick Learning Tips</CardTitle>
              <CardDescription>Apply these evidence-based strategies to your study routine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-800">📚 Active Recall</h4>
                  <p className="text-sm text-blue-700">Test yourself regularly instead of just re-reading notes</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-800">⏰ Spaced Repetition</h4>
                  <p className="text-sm text-purple-700">Review material at increasing intervals for better retention</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-800">🎯 Focused Sessions</h4>
                  <p className="text-sm text-green-700">Study in focused 25-minute blocks with breaks</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-800">🗣️ Explain to Others</h4>
                  <p className="text-sm text-orange-700">Teach concepts to someone else to test understanding</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}