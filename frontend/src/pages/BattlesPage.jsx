import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiPlus,
  FiLock,
  FiLink,
  FiShare2
} from 'react-icons/fi';
import { GiSwordman, GiTeamUpgrade } from "react-icons/gi";
import { IoPeople } from "react-icons/io5";
import { battleStore } from '../stores/battleStore';
import { userStore } from '../stores/userStore';
import CreateBattleModal from '../components/CreateBattleModal';
import JoinPrivateBattleModal from '../components/JoinPrivateBattleModal';
import toast from 'react-hot-toast';

const BattlesPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { user } = userStore();
  const { getBattles, battles, createBattle } = battleStore();
  
  const battleModes = [
    { id: 'all', name: 'All Modes' },
    { id: '1v1', name: '1v1 Duels' },
    { id: 'Free-for-all', name: 'Free-for-All' },
    { id: 'Team', name: 'Team Battles' }
  ];

  useEffect(() => {
    getBattles();
  }, [getBattles]);

  const filteredBattles = battles.filter(battle => {
    if (filter === 'all') return true;
    return battle.battleType === filter;
  });

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
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center">
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

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium shadow-lg"
            >
              <FiPlus className="text-lg" />
              Create Battle
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-full font-medium shadow-lg"
            >
              <FiLink className="text-lg" />
              Join Private
            </motion.button>
          </div>
        </div>

        {/* Battle Mode Filter */}
        <motion.div
          className="flex flex-wrap gap-4 mb-12 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {battleModes.map((mode) => (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(mode.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${filter === mode.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md hover:shadow-lg'
                }`}
            >
              {mode.name}
            </motion.button>
          ))}
        </motion.div>

        {filteredBattles.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBattles.map(battle => (
              <BattleCard key={battle._id} battle={battle} />
            ))}
          </div>
        )}

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

const BattleCard = ({ battle }) => {
  const isPrivate = battle.privacy === 'private';
  const {registerBattle} = battleStore();
  const {user} = userStore();
  const maxParticipants = battle.battleType === '1v1' ? 2 : battle.battleType === 'Team' ? 4 : 10;
  const handleBattleJoin = async (battleId) => {
    try {
      await registerBattle(battleId, user._id);
      toast.success("Joined Battle");
    } catch (error) {
      toast.error("failed to join battle");
    }
  }
  const getModeIcon = () => {
    const icons = {
      '1v1': <GiSwordman className="w-6 h-6 text-red-500" />,
      ffa: <IoPeople className="w-6 h-6 text-blue-500" />,
      team: <GiTeamUpgrade className="w-6 h-6 text-green-500" />
    };
    return icons[battle.battleType] || <GiSwordman />;
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all p-6 relative overflow-hidden"
    >
      {/* Private Badge */}
      {isPrivate && (
        <div className="absolute top-4 left-4 flex items-center gap-2 text-sm bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300 px-3 py-1 rounded-full">
          <FiLock className="w-4 h-4" />
          Private
        </div>
      )}

      {/* Battle Mode */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {getModeIcon()}
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {battle.battleType?.toUpperCase()}
        </span>
      </div>

      {/* Battle Content */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {battle.title}
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <FiUsers className="w-5 h-5" />
          <span className="text-sm">
            {battle.participants.length}/{maxParticipants} Players
          </span>
        </div>

        {isPrivate && battle.code && (
          <button
            className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
            onClick={() => navigator.clipboard.writeText(battle.code)}
          >
            <FiShare2 className="w-4 h-4" />
            {battle.code}
          </button>
        )}
      </div>
      
      <motion.div whileHover={{ scale: 1.02 }} className="mt-6">
        <Link
          onClick= {() => {handleBattleJoin(battle._id)}}
          to={`/battles/${battle._id}`}
          className="w-full block text-center py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          {battle.status === 'completed' ? 'View Results' : 'Join Battle →'}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default BattlesPage;