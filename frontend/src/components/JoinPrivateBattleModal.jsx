import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { battleStore } from "../stores/battleStore";
import { userStore } from "../stores/userStore";
import axios from "../lib/axios";
import toast from "react-hot-toast";


const JoinPrivateBattleModal = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const { joinPrivateBattle, battle } = battleStore();
  const { user } = userStore();
  const handleJoin = async () => {
    if (!user) {
      return toast.error("Login to join battles");
    }
    const battleCode = code;
    const userId = user._id;
    const response = await axios.post(`/battles/private/join`, { battleCode, userId });
    console.log(response.data._id);
    const battleId = response.data._id;
    if (response.data) {
      navigate(`/battles/${battleId}`);
      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isOpen ? 'visible' : 'invisible'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Join Private Battle</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Battle Code</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength="6"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg"
            >
              Join Battle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinPrivateBattleModal;