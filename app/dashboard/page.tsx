"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Clock, TrendingUp, Plus, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [dailyPrompt, setDailyPrompt] = useState('');
  const [todaysTopic, setTodaysTopic] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalFlashcards: 0,
    streakDays: 0,
    todayRevised: 0
  });
  const [funFact, setFunFact] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    loadDashboardData();
    loadFunFact();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
        setStats(data.stats || stats);
        setDailyPrompt(data.dailyPrompt || "What did you learn today?");
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadFunFact = () => {
    const facts = [
      "The human brain contains approximately 86 billion neurons!",
      "Studies show that handwriting notes improves memory retention by 50%.",
      "The forgetting curve shows we forget 50% of new information within an hour.",
      "Spaced repetition can improve long-term retention by up to 200%.",
      "Your brain uses 20% of your body's total energy consumption.",
      "The average person can only hold 7±2 items in their working memory."
    ];
    setFunFact(facts[Math.floor(Math.random() * facts.length)]);
  };

  const handleDailyPromptSubmit = async () => {
    if (!todaysTopic.trim()) return;

    try {
      const response = await fetch('/api/daily-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ topic: todaysTopic })
      });

      if (response.ok) {
        toast.success('Great! Your daily learning has been recorded.');
        setTodaysTopic('');
        loadDashboardData();
      }
    } catch (error) {
      toast.error('Failed to save your daily learning.');
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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Welcome back{user?.name ? `, ${user.name}` : ''}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Ready to continue your learning journey?
              </p>
            </div>
            <Button onClick={() => router.push('/subjects')} className="hidden md:flex">
              <Plus className="mr-2 h-4 w-4" />
              New Subject
            </Button>
          </div>
        </motion.div>

        {/* Daily Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {dailyPrompt}
              </CardTitle>
              <CardDescription>
                Keep your learning streak alive by adding something new you learned today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Learned about binary search trees..."
                  value={todaysTopic}
                  onChange={(e) => setTodaysTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDailyPromptSubmit()}
                />
                <Button onClick={handleDailyPromptSubmit} disabled={!todaysTopic.trim()}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="flex items-center p-6">
                <BookOpen className="h-8 w-8 text-primary mr-4" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalSubjects}</p>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="flex items-center p-6">
                <Brain className="h-8 w-8 text-purple-500 mr-4" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalFlashcards}</p>
                  <p className="text-sm text-muted-foreground">Flashcards</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="flex items-center p-6">
                <TrendingUp className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <p className="text-2xl font-bold">{stats.streakDays}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="flex items-center p-6">
                <Clock className="h-8 w-8 text-orange-500 mr-4" />
                <div>
                  <p className="text-2xl font-bold">{stats.todayRevised}</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card onClick={() => router.push('/flashcards')} className="cursor-pointer hover:bg-purple-50 transition-colors">
              <CardContent className="flex items-center p-6">
                <Brain className="h-8 w-8 text-purple-700 mr-4" />
                <div>
                  <p className="text-2xl font-bold">Study</p>
                  <p className="text-sm text-muted-foreground">Flashcards</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Subjects and Fun Fact */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Subjects */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Subjects</CardTitle>
                <CardDescription>
                  Continue studying your active subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects.length > 0 ? (
                    subjects.slice(0, 3).map((subject: any, index: number) => (
                      <motion.div
                        key={subject._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/subjects/${subject._id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{subject.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {subject.topics?.length || 0} topics
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {subject.difficulty || 'Medium'}
                        </Badge>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No subjects yet. Create your first subject to get started!</p>
                      <Button className="mt-4" onClick={() => router.push('/subjects')}>
                        Create Subject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Fun Fact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Did You Know?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{funFact}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 text-yellow-700 hover:text-yellow-800"
                  onClick={loadFunFact}
                >
                  Tell me more!
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}