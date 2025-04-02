import mongoose from "mongoose";

const testcaseSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true
    },
    expected_output: {
        type: String,
        required: true
    },
    is_hidden: {
        type: Boolean,
        default: false
    }
});

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true
    },
    constraints: {
        type: String
    },
    starterCodes: {
        python: String,
        cpp: String,
        java: String
    },
    testCases: [testcaseSchema],
    created_at: { type: Date, default: Date.now },
})

const Problems = mongoose.model("Problem", problemSchema);

export default Problems;