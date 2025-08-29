import mongoose from "mongoose";

const HabitSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    target: { type: Number, default: 1 }, // How many times per frequency period
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    lastCompleted: Date,
    isActive: { type: Boolean, default: true },
    category: String
}, { timestamps: true });

const MoodEntrySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    mood: { type: String, enum: ['terrible', 'bad', 'neutral', 'good', 'excellent'], required: true },
    notes: String,
    activities: [String]
});

const GoalSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    targetDate: Date,
    isCompleted: { type: Boolean, default: false },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    category: String
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    avatar: String,
    provider: { type: String, enum: ['google', 'local'], default: 'local' },
    providerId: { type: String },
    tokenVersion: { type: Number, default: 0 },
    settings: {
        theme: { type: String, default: 'light' },
        notifications: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: true },
    },
    habits: [HabitSchema],
    moodEntries: [MoodEntrySchema],
    goals: [GoalSchema],
    lastActive: Date
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
