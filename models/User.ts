import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  streakDays: {
    type: Number,
    default: 0,
  },
  todayRevised: {
    type: Number,
    default: 0,
  },
  lastDailyEntry: {
    type: Date,
  },
  preferences: {
    reminderTime: {
      type: String,
      default: '09:00',
    },
    studyGoal: {
      type: Number,
      default: 30, // minutes
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);