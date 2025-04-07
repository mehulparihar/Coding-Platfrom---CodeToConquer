import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";


export const problemStore = create((set, get) => ({
    problems: [],
    problem: null,
    dailychallenge : null,
    filters: {
        searchQuery: '',
        tags: [],
        difficulty: [],
        status: 'all',
    },

    setProblem: (problem) => set({ problem }),
    setProblems: (problems) => set({ problems }),
    setFilters: (filters) => set({ filters }),

    getFilteredProblems: (user) => {
        const { problems, filters } = get();
        
        return problems.filter(problem => {
            const matchesSearch =
                problem.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                problem.description.toLowerCase().includes(filters.searchQuery.toLowerCase());

            const matchesTags = filters.tags.length === 0 ||
                filters.tags.every(tag => problem.tags.includes(tag));

            const matchesDifficulty = filters.difficulty.length === 0 ||
                filters.difficulty.includes(problem.difficulty);

            // ✅ Fix status filter by checking user's submissions
            const isSolved = user?.submissions?.includes(problem._id);

            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'solved' && isSolved) ||
                (filters.status === 'unsolved' && !isSolved);

            return matchesSearch && matchesTags && matchesDifficulty && matchesStatus;
        });
    },
    
    setSearchQuery: (searchQuery) => set(state => ({
        filters: { ...state.filters, searchQuery }
    })),

    setTags: (tags) => set(state => ({
        filters: { ...state.filters, tags }
    })),

    setDifficulty: (difficulty) => set(state => ({
        filters: { ...state.filters, difficulty }
    })),

    setStatus: (status) => set(state => ({
        filters: { ...state.filters, status }
    })),

    createProblem: async (problemForm) => {
        try {
            const res = await axios.post("/problems", problemForm);
            set((prevState) => ({
                problems: [...prevState.problems, res.data],
            }));
        } catch (error) {
            toast.error(error.response.data.error);
        }
    },
    getdailyChallenge : async () => {
        try {
            const response = await axios.post("/problems/daily");
            console.log(response);
            set({ dailychallenge: response.data });
        } catch (error) {
            toast.error(error.message.data.error || "Failed to fetch daily challenge");
        }
    },
    
    fetchProblemById: async (id) => {
        const state = get();
        const existingProblem = state.problems.find((p) => p._id == id);
        if (existingProblem) {
            set({ problem: existingProblem });
            return;
        }
        try {
            const response = await axios.get(`/problems/${id}`);
            set({ problem: response.data });
        } catch (error) {
            toast.error(error.message.data.error || "Failed to fetch problem");
        }
    },
    fetchAllProblem: async () => {
        try {
            const response = await axios.get("/problems");
            console.log(response.data);
            set({ problems: response.data });
        } catch (error) {
            toast.error(error.response.data.error || "Failed to fetch Products");
        }
    },
    fetchProblemBySearch: async (search) => {

    },
    deleteProblem: async (problemId) => {
        try {
            const response = await axios.delete(`/problems/${problemId}`);
            set((prevProblems) => ({
                problems: prevProblems.problems.filter((problem) => problem._id !== problemId),
            }));
        } catch (error) {
            toast.error(error.response.data.error || "Failed to update product");
        }
    },


}))