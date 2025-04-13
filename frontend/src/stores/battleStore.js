import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const battleStore = create((set, get) => ({
    battles: [],
    battle: null,

    setBattle: (battle) => set({ battle }),
    setProblems: (battles) => set({ battles }),

    updateBattleState: (updates) => {
        set(state => ({
          battle: { ...state.battle, ...updates }
        }));
      },
    getBattles : async () => {
        try {
            const response = await axios.get('/battles');
            console.log(response.data);
            set({ battles: response.data });
        } catch (error) {
            toast.error(error.message.data.error || "Failed to fetch Battles");
        }
    },
    registerBattle : async (battleId, userId) => {
        try {
            const response = await axios.post(`/battles/join/${battleId}`, {userId});
            if(!response) return toast.error("Failed to register contest");
            toast.success("succesfully register for Battle");
        } catch (error) {
            toast.error(error.message.data.error || "Failed to register contest");
        }
    },
    getBattleById : async (id) => {
        try {
            const response = await axios.get(`/battles/${id}`);
            console.log(response.data);
            // if(!response) return toast.error("Failed to register contest");
            set({battle : response.data});
        } catch (error) {
            toast.error(error.message.data.error || "Failed to get contest");
        }
    },
    joinPrivateBattle : async (battleCode, userId) => {
        try {
            console.log(battleCode, userId);
            const response = await axios.post(`/battles/private/join`, {battleCode, userId});
            console.log(response.data);
            return response.data._id;
            // set({battle : response.data});
        } catch (error) {
            toast.error(error.message.data.error || "Failed to get contest");
        }
    }
    ,
    createBattle : async (data) => {
        try {
            console.log(data);
            const response = await axios.post(`/battles/create`, data);
            const battleId = response.data._id;
            const userId = data.creator;
            const joined = await axios.post(`/battles/join/${battleId}`, {userId})
            if(!response) return toast.error("Failed to create battle");
            toast.success("succesfully create Battle");
            return response.data;
        } catch (error) {
            toast.error(error.message.data.error || "Failed to create contest");
        }
    }

}));