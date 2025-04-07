import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const battleStore = create((set, get) => ({
    battles: [],
    battle: null,

    setBattle: (battle) => set({ battle }),
    setProblems: (battles) => set({ battles }),


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
    createBattle : async (userId, problemId) => {
        try {
            const response = await axios.post(`/battles/create`, {problemId, userId});
            if(!response) return toast.error("Failed to create battle");
            toast.success("succesfully create Battle");
        } catch (error) {
            toast.error(error.message.data.error || "Failed to create contest");
        }
    }

}));