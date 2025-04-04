import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CodeBracketIcon, CpuChipIcon, GlobeAltIcon, RocketLaunchIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../stores/useTheme';

const HomePage = () => {
  const { darkMode } = useTheme();

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
                  Today's featured problem: Implement a trie data structure with insert, search, and startsWith methods
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Difficulty: Medium</span>
                  <span className="text-sm text-blue-600 dark:text-blue-400">87% Completion Rate</span>
                </div>
              </div>
              <div className="md:w-1/3 text-center">
                <div className="mb-4">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">24:00:00</div>
                  <span className="text-gray-500 dark:text-gray-400">Time Remaining</span>
                </div>
                <Link 
                  to="/daily-challenge" 
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
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">Ongoing Battles</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((battle) => (
                  <div key={battle} className="bg-white/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Binary Search Showdown</h4>
                        <p className="text-sm opacity-75">4 participants</p>
                      </div>
                      <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
                        Join Battle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Upcoming Contests</h3>
              <div className="space-y-4">
                {[1, 2].map((contest) => (
                  <div key={contest} className="bg-white dark:bg-gray-600 p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold dark:text-white">Weekly Coding Challenge</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Starts in 2:15:30</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Register
                      </button>
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
                {[1, 2, 3, 4, 5].map((rank) => (
                  <tr key={rank} className="border-t border-gray-200 dark:border-gray-600">
                    <td className="px-6 py-4 font-medium">#{rank}</td>
                    <td className="px-6 py-4">User{rank}</td>
                    <td className="px-6 py-4 text-right">{(1500 - (rank*100)).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">{120 - (rank*10)}</td>
                  </tr>
                ))}
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