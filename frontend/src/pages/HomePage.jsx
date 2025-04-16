import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CodeBracketIcon, CpuChipIcon, GlobeAltIcon, RocketLaunchIcon, TrophyIcon, SparklesIcon, ClockIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/solid';
// import { useTheme } from '../stores/useTheme';
import { problemStore } from '../stores/problemStore';
import { useEffect, useState } from 'react';
import { contestStore } from '../stores/contestStore';
import { userStore } from '../stores/userStore';
import toast from 'react-hot-toast';
import { battleStore } from '../stores/battleStore';
import axios from '../lib/axios';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ hrs: 0, min: 0, sec: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          hrs: Math.floor((difference / (1000 * 60 * 60)) % 24),
          min: Math.floor((difference / (1000 * 60)) % 60),
          sec: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-3 font-mono">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white text-2xl font-bold shadow-lg">
            {value.toString().padStart(2, '0')}
          </div>
          <span className="mt-1 text-xs text-gray-500 uppercase tracking-wider">{unit}</span>
        </div>
      ))}
    </div>
  );
};

const LearningTrackCard = ({ track, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className={`${track.color} p-8 rounded-3xl backdrop-blur-lg border border-white/10 shadow-2xl hover:shadow-3xl transition-all`}
  >
    <div className="flex items-start mb-6">
      <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
        {track.icon}
      </div>
      <h3 className="text-2xl font-bold ml-4 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {track.title}
      </h3>
    </div>
    <ul className="space-y-3">
      {track.topics.map((topic, i) => (
        <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
          <SparklesIcon className="w-5 h-5 mr-2 text-purple-500" />
          <span className="text-lg">{topic}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

const HomePage = () => {
  // const { darkMode } = useTheme();
  const { getdailyChallenge, dailychallenge } = problemStore();
  const { getContest, contests, register } = contestStore();
  const { user } = userStore();
  const { getBattles, battles,registerBattle } = battleStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('battles');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/leaderboard');
        setLeaderboard(res.data.allTime);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => { getBattles(); }, [getBattles]);
  useEffect(() => { getdailyChallenge(); getContest(); }, [getdailyChallenge, getContest]);

  const learningTracks = [
    {
      title: "Data Structures",
      icon: <CodeBracketIcon className="w-8 h-8 text-white" />,
      topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Hash Tables"],
      color: "bg-blue-50/30 dark:bg-blue-900/20"
    },
    {
      title: "Algorithms",
      icon: <CpuChipIcon className="w-8 h-8 text-white" />,
      topics: ["Sorting", "Searching", "DP", "Greedy", "Backtracking"],
      color: "bg-purple-50/30 dark:bg-purple-900/20"
    },
    {
      title: "System Design",
      icon: <GlobeAltIcon className="w-8 h-8 text-white" />,
      topics: ["Distributed Systems", "API Design", "DB Sharding", "Caching", "Load Balancing"],
      color: "bg-green-50/30 dark:bg-green-900/20"
    },
    {
      title: "Web Development",
      icon: <RocketLaunchIcon className="w-8 h-8 text-white" />,
      topics: ["React", "Node.js", "REST APIs", "WebSockets", "Testing"],
      color: "bg-orange-50/30 dark:bg-orange-900/20"
    }
  ];

  return (
    <div className={`min-h-screen dark:bg-gray-900 bg-gray-50}`}>
      {/* Hero Section */}
      <section className="relative pt-32 pb-48 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent leading-tight">
              Transform Your Coding
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Superpowers
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Master programming through AI-powered challenges, live competitions, and interactive learning paths
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/problems"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-xl transition-all flex items-center"
              >
                <TrophyIcon className="w-6 h-6 mr-2" />
                Start Practicing
              </Link>
              <Link
                to="/contests"
                className="px-8 py-4 border-2 border-blue-400 text-blue-400 rounded-2xl hover:bg-blue-400/10 transition-all"
              >
                Join Competition
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Learning Tracks Grid */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold mb-16 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
          >
            Master Cutting-Edge Technologies
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {learningTracks.map((track, index) => (
              <LearningTrackCard key={index} track={track} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Daily Challenge */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-[3rem] p-12 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ background: "url('/pattern.svg')" }} />
            <div className="relative flex flex-col lg:flex-row justify-between items-center text-white">
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <motion.div
                  initial={{ x: -50 }}
                  animate={{ x: 0 }}
                  className="bg-white/10 p-4 rounded-2xl backdrop-blur-lg inline-block mb-6"
                >
                  <span className="text-sm font-semibold">🔥 Daily Challenge</span>
                </motion.div>
                <h2 className="text-4xl font-bold mb-6">{dailychallenge?.problem?.title}</h2>
                <div className="flex gap-4 mb-8">
                  <div className="bg-white/10 px-4 py-2 rounded-xl">
                    <span className="text-sm">Difficulty: {dailychallenge?.problem?.difficulty}</span>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-xl">
                    <span className="text-sm">
                      {Math.round((dailychallenge?.problem?.solveCount / dailychallenge?.problem?.attemptCount * 100))}% Solved
                    </span>
                  </div>
                </div>
                <CountdownTimer targetDate={new Date(new Date(dailychallenge?.date).getTime() + 24 * 60 * 60 * 1000)} />
              </div>
              <div className="lg:w-1/2 flex justify-center">
                <Link
                  to={`/problems/${dailychallenge?.problem._id}`}
                  className="px-16 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-xl flex items-center gap-2"
                >
                  <RocketLaunchIcon className="w-6 h-6" />
                  Solve Challenge Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Arena */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <button
              onClick={() => setActiveTab('battles')}
              className={`text-2xl font-bold ${activeTab === 'battles' ? 'text-blue-500' : 'text-gray-400'}`}
            >
              Live Battles
            </button>
            <button
              onClick={() => setActiveTab('contests')}
              className={`text-2xl font-bold ${activeTab === 'contests' ? 'text-purple-500' : 'text-gray-400'}`}
            >
              Upcoming Contests
            </button>
          </div>

          <AnimatePresence mode='wait'>
            {activeTab === 'battles' && (
              <motion.div
                key="battles"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {battles?.slice(0, 6).map((battle) => (
                  <div key={battle._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <h3 className="text-xl font-bold">{battle.title}</h3>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <UserGroupIcon className="w-6 h-6 text-gray-500" />
                        <span>{battle.participants.length} Coders</span>
                        <ChartBarIcon className="w-6 h-6 text-gray-500" />
                        <span>{battle?.problems?.length} Problems</span>
                      </div>
                      <button 
                      onClick={() => registerBattle(battle._id, user._id)}
                      className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition">
                        Join Battle
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'contests' && (
              <motion.div
                key="contests"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {contests?.map((contest) => (
                  <div key={contest._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <ClockIcon className="w-6 h-6 text-purple-500" />
                      <h3 className="text-xl font-bold">{contest.title}</h3>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        Starts: {new Date(contest.startTime).toLocaleDateString()}
                      </div>
                      {contest.participants.some(p => p.user === user?._id) ? (
                        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-xl">Registered</div>
                      ) : (
                        <button
                          onClick={() => register(contest._id)}
                          className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
                        >
                          Register Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Elite Coders Leaderboard
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-4 px-8 py-6 bg-gray-50 dark:bg-gray-700 font-bold text-lg">
              <div>Rank</div>
              <div>Coder</div>
              <div className="text-center">Solved</div>
              <div className="text-right">Points</div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {leaderboard.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-4 px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                          index === 2 ? 'bg-gradient-to-br from-amber-600 to-yellow-700' : 'bg-blue-500'}`}>
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {user.username[0]}
                    </div>
                    <span className="font-medium">{user.username}</span>
                  </div>
                  <div className="text-center text-lg font-bold text-blue-500">{user.problemsSolved}</div>
                  <div className="text-right font-mono text-lg font-bold text-purple-500">
                    {user.score.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-8 text-center border-t border-gray-100 dark:border-gray-700">
              <Link to="/leaderboard" className="text-blue-500 hover:underline text-lg">
                View Complete Rankings →
              </Link>
            </div>
          </div>
        </div>
      </section>
      <footer className="py-8 px-4 bg-gray-800 text-gray-200 text-center relative z-10">
        <p className="text-sm">© {new Date().getFullYear()} CodeToConquer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;