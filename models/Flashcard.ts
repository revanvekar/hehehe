import mongoose from 'mongoose';

const FlashcardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  nextReview: {
    type: Date,
    default: Date.now,
  },
  interval: {
    type: Number,
    default: 1, // days
  },
  easinessFactor: {
    type: Number,
    default: 2.5,
  },
  repetitions: {
    type: Number,
    default: 0,
  },
  isGenerated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Flashcard || mongoose.model('Flashcard', FlashcardSchema);