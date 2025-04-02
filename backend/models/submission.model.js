import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Wrong Answer", "Runtime Error", "Time Limit Exceeded"],
        default: "Pending"
    },
    executionTime: {
        type: Number
    },
    submitted_at: {
        type: Date,
        default: Date.now
    },
});

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;