import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiCalendar, FiUsers, FiCode, FiAward, FiZap } from 'react-icons/fi';
import { contestStore } from '../stores/contestStore';
import { userStore } from '../stores/userStore';
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const ContestsPage = () => {
    const [filter, setFilter] = useState('all');
    const { getContest, contests } = contestStore();
    
    useEffect(() => {
        getContest();
    }, [getContest]);
    
    const categorizeContests = () => {
        const now = new Date();
        return contests.reduce((acc, contest) => {
            const startTime = new Date(contest.startTime); 
            const endTime = new Date(contest.endTime);
    
            if (endTime.getTime() <= now.getTime()) {
                acc.past.push(contest);
            } else if (startTime.getTime() > now.getTime()) {
                acc.upcoming.push(contest);
            } else {
                acc.active.push(contest);
            }
            return acc;
        }, { upcoming: [], active: [], past: [] });
    };
    
    const { upcoming, active, past } = categorizeContests();
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Hero Header */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-4 bg-white/70 dark:bg-gray-800/70 px-8 py-4 rounded-2xl backdrop-blur-lg shadow-lg mb-6">
                        <FiAward className="h-12 w-12 text-purple-500" />
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Coding Contests
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Compete in thrilling coding battles, climb leaderboards, and <span className="text-blue-500">win amazing prizes</span>
                    </p>
                </motion.div>

                {/* Filter Navigation */}
                <motion.div
                    className="flex gap-4 mb-16 justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {['all', 'active', 'upcoming', 'past'].map((f) => (
                        <motion.button
                            key={f}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                                filter === f
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl'
                                : 'bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-300 shadow-md hover:shadow-lg backdrop-blur-lg'
                            }`}
                        >
                            <FiZap className={`w-5 h-5 ${filter === f ? 'text-yellow-300' : 'text-gray-400'}`} />
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Contest Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(filter === 'all' || filter === 'upcoming') && upcoming.map(contest => (
                        <ContestCard key={contest._id} contest={contest} />
                    ))}

                    {(filter === 'all' || filter === 'active') && active.map(contest => (
                        <ContestCard key={contest._id} contest={contest} />
                    ))}

                    {(filter === 'all' || filter === 'past') && past.map(contest => (
                        <ContestCard key={contest._id} contest={contest} />
                    ))}
                </div>

                {/* Empty State */}
                {contests.length === 0 && (
                    <motion.div
                        className="text-center py-20"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div className="inline-flex flex-col items-center">
                            <div className="text-8xl mb-4 text-gray-200 dark:text-gray-700 animate-pulse">⚔️</div>
                            <h3 className="text-2xl text-gray-500 dark:text-gray-400 mb-2">
                                No contests available
                            </h3>
                            <p className="text-gray-400 dark:text-gray-600">New challenges coming soon!</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const ContestCard = ({ contest }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [progress, setProgress] = useState(0);
    const [contestStatus, setContestStatus] = useState('upcoming');
    const { register } = contestStore();
    const { user } = userStore();
    const navigate = useNavigate();

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const start = new Date(contest.startTime);
            const end = new Date(contest.endTime);
            const totalDuration = end - start;

            if (now < start) {
                const diff = start - now;
                setTimeLeft(calculateTimeParts(diff));
                setProgress(0);
                setContestStatus('upcoming');
            } else if (now > end) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setProgress(100);
                setContestStatus('ended');
            } else {
                const diff = end - now;
                const elapsed = now - start;
                setTimeLeft(calculateTimeParts(diff));
                setProgress((elapsed / totalDuration) * 100);
                setContestStatus('active');
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

    const handleRegister = async (id) => {
        if (!user) return toast.error("Login to register for contest");
        register(id);
    };

    const handleCard = () => navigate(`${contest._id}`);

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ y: -5 }}
            onClick={handleCard}
            className="relative group bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl hover:shadow-3xl transition-all p-8 cursor-pointer backdrop-blur-lg border border-white/30 dark:border-gray-700/50"
        >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl" />

            {/* Status Ribbon */}
            <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-xl font-medium ${
                contestStatus === 'ended' 
                    ? 'bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300'
                    : contestStatus === 'active'
                    ? 'bg-green-100/80 dark:bg-green-900/50 text-green-600 dark:text-green-300'
                    : 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
            }`}>
                {contestStatus.charAt(0).toUpperCase() + contestStatus.slice(1)}
            </div>

            {/* Contest Header */}
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {contest.title}
                </h3>
                <div className="flex items-center gap-2 text-purple-500">
                    <FiCode className="w-5 h-5" />
                    <span className="text-sm font-medium">{contest.problems?.length || 0} Challenges</span>
                </div>
            </div>

            {/* Time Progress */}
            <div className="relative mb-8">
                <div className="h-2 bg-gray-200/70 dark:bg-gray-700/50 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
                <div className="absolute -bottom-5 right-0 text-sm text-gray-500">
                    {Math.round(progress)}% {progress < 100 ? 'completed' : 'ended'}
                </div>
            </div>

            {/* Countdown Grid */}
            <div className="grid grid-cols-4 gap-3 mb-8">
                {Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} className="p-3 bg-white/70 dark:bg-gray-700/50 rounded-xl backdrop-blur-lg text-center shadow-inner">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            {value.toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-gray-500 uppercase mt-1">{unit}</div>
                    </div>
                ))}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <FiCalendar className="w-5 h-5 text-blue-500" />
                    <div>
                        <div className="text-xs text-gray-500">Starts</div>
                        <div className="text-sm font-medium">
                            {new Date(contest.startTime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <FiUsers className="w-5 h-5 text-purple-500" />
                    <div>
                        <div className="text-xs text-gray-500">Participants</div>
                        <div className="text-sm font-medium">{contest.participants?.length || 0}</div>
                    </div>
                </div>
            </div>

            {/* CTA Button */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="mt-8"
                onClick={e => e.stopPropagation()}
            >
                {contest.participants.some(p => p.user === user?._id) ? (
                    <button className="w-full py-3 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-medium cursor-not-allowed shadow-inner">
                        {contestStatus === 'ended' ? 'View Results' : 'Registered ✅'}
                    </button>
                ) : (
                    <button
                        onClick={() => handleRegister(contest._id)}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all shadow-md"
                    >
                        {contestStatus === 'ended' ? 'View Results' : 'Join Now →'}
                    </button>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ContestsPage;