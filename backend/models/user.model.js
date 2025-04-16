import bcrypt from "bcryptjs"
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        minlength: [6, "Password must be at least 6 character long"],
        required: [true, "Password is required"]
    },
    score: {
        type: Number,
        default: 0
    },
    dailyScore: {
        type: Number,
        default: 0
    },
    weeklyScore: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: ["coder", "admin"],
        default: "coder"
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    lastCompleted: {
        type: Date
    },
    isCompletedToday: {
        type: Boolean,
        default: false
    },
    problemsSolved: {
        type: Number,
        default: 0
    },
    battleWon: {
        type: Number,
        default: 0
    },
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission'
    }]
}, {
    timestamps: true
});

// hashing the password after creating model
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;