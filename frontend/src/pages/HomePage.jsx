import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CodeBracketIcon, CpuChipIcon, GlobeAltIcon, RocketLaunchIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../stores/useTheme';
import { problemStore } from '../stores/problemStore';
import { useEffect, useState } from 'react';
import { contestStore } from '../stores/contestStore'
import { userStore } from '../stores/userStore';
import toast from 'react-hot-toast';
import { battleStore } from '../stores/battleStore';
import axios from '../lib/axios';


const CountdownTimer = ({ targetDate }) => {
  // Function to calculate the time left until targetDate
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        // days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hrs: Math.floor((difference / (1000 * 60 * 60)) % 24),
        min: Math.floor((difference / (1000 * 60)) % 60),
        sec: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    // Update timer every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, [targetDate]);

  // Build timer display components
  const timerComponents = Object.keys(timeLeft).map(interval => (
    <span className="text-4xl font-bold text-blue-600 dark:text-blue-400" key={interval}>
      {timeLeft[interval]}{interval}{interval !== "sec" && " : "}
    </span>
  ));

  return (
    <div>
      {timerComponents.length ? timerComponents : <span>Time's up!</span>}
    </div>
  );
};

const CountdownTimerContest = ({ targetDate }) => {
  // Function to calculate the time left until targetDate
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hrs: Math.floor((difference / (1000 * 60 * 60)) % 24),
        min: Math.floor((difference / (1000 * 60)) % 60),
        sec: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    // Update timer every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, [targetDate]);

  // Build timer display components

  const timerComponents = Object.keys(timeLeft).map(interval => (
    <span className="text-sm text-gray-600 dark:text-gray-300" key={interval}>
      {interval === "days" && "Starts in "}{timeLeft[interval]}{interval}{interval !== "sec" && " : "}
    </span>
  ));

  return (
    <div>
      {timerComponents.length ? timerComponents : <span>Time's up!</span>}
    </div>
  );
};

const HomePage = () => {
  const { darkMode } = useTheme();
  const { getdailyChallenge, dailychallenge } = problemStore();
  const { getContest, contests, register } = contestStore();
  const { user } = userStore();
  const { getBattles, battles } = battleStore();

  const handleRegister = async (id) => {
    // e.preventDefault();
    if (!user) {
      return toast.error("Login to register for contest");
    }
    register(id);
  }
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/leaderboard');
        // Assuming your backend returns { daily, weekly, allTime, contests, streaks }
        // Here, we're using the allTime leaderboard for the preview.
        setLeaderboard(res.data.allTime);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);


  useEffect(() => {
    getBattles();
  }, [getBattles]);

  useEffect(() => {
    getdailyChallenge();
    getContest();
  }, [getdailyChallenge, getContest]);
  const learningTracks = [
    {
      title: "Data Structures",
      icon: <CodeBracketIcon className="w-8 h-8" />,
      topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Hash Tables"],
      color: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      title: "Algorithms",
      icon: <CpuChipIcon className="w-8 h-8" />,
      topics: ["Sorting", "Searching", "DP", "Greedy", "Backtracking"],
      color: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
      title: "System Design",
      icon: <GlobeAltIcon className="w-8 h-8" />,
      topics: ["Distributed Systems", "API Design", "DB Sharding", "Caching", "Load Balancing"],
      color: "bg-green-100 dark:bg-green-900/30"
    },
    {
      title: "Web Development",
      icon: <RocketLaunchIcon className="w-8 h-8" />,
      topics: ["React", "Node.js", "REST APIs", "WebSockets", "Testing"],
      color: "bg-orange-100 dark:bg-orange-900/30"
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Master Coding Through Practice
          </motion.h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Level up your skills with interactive coding challenges, real-time battles, and expert-curated learning paths
          </p>
          <Link to="/problems" className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
            Start Practicing
            <TrophyIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Learning Tracks Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center dark:text-white">Explore Learning Tracks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {learningTracks.map((track, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${track.color} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow`}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mr-4">
                    {track.icon}
                  </div>
                  <h3 className="text-xl font-semibold dark:text-white">{track.title}</h3>
                </div>
                <ul className="space-y-2">
                  {track.topics.map((topic, i) => (
                    <li key={i} className="flex items-center text-gray-600 dark:text-gray-300">
                      <span className="mr-2">▹</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Challenge Section */}
      <section className="py-16 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Daily Coding Challenge</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Today's featured problem: {dailychallenge?.problem?.title}
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Difficulty: {dailychallenge?.problem?.difficulty}</span>
                  <span className="text-sm text-blue-600 dark:text-blue-400">{Math.round((dailychallenge?.problem?.solveCount / dailychallenge?.problem?.attemptCount * 100))}% Completion Rate</span>
                </div>
              </div>
              <div className="md:w-1/3 text-center">
                <div className="mb-4">
                  {/* <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">24:00:00</div> */}
                  <CountdownTimer className="text-4xl font-bold text-blue-600 dark:text-blue-400" targetDate={new Date(new Date(dailychallenge?.date).getTime() + 24 * 60 * 60 * 1000)} />
                  <span className="text-gray-500 dark:text-gray-400">Time Remaining</span>
                </div>
                <Link
                  to={`/problems/${dailychallenge?.problem?._id}`}
                  className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Attempt Challenge
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Battles Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center dark:text-white">Live Coding Battles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Ongoing Battles */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">Ongoing Battles</h3>
              <div className="max-h-64 overflow-y-auto space-y-4 custom-scrollbar">
                {battles?.map((battle) => (
                  <div key={battle.id} className="bg-white/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{battle.title}</h4>
                        <p className="text-sm opacity-75">{battle.participants.length} participants</p>
                      </div>
                      <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
                        Join Battle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Contests */}
            <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Upcoming Contests</h3>
              <div className="max-h-64 overflow-y-auto space-y-4 custom-scrollbar">
                {contests?.map((contest) => (
                  <div key={contest._id} className="bg-white dark:bg-gray-600 p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center">
                      <div>
                              <h4 className="font-semibold dark:text-white">{contest.title}</h4>
                        <CountdownTimerContest
                          className="text-4xl font-bold text-blue-600 dark:text-blue-400"
                          targetDate={new Date(new Date(contest.startTime).getTime() + 24 * 60 * 60 * 1000)}
                        />
                      </div>
                      {contest.participants.some(p => p.user === user?._id) ? (
                        <button className="px-4 py-2 bg-gray-500 text-white rounded-lg cursor-not-allowed">
                          Registered
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(contest._id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* Leaderboard Preview */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center dark:text-white">Top Coders</h2>
        <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-600">
              <tr>
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-right">Score</th>
                <th className="px-6 py-4 text-right">Solved</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length > 0 ? (
                leaderboard.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">#{index + 1}</td>
                    <td className="px-6 py-4">{user.username}</td>
                    <td className="px-6 py-4 text-right">{user.score.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">{user.problemsSolved}</td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="p-6 text-center">
            <Link to="/leaderboard" className="text-blue-600 dark:text-blue-400 hover:underline">
              View Full Leaderboard →
            </Link>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
};

export default HomePage;