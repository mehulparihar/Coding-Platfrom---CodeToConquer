import { Link, useParams } from 'react-router-dom';
import { contestStore } from '../stores/contestStore';
import { FiAward, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { userStore } from '../stores/userStore';

const FullLeaderboard = () => {
    const { id } = useParams();
    const { contest } = contestStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const {user} = userStore();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!contest) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
            <div className="max-w-7xl mx-auto animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
                <div className="grid gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
                    ))}
                </div>
            </div>
        </div>
    );

    const sortedParticipants = [...contest.participants].sort((a, b) => {
        let comparison = 0;
        
        // Sort by score
        if (sortConfig.key === 'score') {
            comparison = b.score - a.score;
        }
        // Sort by name
        else if (sortConfig.key === 'name') {
            comparison = a.user.username.localeCompare(b.user.username);
        }
        // Sort by finish time
        else if (sortConfig.key === 'finish') {
            const aTime = Math.max(...a.submissions.map(s => new Date(s.timestamp)));
            const bTime = Math.max(...b.submissions.map(s => new Date(s.timestamp)));
            comparison = aTime - bTime;
        }

        return sortConfig.direction === 'asc' ? -comparison : comparison;
    });

    const filteredParticipants = sortedParticipants.filter(participant =>
        participant.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentParticipants = filteredParticipants.slice(indexOfFirst, indexOfLast);

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-7xl mx-auto">
                <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Contest
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <h1 className="text-3xl font-bold">{contest.title}</h1>
                        <p className="text-lg opacity-90">Leaderboard</p>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                            <div className="relative flex-1 max-w-md">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search participants..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <select
                                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={entriesPerPage}
                                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                >
                                    {[10, 25, 50].map(size => (
                                        <option key={size} value={size}>Show {size}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th
                                            className="p-4 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            onClick={() => requestSort('rank')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Rank
                                                {getSortIcon('rank')}
                                            </div>
                                        </th>
                                        <th
                                            className="p-4 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            onClick={() => requestSort('name')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Participant
                                                {getSortIcon('name')}
                                            </div>
                                        </th>
                                        <th
                                            className="p-4 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            onClick={() => requestSort('score')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Score
                                                {getSortIcon('score')}
                                            </div>
                                        </th>
                                        <th
                                            className="p-4 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            onClick={() => requestSort('finish')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Finish Time
                                                {getSortIcon('finish')}
                                            </div>
                                        </th>
                                        {contest.problems.map((problem, idx) => (
                                            <th key={problem._id} className="p-4 text-left">
                                                Problem {idx + 1}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentParticipants.map((participant, index) => {
                                        const rank = index + 1 + (currentPage - 1) * entriesPerPage;
                                        const lastSubmission = participant.submissions.length > 0
                                            ? new Date(Math.max(...participant.submissions.map(s => new Date(s.timestamp))))
                                            : null;

                                        return (
                                            <motion.tr
                                                key={participant.user._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <td className="p-4 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {rank <= 3 && (
                                                            <span className={`text-lg ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : 'text-amber-600'}`}>
                                                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                                                            </span>
                                                        )}
                                                        #{rank}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-medium">
                                                    {participant.user.username}
                                                    {participant.user._id === user?._id && (
                                                        <span className="ml-2 text-blue-500 text-sm">(You)</span>
                                                    )}
                                                </td>
                                                <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">
                                                    {participant.score}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                                    {lastSubmission ? lastSubmission.toLocaleString() : '-'}
                                                </td>
                                                {contest.problems.map(problem => {
                                                    const submission = participant.submissions.find(
                                                        s => s.problem.toString() === problem._id.toString()
                                                    );
                                                    return (
                                                        <td key={problem._id} className="p-4">
                                                            {submission ? (
                                                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    {new Date(submission.timestamp).toLocaleTimeString()}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredParticipants.length)} of {filteredParticipants.length} entries
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredParticipants.length / entriesPerPage), p + 1))}
                                    disabled={currentPage === Math.ceil(filteredParticipants.length / entriesPerPage)}
                                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default FullLeaderboard;