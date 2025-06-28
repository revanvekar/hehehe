"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, FileText, Clock, Brain } from 'lucide-react';
import { toast } from 'sonner';

// TODO: Create app/subjects/[id]/page.tsx for subject details, file upload, and chat features

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    description: '',
    difficulty: 'Medium'
  });
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  };

  const createSubject = async () => {
    if (!newSubject.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    setIsCreating(true);
    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append('name', newSubject.name);
        formData.append('description', newSubject.description);
        formData.append('difficulty', newSubject.difficulty);
        formData.append('file', file);
        response = await fetch('/api/subjects', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
      } else {
        response = await fetch('/api/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(newSubject)
        });
      }

      if (response.ok) {
        const subject = await response.json();
        setSubjects([...subjects, subject]);
        setNewSubject({ name: '', description: '', difficulty: 'Medium' });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setDialogOpen(false);
        toast.success('Subject created successfully!');
        // Trigger flashcard generation
        await fetch('/api/flashcards/generate', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        toast.error('Failed to create subject');
      }
    } catch (error) {
      toast.error('Failed to create subject');
    } finally {
      setIsCreating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Subjects</h1>
            <p className="text-muted-foreground mt-2">
              Organize your learning into subjects and topics
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Subject</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Data Structures & Algorithms"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the subject"
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={newSubject.difficulty} onValueChange={(value) => setNewSubject({ ...newSubject, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="file">Upload Notes (.txt, .pdf)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".txt,.pdf"
                    ref={fileInputRef}
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                </div>
                <Button onClick={createSubject} disabled={isCreating} className="w-full">
                  {isCreating ? 'Creating...' : 'Create Subject'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subjects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : subjects.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {subjects.map((subject: any) => (
              <motion.div key={subject._id} variants={itemVariants}>
                <Card 
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                  onClick={() => router.push(`/subjects/${subject._id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{subject.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {subject.description || 'No description'}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getDifficultyColor(subject.difficulty)}>
                        {subject.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{subject.topics?.length || 0} topics</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="h-4 w-4" />
                        <span>{subject.flashcards?.length || 0} cards</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(subject.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <BookOpen className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-2">No subjects yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first subject to start organizing your learning materials
            </p>
            <Button onClick={() => setDialogOpen(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Subject
            </Button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}