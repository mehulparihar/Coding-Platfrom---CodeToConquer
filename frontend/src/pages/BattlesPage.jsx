import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiPlus, FiLink, FiZap, FiClock, FiAward
} from 'react-icons/fi';
import { GiSwordman, GiTeamUpgrade, GiFinishLine, GiSpinningSword } from "react-icons/gi";
import { IoPeople, IoSparkles, IoStatsChart } from "react-icons/io5";
import { battleStore } from '../stores/battleStore';
import { userStore } from '../stores/userStore';
import CreateBattleModal from '../components/CreateBattleModal';
import JoinPrivateBattleModal from '../components/JoinPrivateBattleModal';
import toast from 'react-hot-toast';

const BattlesPage = () => {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { user } = userStore();
  const { getBattles, battles, createBattle } = battleStore();

  const battleTypes = [
    { id: 'all', name: 'All Modes', icon: <IoSparkles className="w-5 h-5" /> },
    { id: '1v1', name: '1v1 Duels', icon: <GiSpinningSword className="w-5 h-5" /> },
    { id: 'Free-for-all', name: 'FFA', icon: <IoPeople className="w-5 h-5" /> },
    { id: 'Team', name: 'Teams', icon: <GiTeamUpgrade className="w-5 h-5" /> }
  ];

  const statusCategories = [
    { id: 'upcoming', name: 'Upcoming', icon: <FiClock className="w-5 h-5" /> },
    { id: 'active', name: 'Live', icon: <FiZap className="w-5 h-5" /> },
    { id: 'ended', name: 'Completed', icon: <GiFinishLine className="w-5 h-5" /> }
  ];

  useEffect(() => { getBattles(); }, [getBattles]);

  const categorizeBattles = () => {
    const now = new Date();
    return battles.reduce((acc, battle) => {
      if (battle.privacy === 'private') return acc;
      if (battle.status === 'waiting') acc.upcoming.push(battle);
      else if (battle.status === 'completed') acc.ended.push(battle);
      else acc.active.push(battle);
      return acc;
    }, { upcoming: [], active: [], ended: [] });
  };

  const { upcoming, active, ended } = categorizeBattles();

  const filteredBattles = {
    upcoming: upcoming.filter(b => typeFilter === 'all' || b.battleType === typeFilter),
    active: active.filter(b => typeFilter === 'all' || b.battleType === typeFilter),
    ended: ended.filter(b => typeFilter === 'all' || b.battleType === typeFilter)
  };

  const handleCreateBattle = async (battleData) => {
    const newBattle = await createBattle({
      ...battleData,
      creator: user._id,
      participants: [user._id],
      code: Math.random().toString(36).substr(2, 6).toUpperCase()
    });

    if (newBattle) {
      navigate(`/battles/${newBattle._id}`);
      setShowCreateModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row justify-between items-center gap-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Code Clash Arena
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Engage in real-time coding battles and dominate the leaderboards
            </p>
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium shadow-xl hover:shadow-2xl transition-all group"
            >
              <FiPlus className="text-xl transition-transform group-hover:rotate-90" />
              New Battle
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-3 px-8 py-4 bg-gray-800 text-white rounded-2xl font-medium shadow-xl hover:shadow-2xl transition-all"
            >
              <FiLink className="text-xl" />
              Join Private
            </motion.button>
          </div>
        </motion.div>

        {/* Filters Section */}
        <div className="space-y-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {battleTypes.map((type) => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTypeFilter(type.id)}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl font-medium transition-all ${typeFilter === type.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg text-gray-600 dark:text-gray-300 shadow-md hover:shadow-lg'
                  }`}
              >
                {type.icon}
                {type.name}
              </motion.button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {statusCategories.map((status) => (
              <motion.button
                key={status.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatusFilter(status.id)}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl font-medium transition-all ${statusFilter === status.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg text-gray-600 dark:text-gray-300 shadow-md hover:shadow-lg'
                  }`}
              >
                {status.icon}
                {status.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Battles Grid */}
        <div className="grid grid-cols-1 gap-8">
          {['upcoming', 'active', 'ended'].map((status) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`space-y-6 ${statusFilter !== 'all' && statusFilter !== status ? 'hidden' : ''}`}
            >
              <div className="flex items-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white">
                  {statusCategories.find(s => s.id === status)?.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {status.charAt(0).toUpperCase() + status.slice(1)} Battles
                </h2>
                <span className="ml-auto px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                  {filteredBattles[status].length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredBattles[status].map(battle => (
                    <BattleCard key={battle._id} battle={battle} status={status} />
                  ))}
                </AnimatePresence>

                {filteredBattles[status].length === 0 && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="col-span-full text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg"
                  >
                    <div className="text-4xl mb-4 text-gray-300 dark:text-gray-600">⚔️</div>
                    <h3 className="text-xl text-gray-500 dark:text-gray-400">
                      No {status} battles found
                    </h3>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <CreateBattleModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBattle}
        />

        <JoinPrivateBattleModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
        />
      </div>
    </div>
  );
};

const BattleCard = ({ battle, status }) => {
  const navigate = useNavigate();
  const { registerBattle } = battleStore();
  const { user } = userStore();
  const maxParticipants = battle.battleType === '1v1' ? 2 : 10;

  const statusColors = {
    upcoming: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-100' },
    active: { bg: 'from-green-500 to-green-600', text: 'text-green-100' },
    ended: { bg: 'from-gray-500 to-gray-600', text: 'text-gray-100' }
  };

  const handleBattleJoin = async (battleId) => {
    try {
      await registerBattle(battleId, user._id);
      navigate(`/battles/${battleId}`);
      toast.success("Joined Battle");
    } catch (error) {
      toast.error(error.response?.data?.error || "Login to join battle");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-white/20"
    >
      {/* Status Header */}
      <div className={`bg-gradient-to-r ${statusColors[status].bg} p-4 rounded-t-2xl`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${statusColors[status].text}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full text-white">
            {battle.battleType}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {battle.title}
        </h3>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FiUsers className="w-5 h-5" />
            <span className="text-sm">
              {battle.participants.length}/{maxParticipants}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <IoStatsChart className="w-5 h-5" />
            <span className="text-sm">
              {battle.problems?.length || 0} Problems
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <FiClock className="w-5 h-5 flex-shrink-0" />
            <span>
              {status === 'ended'
                ? `Ended ${new Date(battle.endTime).toLocaleDateString()}`
                : `${new Date(battle.startTime).toLocaleDateString()} - ${new Date(battle.endTime).toLocaleDateString()}`}
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => handleBattleJoin(battle._id)}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {status === 'ended' ? (
            <>
              <FiAward className="w-5 h-5" />
              View Results
            </>
          ) : (
            <>
              <GiSpinningSword className="w-5 h-5 animate-spin-slow" />
              Join Battle
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BattlesPage;