import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const contestStore = create((set, get) => ({
    contests: [],
    contest: null,

    setContest: (contest) => set({ contest }),
    setContests: (contests) => set({ contests }),

    getContest : async () => {
        try {
            const response = await axios.get('/contest/upcoming');
            console.log(response.data);
            set({ contests: response.data });
        } catch (error) {
            toast.error(error.message.data.error || "Failed to fetch contest");
        }
    },
    register : async (id) => {
        try {
            const response = await axios.post(`/contest/${id}/join`);
            if(!response) return toast.error("Failed to register contest");
            toast.success("succesfully register for contest");
        } catch (error) {
            toast.error(error.message.data.error || "Failed to register contest");
        }
    },
    createContest : async (data) => {
        try {
            const response = await axios.post('/contest', data);
            toast.success("succesfully create contest");
        } catch (error) {
            toast.error(error.message.data.error || "Failed to create contest");
        }
    },
    fetchContestById : async (id) => {
        try {
            const response = await axios.get(`/contest/contest/${id}`);
            console.log(response.data);
            set({contest : response.data});
        } catch (error) {
            toast.error(error.message.data.error || "Failed to fetch contest");
        }
    }

}));