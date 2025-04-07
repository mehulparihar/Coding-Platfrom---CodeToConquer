import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiUsers, FiZap, FiActivity } from 'react-icons/fi';
import { GiSwordman } from "react-icons/gi"; // ✅ Another alternative


import { battleStore } from '../stores/battleStore';

const BattlesPage = () => {
  const [filter, setFilter] = useState('all');
  const { getBattles, battles } = battleStore();

  useEffect(() => {
    getBattles();
  }, [getBattles]);

  const categorizeBattles = () => {
    const now = new Date();
    return battles.reduce((acc, battle) => {
      if (battle.status === 'completed') {
        acc.past.push(battle);
      } else if (battle.status === 'active') {
        acc.active.push(battle);
      } else {
        acc.upcoming.push(battle);
      }
      return acc;
    }, { active: [], upcoming: [], past: [] });
  };

  const { active, upcoming, past } = categorizeBattles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Live Coding Battles
          </motion.h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Compete in real-time coding duels against developers worldwide
          </p>
        </div>

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
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === f 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md hover:shadow-lg'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Active Battles Section */}
        {(filter === 'all' || filter === 'active') && active.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <FiZap className="text-yellow-500" /> Ongoing Battles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {active.map(battle => (
                <BattleCard key={battle._id} battle={battle} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Battles Section */}
        {(filter === 'all' || filter === 'upcoming') && upcoming.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <FiClock className="text-blue-500" /> Upcoming Battles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcoming.map(battle => (
                <BattleCard key={battle._id} battle={battle} />
              ))}
            </div>
          </div>
        )}

        {/* Past Battles Section */}
        {(filter === 'all' || filter === 'past') && past.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <FiActivity className="text-green-500" /> Past Battles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {past.map(battle => (
                <BattleCard key={battle._id} battle={battle} />
              ))}
            </div>
          </div>
        )}

        {battles.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-6xl mb-4 text-gray-300 dark:text-gray-600">⚔️</div>
            <h3 className="text-xl text-gray-500 dark:text-gray-400">
              No battles available yet
            </h3>
            <p className="text-gray-400 mt-2">Be the first to start a battle!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const BattleCard = ({ battle }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const start = new Date(battle.startTime);
      const end = new Date(battle.endTime);
      const diff = battle.status === 'waiting' ? start - now : end - now;

      setTimeLeft(calculateTimeParts(Math.max(0, diff)));
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, [battle]);

  const calculateTimeParts = (ms) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const getStatusBadge = (battle) => {
    const statusConfig = {
      active: { color: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300', text: 'Live Now' },
      upcoming: { color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300', text: 'Starting Soon' },
      completed: { color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300', text: 'Completed' }
    };
  
    // Optional: Ensure battle and battle.status exist
    if (!battle || !battle.status || !statusConfig[battle.status]) {
      return null;
    }
  
    return (
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm flex items-center gap-2 ${statusConfig[battle.status].color}`}>
        <div className={`w-2 h-2 rounded-full animate-pulse ${
          battle.status === 'active' ? 'bg-green-500' : 
          battle.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'
        }`} />
        {statusConfig[battle.status].text}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all p-6 relative overflow-hidden"
    >
      {/* Glow effect for active battles */}
      {battle.status === 'active' && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-20 pointer-events-none" />
      )}

      {getStatusBadge()}

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {battle.title || 'Mystery Problem'}
      </h3>

      {/* {battle.status !== 'active' && <div className="grid grid-cols-4 gap-4 mb-6 text-center">
        {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
          <div key={unit} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {timeLeft[unit]}
            </div>
            <div className="text-xs text-gray-500 capitalize">{unit}</div>
          </div>
        ))}
      </div>} */}

      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <FiUsers className="w-5 h-5" />
            <span className="text-sm">
              {battle.participants?.length || 0}/2 Participants
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <GiSwordman className="w-5 h-5" />
            <span className="text-sm">
              {battle.problem?.difficulty || 'Medium'}
            </span>
          </div>
        </div>
      </div>

      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="mt-6"
      >
        <Link
          to={`/battles/${battle._id}`}
          className="w-full block text-center py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          {battle.status === 'completed' ? 'View Results' : 
           battle.status === 'active' ? 'Join Battle →' : 'Prepare for Battle'}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default BattlesPage;