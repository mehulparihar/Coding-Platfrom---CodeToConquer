import mongoose from "mongoose";

const battleSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Battle title
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true }, // Problem to solve

  participants: [{
    user : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true }, // User ID
    code: { type: String, default: "" }, // Submitted code
    language: { type: String, default: "cpp" }, // Programming language
    solved: { type: Boolean, default: false }, // If the problem is solved
    executionTime: { type: Number, default: null }, // Execution time in ms
    submissionStatus: { type: String, enum: ['pending', 'running', 'failed', 'passed'], default: 'pending' }, // Status of submission
    completionTime: { type: Number, default: null } // Time taken to solve the problem
  }],
  difficulty : { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  maxParticipants: { type: Number, required: true, default: 2 }, // Maximum users allowed in the battle
  currentParticipants: { type: Number, default: 0 }, // Current users in the battle
  teamA: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teamB: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  battleType: { type: String, enum: ['1v1', 'Free-for-all', 'Team'], default: '1v1' }, // Type of battle
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },

  startTime: { type: Date, default: null }, // Start time
  endTime: { type: Date, default: null }, // End time
  status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' }, // Battle status
  duration : {type: Date, default: null},
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Winner
  score: { type: Number, default: 0 }, // Score of the winner
  battleCode: { type: String, unique: true, sparse: true }, // Used for private battles
  messages : [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true }); // Auto-generate createdAt and updatedAt

const Battle = mongoose.model("Battle", battleSchema);

export default Battle;
