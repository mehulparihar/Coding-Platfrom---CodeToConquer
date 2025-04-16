import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { contestStore } from '../stores/contestStore';
import { problemStore } from '../stores/problemStore';
import { FiClock, FiUsers, FiCode, FiAward, FiZap, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { userStore } from '../stores/userStore';

const ContestPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { contests, fetchContestById, contest } = contestStore();
    const { problems } = problemStore();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [contestStatus, setContestStatus] = useState('upcoming');
    const { user } = userStore();

    useEffect(() => {
        const loadContest = async () => {
            await fetchContestById(id);
        };
        loadContest();
    }, [id]);

    useEffect(() => {
        const updateTimer = () => {
            if (!contest) return;
            const now = new Date();
            const start = new Date(contest.startTime);
            const end = new Date(contest.endTime);
            
            if (now < start) {
                const diff = start - now;
                setContestStatus('upcoming');
                setTimeLeft(calculateTimeParts(diff));
            } else if (now > end) {
                setContestStatus('ended');
            } else {
                const diff = end - now;
                setContestStatus('active');
                setTimeLeft(calculateTimeParts(diff));
            }
        };

        const interval = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(interval);
    }, [contest]);

    const calculateTimeParts = (ms) => {
        return {
            days: Math.floor(ms / (1000 * 60 * 60 * 24)),
            hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((ms % (1000 * 60)) / 1000)
        };
    };

    if (!contest) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="animate-pulse text-2xl text-gray-400">Loading contest...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Contest Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {contest.title}
                            </h1>
                            <div className="flex items-center gap-4 mt-4 text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <FiClock className="h-5 w-5" />
                                    <span className="font-medium">{contestStatus.charAt(0).toUpperCase() + contestStatus.slice(1)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiUsers className="h-5 w-5" />
                                    <span>{contest.participants.length} Participants</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-xl">
                            <span className="text-white text-sm font-medium px-3 py-1">
                                {Math.floor((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60 * 60))}h
                            </span>
                        </div>
                    </div>

                    {/* Time Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {Object.entries(timeLeft).map(([unit, value]) => (
                            <div key={unit} className="bg-white/70 dark:bg-gray-700/50 backdrop-blur-lg p-4 rounded-xl shadow-sm">
                                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {value.toString().padStart(2, '0')}
                                </div>
                                <div className="text-sm text-gray-500 uppercase mt-1">{unit}</div>
                            </div>
                        ))}
                    </div>

                    {/* Status Banner */}
                    <div className={`p-4 rounded-xl ${
                        contestStatus === 'upcoming' ? 'bg-blue-100/50 dark:bg-blue-900/30' :
                        contestStatus === 'active' ? 'bg-green-100/50 dark:bg-green-900/30' :
                        'bg-gray-100/50 dark:bg-gray-700/30'
                    }`}>
                        <div className="flex items-center gap-3">
                            <FiZap className={`h-6 w-6 ${
                                contestStatus === 'upcoming' ? 'text-blue-500' :
                                contestStatus === 'active' ? 'text-green-500' :
                                'text-gray-500'
                            }`} />
                            <span className="font-medium">
                                {contestStatus === 'upcoming' ? 'Contest starts in' :
                                contestStatus === 'active' ? 'Time remaining' :
                                'Contest has ended'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {(contestStatus === 'active' || contestStatus === 'ended') && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Problems List */}
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6"
                            >
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
                                    <FiCode className="h-7 w-7 text-purple-500" />
                                    Problems to Solve
                                </h2>
                                <div className="space-y-4">
                                    {contest.problems.map((problem, index) => {
                                        const participant = contest?.participants?.find(
                                            p => p.user._id.toString() === user?._id.toString()
                                        );
                                        const isSolved = participant?.submissions?.some(
                                            sub => sub.problem.toString() === problem._id.toString() && sub.passed === true
                                        );

                                        return (
                                            <motion.div
                                                key={problem._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onClick={() => navigate(`/contests/${contest._id}/${problem._id}`)}
                                                className="group bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm p-4 rounded-xl border border-white/30 dark:border-gray-600/50 hover:shadow-lg transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg font-medium text-gray-800 dark:text-white">
                                                                {index + 1}. {problem?.title}
                                                            </span>
                                                            {isSolved && (
                                                                <FiCheckCircle className="h-5 w-5 text-green-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                problem?.difficulty === 'Easy' ? 'bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                                                problem?.difficulty === 'Medium' ? 'bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                                                'bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                            }`}>
                                                                {problem?.difficulty}
                                                            </span>
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                {problem?.solveCount} solves
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/contests/${contest._id}/${problem._id}`);
                                                        }}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                            isSolved 
                                                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg'
                                                        }`}
                                                    >
                                                        {isSolved ? 'Solved' : 'Solve →'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>

                        {/* Live Leaderboard */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 h-fit"
                        >
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
                                <FiAward className="h-7 w-7 text-yellow-500" />
                                Live Leaderboard
                            </h2>
                            <div className="space-y-4">
                                {contest.participants
                                    .sort((a, b) => b.score - a.score)
                                    .slice(0, 5)
                                    .map((participant, index) => (
                                        <div key={participant.user._id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white' :
                                                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white' :
                                                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-yellow-700 text-white' :
                                                    'bg-blue-500 text-white'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800 dark:text-white">
                                                        {participant.user.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Score: {participant.score}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {participant.submissions.length} solves
                                            </div>
                                        </div>
                                    ))}

                                {contest.participants.length > 5 && (
                                    <Link
                                        to={`/contests/${contest._id}/leaderboard`}
                                        className="block text-center p-3 text-blue-500 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                                    >
                                        View Full Leaderboard →
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}

                {contestStatus === 'upcoming' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Contest Description</h2>
                        <div className="prose dark:prose-invert max-w-none">
                            {contest.description}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ContestPage;