import { useEffect, useState } from "react";
import { userStore } from "../stores/userStore";
import toast from "react-hot-toast";


const CreateBattleModal = ({ isOpen, onClose, onCreate }) => {
    const [battleData, setBattleData] = useState({
        title: '',
        mode: '1v1',
        privacy: 'public',
        difficulty: 'Medium',
        maxParticipants: 2,  // Default for 1v1
        duration: 30
    });
    useEffect(() => {
        const defaults = {
            '1v1': 2,
            'Free-for-all': 4,
            'Team': 4
        };
        setBattleData(prev => ({
            ...prev,
            maxParticipants: defaults[prev.mode]
        }));
    }, [battleData.mode]);
    const {user} = userStore();
    const handleSubmit = (e) => {
        e.preventDefault();
        if(!user)
        {
            return toast.error("Login to create battles");
        }
        onCreate(battleData);
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isOpen ? 'visible' : 'invisible'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Create New Battle</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Battle Title</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
                            value={battleData.title}
                            onChange={(e) => setBattleData({ ...battleData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Mode</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
                                value={battleData.mode}
                                onChange={(e) => setBattleData({ ...battleData, mode: e.target.value })}
                            >
                                <option value="1v1">1v1 Duel</option>
                                <option value="Free-for-all">Free-for-All</option>
                                <option value="Team">Team Battle</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Privacy</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
                                value={battleData.privacy}
                                onChange={(e) => setBattleData({ ...battleData, privacy: e.target.value })}
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Difficulty</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
                                value={battleData.difficulty}
                                onChange={(e) => setBattleData({ ...battleData, difficulty: e.target.value })}
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Max Participants</label>
                            <input
                                type="number"
                                min={battleData.mode === '1v1' ? 2 : 2}
                                max={battleData.mode === 'Free-for-all' ? 10 : battleData.mode === 'Team' ? 8 : 2}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
                                value={battleData.maxParticipants}
                                onChange={(e) => setBattleData({ ...battleData, maxParticipants: parseInt(e.target.value) })}
                                disabled={battleData.mode === '1v1'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Duration (min)</label>
                            <input
                                type="number"
                                min="5"
                                max="120"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
                                value={battleData.duration}
                                onChange={(e) => setBattleData({ ...battleData, duration: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg"
                        >
                            Create Battle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBattleModal;