"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, BookOpen, Zap, Users, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleAuth = async (email: string, password: string, isSignup: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/${isSignup ? 'signup' : 'signin'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success(isSignup ? 'Account created successfully!' : 'Welcome back!');
        router.push('/dashboard');
      } else {
        toast.error(data.message || 'Authentication failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">RevisionAI</span>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Your AI-Powered
              <span className="gradient-text block">Study Companion</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your learning with personalized flashcards, intelligent revision scheduling, 
              and AI-powered insights. Study smarter, not harder.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>AI Flashcards</CardTitle>
                <CardDescription>
                  Automatically generate flashcards from your notes using advanced AI
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Smart Organization</CardTitle>
                <CardDescription>
                  Organize subjects, upload files, and track your learning progress
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Spaced Repetition</CardTitle>
                <CardDescription>
                  Optimize retention with scientifically-backed revision scheduling
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Auth Section */}
      <section className="px-6 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-0 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Get Started</CardTitle>
                <CardDescription>
                  Join thousands of students improving their learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin">
                    <AuthForm onSubmit={(email, password) => handleAuth(email, password, false)} isLoading={isLoading} />
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <AuthForm onSubmit={(email, password) => handleAuth(email, password, true)} isLoading={isLoading} isSignup />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function AuthForm({ onSubmit, isLoading, isSignup = false }: {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
  isSignup?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Sign In')}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}