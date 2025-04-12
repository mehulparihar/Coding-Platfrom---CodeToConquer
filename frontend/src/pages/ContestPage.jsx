import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { contestStore } from '../stores/contestStore';
import { problemStore } from '../stores/problemStore';
import { FiClock, FiUsers, FiCode, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { userStore } from '../stores/userStore';



const ContestPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { contests, fetchContestById, contest } = contestStore();
    const { problems } = problemStore();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [contestStatus, setContestStatus] = useState('upcoming');
    const [progress, setProgress] = useState(0);
    const { user } = userStore();
    useEffect(() => {
        const loadContest = async () => {
            await fetchContestById(id);
        };
        loadContest();
    }, [id]);

    const handleSolveClick = (problemId) => {
        if (contest) {
            navigate(`/contests/${contest._id}/${problemId}`);
        } else {
            navigate(`/problems/${problemId}`);
        }
    }

    useEffect(() => {
        const updateTimer = () => {
            if (!contest) return;
            const now = new Date();
            const start = new Date(contest.startTime);
            const end = new Date(contest.endTime);
            const totalDuration = end - start;
            const elapsed = now - start;
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
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return { days, hours, minutes, seconds };
    };

    if (!contest) return <div>Loading contest...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Contest Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{contest.title}</h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                        <span className="flex items-center gap-2">
                            <FiClock /> {contestStatus.charAt(0).toUpperCase() + contestStatus.slice(1)}
                        </span>
                        <span className="flex items-center gap-2">
                            <FiUsers /> {contest.participants.length} Participants
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Start Time</div>
                            <div className="font-medium">
                                {new Date(contest.startTime).toLocaleDateString()}{" "}
                                {new Date(contest.startTime).toLocaleTimeString()}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">End Time</div>
                            <div className="font-medium">
                                {new Date(contest.endTime).toLocaleDateString()}{" "}
                                {new Date(contest.endTime).toLocaleTimeString()}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Duration</div>
                            <div className="font-medium">
                                {Math.floor((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60 * 60))} Hours
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Problems</div>
                            <div className="font-medium">{contest.problems.length}</div>
                        </div>
                    </div>

                    {contestStatus === 'upcoming' && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="text-2xl font-bold">
                                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                                </div>
                                <span className="text-blue-600">Until contest starts</span>
                            </div>
                        </div>
                    )}

                    {contestStatus === 'active' && (
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="text-2xl font-bold">
                                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                                </div>
                                <span className="text-green-600">Remaining</span>
                            </div>
                        </div>
                    )}
                </div>

                {(contestStatus === 'active' || contestStatus === 'ended') && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Problems List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <FiCode /> Problems to Solve
                                </h2>
                                <div className="space-y-4">
                                    {contest.problems.map((problem, index) => {
                                        // Define the solved status inline
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
                                                // Make the entire card clickable
                                                onClick={() => navigate(`/contests/${contest._id}/${problem._id}`)}
                                                className="border-b pb-4 last:border-0 hover:shadow-lg transition-all p-4 rounded-lg cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">
                                                            {index + 1}. {problem?.title || 'Loading...'}
                                                            {isSolved && (
                                                                <span className="ml-2 text-sm text-green-700 font-semibold">(Solved)</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`text-sm px-2 py-1 rounded-full ${problem?.difficulty === 'Easy'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : problem?.difficulty === 'Medium'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {problem?.difficulty}
                                                            </span>
                                                            <span className="text-sm text-gray-500">{problem?.solveCount} solves</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {isSolved ? (
                                                            <button
                                                                className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium cursor-not-allowed"
                                                                disabled
                                                            >
                                                                Solved
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent triggering card onClick
                                                                    handleSolveClick(problem._id);
                                                                }}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-all"
                                                            >
                                                                Solve
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                </div>
                            </div>
                        </div>

                        {/* Live Leaderboard */}
                        <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FiAward /> Live Leaderboard
                            </h2>
                            <div className="space-y-4">
                                {contest.participants
                                    .sort((a, b) =>
                                        b.score - a.score ||
                                        a.submissions.reduce((acc, sub) => Math.min(acc, new Date(sub.timestamp)), Infinity) -
                                        b.submissions.reduce((acc, sub) => Math.min(acc, new Date(sub.timestamp)), Infinity)
                                    )
                                    .slice(0, 5)
                                    .map((participant, index) => {
                                        const lastSubmission = participant.submissions.length > 0
                                            ? new Date(Math.max(...participant.submissions.map(s => new Date(s.timestamp))))
                                            : null;

                                        return (
                                            <div key={participant.user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <span className="font-medium">#{index + 1}</span>
                                                    <div>
                                                        <div className="font-medium">{participant.user.username}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {lastSubmission && `Finished at ${lastSubmission.toLocaleTimeString()}`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-medium">{participant.score}</span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                {contest.participants.length > 1 && (
                                    <Link
                                        to={`/contests/${contest._id}/leaderboard`}
                                        className="block text-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        View Full Leaderboard →
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {contestStatus === 'upcoming' && (
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-xl font-bold mb-4">Contest Description</h2>
                        <div className="prose max-w-none">
                            {contest.description}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestPage;