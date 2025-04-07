import mongoose from "mongoose";

const battleSchema = new mongoose.Schema({
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    participants: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      code: String,
      language: String,
      solved: { type: Boolean, default: false },
      completionTime: Number
    }],
    title : {type : String},
    startTime: Date,
    endTime: Date,
    status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  });

const Battle = mongoose.model("Battle", battleSchema);

export default Battle;
  