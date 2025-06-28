import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Subject from '@/models/Subject';
import pdfParse from 'pdf-parse';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    await connectDB();
    const subjectId = req.query.id as string;
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error parsing form', error: String(err) });
      }
      const file = files.file;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      let text = '';
      let fileName = file.originalFilename || file.newFilename || 'uploaded';
      let fileType = file.mimetype || 'application/octet-stream';
      const filePath = file.filepath || file.path;
      try {
        const buffer = fs.readFileSync(filePath);
        if (fileType === 'application/pdf') {
          const data = await pdfParse(buffer);
          text = data.text;
        } else if (fileType === 'text/plain') {
          text = buffer.toString('utf-8');
        }
      } catch (parseErr) {
        return res.status(500).json({ message: 'Failed to parse file', error: String(parseErr) });
      }
      const subject = await Subject.findOne({ _id: subjectId, userId: decoded.userId });
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      if (text) {
        subject.topics.push({
          title: fileName,
          content: text,
          difficulty: subject.difficulty || 'Medium',
        });
      }
      subject.files.push({
        name: fileName,
        type: fileType,
        uploadedAt: new Date(),
      });
      await subject.save();
      return res.status(200).json(subject);
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
} 