import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  }],
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submissions: [{
      problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
      code: String,
      passed: Boolean,
      timestamp: Date
    }],
    score: { type: Number, default: 0 }
  }],
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

const Contest = mongoose.model('Contest', contestSchema);

export default Contest;