import { useEffect, useState } from 'react';
import { Link} from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiCalendar, FiUsers, FiCode } from 'react-icons/fi';
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
            
            if (endTime < now) {
                acc.past.push(contest);
            } else if (startTime > now) {
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
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    >
                        Coding Contests
                    </motion.h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Prove your skills, climb leaderboards, and win awesome prizes
                    </p>
                </div>

                {/* Filter buttons with animation */}
                <motion.div
                    className="flex gap-4 mb-12 justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {['all', 'active', 'upcoming', 'past'].map((f) => (
                        <motion.button
                            key={f}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${filter === f
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </motion.button>
                    ))}
                </motion.div>

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

                {/* Empty state with animation */}
                {contests.length === 0 && (
                    <motion.div
                        className="text-center py-20"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div className="text-6xl mb-4 text-gray-300 dark:text-gray-600">🏆</div>
                        <h3 className="text-xl text-gray-500 dark:text-gray-400">
                            No contests available yet
                        </h3>
                        <p className="text-gray-400 mt-2">Check back later!</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const ContestCard = ({ contest }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [progress, setProgress] = useState(0);
    const { register } = contestStore();
    const {user} = userStore();
    const handleRegister = async (id) => {
        if (!user) {
          return toast.error("Login to register for contest");
        }
        register(id);
    }

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const start = new Date(contest.startTime);
            const end = new Date(contest.endTime);
            const totalDuration = end - start;
            const elapsed = now - start;

            if (now < start) {
                const diff = start - now;
                setTimeLeft(calculateTimeParts(diff));
                setProgress(0);
            } else if (now > end) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setProgress(100);
            } else {
                const diff = end - now;
                setTimeLeft(calculateTimeParts(diff));
                setProgress((elapsed / totalDuration) * 100);
            }
        };

        const interval = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(interval);
    }, [contest]);

    const calculateTimeParts = (ms) => {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return { days, hours, minutes, seconds };
    };
    const navigate = useNavigate();
    const handleCard = async () => {
        navigate(`${contest._id}`)
    }
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ y: -5 }}
            onClick={() => {handleCard()}}
             className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all p-6 relative overflow-hidden cursor-pointer"
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-20 pointer-events-none" />

            {/* Status badge */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm flex items-center gap-2 ${new Date(contest.endTime) < new Date()
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                : 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300'
                }`}>
                <div className={`w-2 h-2 rounded-full ${new Date(contest.endTime) < new Date() ? 'bg-gray-400' : 'bg-green-500'
                    }`} />
                {new Date(contest.endTime) < new Date() ? 'Ended' : 'Active'}
            </div>

            {/* Contest title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {contest.title}
            </h3>

            {/* Time progress */}
            <div className="relative mb-6">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="absolute -bottom-5 right-0 text-sm text-gray-500">
                    {Math.round(progress)}% {progress < 100 ? 'completed' : 'ended'}
                </div>
            </div>

            {/* Countdown timer */}
            <div className="grid grid-cols-4 gap-4 mb-8 text-center">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {timeLeft.days}
                    </div>
                    <div className="text-xs text-gray-500">Days</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {timeLeft.hours}
                    </div>
                    <div className="text-xs text-gray-500">Hours</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                        {timeLeft.minutes}
                    </div>
                    <div className="text-xs text-gray-500">Mins</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {timeLeft.seconds}
                    </div>
                    <div className="text-xs text-gray-500">Secs</div>
                </div>
            </div>

            {/* Contest details */}
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <FiCalendar className="w-5 h-5" />
                        <span className="text-sm">
                            {new Date(contest.startTime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })}{' '}
                            -{' '}
                            {new Date(contest.endTime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <FiUsers className="w-5 h-5" />
                        <span className="text-sm">{contest.participants?.length || 0} Participants</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <FiCode className="w-5 h-5" />
                        <span className="text-sm">{contest.problems?.length || 0} Problems</span>
                    </div>
                </div>
            </div>

            {/* CTA button */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="mt-6"
            >
                {contest.participants.some(p => p.user === user?._id) ? (
                    <Link
                    // to={`/contests/${contest._id}`}
                    className="w-full block text-center py-3 bg-gray-500 from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg bg-gray-500 cursor-not-allowed transition-all"
                >
                    {new Date(contest.endTime) < new Date() ? 'View Results' : 'Already Registered'}
                </Link>
                ) : (
                    // <button
                    //     onClick={() => handleRegister(contest._id)}
                    //     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    // >
                    //     Register
                    // </button>
                    <Link
                    // to={`/contests/${contest._id}`}
                    onClick={() => {handleRegister(contest._id)}}
                    className="w-full block text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                    {new Date(contest.endTime) < new Date() ? 'View Results' : 'Join Contest →'}
                    </Link>
                )}

            </motion.div>
        </motion.div>
    );
};


export default ContestsPage;