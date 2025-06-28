"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function SubjectDetails() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.id as string;

  const [subject, setSubject] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [loadingSubject, setLoadingSubject] = useState(true);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");

  useEffect(() => {
    const fetchSubject = async () => {
      setLoadingSubject(true);
      try {
        const response = await fetch(`/api/subjects/${subjectId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const found = await response.json();
          setSubject(found);
        }
      } catch (e) {
        toast.error("Failed to load subject");
      } finally {
        setLoadingSubject(false);
      }
    };
    if (subjectId) fetchSubject();
  }, [subjectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`/api/subjects/${subjectId}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (response.ok) {
        const updated = await response.json();
        setSubject(updated);
        setFile(null);
        toast.success("File uploaded and parsed!");
        // Trigger flashcard generation
        await fetch('/api/flashcards/generate', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        toast.error("Failed to upload file");
      }
    } catch (e) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    setChatHistory((prev) => [...prev, { role: "user", content: chatInput }]);
    setChatInput("");
    try {
      const response = await fetch(`/api/subjects/${subjectId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ question: chatInput })
      });
      if (response.ok) {
        const data = await response.json();
        setChatHistory((prev) => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        setChatHistory((prev) => [...prev, { role: "assistant", content: "Failed to get answer from AI." }]);
      }
    } catch (e) {
      setChatHistory((prev) => [...prev, { role: "assistant", content: "Failed to get answer from AI." }]);
    }
  };

  if (loadingSubject) {
    return <DashboardLayout><div className="p-8 text-center">Loading subject...</div></DashboardLayout>;
  }
  if (!subject) {
    return <DashboardLayout><div className="p-8 text-center text-red-500">Subject not found.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Subject Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {subject.name}
            </CardTitle>
            <p className="text-muted-foreground mt-2">{subject.description}</p>
          </CardHeader>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Notes (.txt, .pdf)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center">
              <Input type="file" accept=".txt,.pdf" onChange={handleFileChange} />
              <Button onClick={handleFileUpload} disabled={!file || uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Uploaded Files</h4>
              <ul className="space-y-1">
                {subject.files && subject.files.length > 0 ? (
                  subject.files.map((f: any, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {f.name}
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No files uploaded yet.</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Add Topic */}
        <Card>
          <CardHeader>
            <CardTitle>Add a Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newTopicTitle.trim() || !newTopicContent.trim()) return;
                try {
                  const response = await fetch(`/api/subjects/${subjectId}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                      topic: {
                        title: newTopicTitle,
                        content: newTopicContent
                      }
                    })
                  });
                  if (response.ok) {
                    const updated = await response.json();
                    setSubject(updated);
                    setNewTopicTitle("");
                    setNewTopicContent("");
                    toast.success("Topic added!");
                  } else {
                    toast.error("Failed to add topic");
                  }
                } catch {
                  toast.error("Failed to add topic");
                }
              }}
            >
              <div>
                <Label>Title</Label>
                <Input
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  placeholder="e.g. Binary Search Trees"
                  required
                />
              </div>
              <div>
                <Label>Content</Label>
                <textarea
                  className="w-full border rounded p-2 min-h-[80px]"
                  value={newTopicContent}
                  onChange={e => setNewTopicContent(e.target.value)}
                  placeholder="Enter notes or details for this topic..."
                  required
                />
              </div>
              <Button type="submit">Add Topic</Button>
            </form>
          </CardContent>
        </Card>

        {/* Chat about Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Ask AI about your notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-48 overflow-y-auto bg-muted rounded p-3 mb-2">
                {chatHistory.length === 0 && <div className="text-muted-foreground">No conversation yet.</div>}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
                    <span className={msg.role === "user" ? "font-semibold text-primary" : "font-semibold text-purple-700"}>
                      {msg.role === "user" ? "You" : "AI"}:
                    </span> {msg.content}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question about your notes..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleChat()}
                />
                <Button onClick={handleChat} disabled={!chatInput.trim()}>Send</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 