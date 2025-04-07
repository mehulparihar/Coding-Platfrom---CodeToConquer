import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiAward, FiStar, FiUser, FiZap } from 'react-icons/fi';
import { FaCrown } from "react-icons/fa";
import { userStore } from '../stores/userStore';
import axios from '../lib/axios';


const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState({
    daily: [],
    weekly: [],
    allTime: [],
    contests: [],
    streaks: []
  });
  const [activeTab, setActiveTab] = useState('daily');
  const { user } = userStore();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/leaderboard');
        setLeaderboardData({
          daily: res.data.daily,
          weekly: res.data.weekly,
          allTime: res.data.allTime,
          contests: res.data.contests, // now matches our backend key
          streaks: res.data.streaks
        });
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchLeaderboard();
  }, []);

  const tabs = ['daily', 'weekly', 'allTime', 'contests', 'streaks'];
  const icons = {
    daily: <FiTrendingUp />,
    weekly: <FiStar />,
    allTime: <FaCrown />,
    contests: <FiAward />,
    streaks: <FiUser />
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent"
          >
            Coding Leaderboards
          </motion.h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Climb the ranks and showcase your programming skills
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          {tabs.map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md hover:shadow-lg'
              }`}
            >
              {icons[tab]}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Leaderboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Leaderboard */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              {icons[activeTab]}
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Leaders
            </h2>

            <div className="space-y-4">
              {leaderboardData[activeTab].map((user, index) => (
                <motion.div
                  key={user._id} // Using _id from MongoDB
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="w-12 flex flex-col items-center mr-4">
                    <span className={`text-lg font-bold ${
                      index === 0 ? 'text-amber-500' :
                      index === 1 ? 'text-gray-500' :
                      index === 2 ? 'text-orange-500' : 'text-gray-400'
                    }`}>
                      #{index + 1}
                    </span>
                    {index < 3 && (
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        index === 0 ? 'bg-amber-100 text-amber-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {index === 0 ? 'Gold' : index === 1 ? 'Silver' : 'Bronze'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-4">
                      {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full rounded-full" alt="avatar" />
                      ) : (
                        <FiUser className="text-gray-500 dark:text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{user.username}</h3>
                      <p className="text-sm text-gray-500">
                        {activeTab === 'streaks'
                          ? `${user.currentStreak} Day Streak`
                          : `${user.score} Points`}
                      </p>
                    </div>

                    <div className="w-24 text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {activeTab === 'streaks' ? user.currentStreak : user.score}
                      </div>
                      {activeTab !== 'streaks' && (
                        <div className="text-xs text-gray-500">
                          {user.problemsSolved} Problems
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Additional Stats */}
          <div className="space-y-8">
            {/* Hall of Fame */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🏆 Hall of Fame</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {leaderboardData.allTime.slice(0, 3).map((user, index) => (
                  <div key={user._id} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      index === 0 ? 'bg-amber-100' :
                      index === 1 ? 'bg-gray-100' : 'bg-orange-100'
                    }`}>
                      {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full rounded-full" alt="avatar" />
                      ) : (
                        <FiUser className="text-2xl text-gray-600" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{user.username}</h3>
                    <p className="text-sm text-gray-500">{user.score} Points</p>
                    <div className={`mt-2 text-xs font-medium ${
                      index === 0 ? 'text-amber-600' :
                      index === 1 ? 'text-gray-600' : 'text-orange-600'
                    }`}>
                      #{index + 1} Rank
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Streak Leaders */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔥 Daily Streaks</h2>
              <div className="space-y-4">
                {leaderboardData.streaks.slice(0, 5).map((user, index) => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-8 text-gray-500">#{index + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
                        {user.avatar ? (
                          <img src={user.avatar} className="w-full h-full rounded-full" alt="avatar" />
                        ) : (
                          <FiUser className="text-gray-500 dark:text-gray-300" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <FiZap className="text-orange-500" />
                      </div>
                      <span className="font-bold text-orange-600">{user.currentStreak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
