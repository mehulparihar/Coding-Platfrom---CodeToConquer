import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemStore } from '../stores/problemStore';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, MagnifyingGlassIcon, FunnelIcon, CheckCircleIcon, TrophyIcon, FireIcon, ChartBarIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { userStore } from '../stores/userStore';

const ProblemsPage = () => {
  const {
    problems,
    getFilteredProblems,
    fetchAllProblem,
    setSearchQuery,
    setTags,
    setDifficulty,
    setStatus,
    filters
  } = problemStore();
  const { user } = userStore();

  useEffect(() => {
    fetchAllProblem();
  }, [fetchAllProblem]);

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const statusOptions = ['all', 'solved', 'unsolved'];
  const allTags = [...new Set(problems.flatMap(problem => problem.tags))];
  const filteredProblems = getFilteredProblems(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-4 bg-white/50 dark:bg-gray-800/50 px-8 py-4 rounded-2xl backdrop-blur-lg shadow-sm mb-6">
            <TrophyIcon className="h-12 w-12 text-yellow-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Coding Challenges
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Master your skills through <span className="text-blue-500">interactive problem-solving</span> and <span className="text-purple-500">real-world scenarios</span>
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-12 space-y-8">
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative max-w-3xl mx-auto"
          >
            <div className="relative backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 rounded-xl p-1 shadow-lg transition-all hover:shadow-xl">
              <input
                type="text"
                placeholder="🔍 Search problems..."
                className="w-full px-8 py-5 bg-transparent rounded-xl border-0 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 text-lg transition-all"
                value={filters.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-6 top-5 flex gap-2">
                <span className="text-gray-400 text-sm">{filteredProblems.length} results</span>
                <MagnifyingGlassIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </motion.div>

          {/* Filter Row */}
          <motion.div 
            className="flex flex-wrap gap-6 justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Difficulty Filter */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-2 rounded-2xl flex gap-2 shadow-lg">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    const newDiff = filters.difficulty.includes(diff)
                      ? filters.difficulty.filter(d => d !== diff)
                      : [...filters.difficulty, diff];
                    setDifficulty(newDiff);
                  }}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                    filters.difficulty.includes(diff)
                      ? `${
                          diff === 'Easy' ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 text-green-700 dark:text-green-300' :
                          diff === 'Medium' ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                          'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 text-red-700 dark:text-red-300'
                        } shadow-inner`
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {filters.difficulty.includes(diff) && <CheckCircleIcon className="h-5 w-5" />}
                  {diff}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-2 rounded-2xl flex gap-2 shadow-lg">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatus(status)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold capitalize flex items-center gap-2 ${
                    filters.status === status
                      ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 text-blue-700 dark:text-blue-300 shadow-inner'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {status === 'solved' && <CheckCircleIcon className="h-5 w-5" />}
                  {status === 'unsolved' && <BookOpenIcon className="h-5 w-5" />}
                  {status}
                </button>
              ))}
            </div>

            {/* Tags Filter */}
            <div className="relative group">
              <button className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg px-6 py-3 rounded-2xl text-gray-600 dark:text-gray-300 flex items-center gap-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all shadow-lg">
                <FunnelIcon className="h-6 w-6 text-purple-500" />
                Tags
                {filters.tags.length > 0 && (
                  <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 rounded-full text-sm">
                    {filters.tags.length} selected
                  </span>
                )}
              </button>
              
              <div className="absolute right-0 mt-3 w-72 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-4 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const newTags = filters.tags.includes(tag)
                          ? filters.tags.filter(t => t !== tag)
                          : [...filters.tags, tag];
                        setTags(newTags);
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        filters.tags.includes(tag)
                          ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 text-blue-700 dark:text-blue-300 shadow-inner'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {tag}
                      {filters.tags.includes(tag) && <CheckCircleIcon className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Problems List */}
        <motion.div 
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/30 dark:border-gray-700/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-6 px-8 py-6 bg-white/50 dark:bg-gray-800/50 text-sm font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200/30 dark:border-gray-700/30">
            <div className="col-span-1 flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" /> Status
            </div>
            <div className="col-span-5 flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5" /> Problem
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <FireIcon className="h-5 w-5" /> Tags
            </div>
            <div className="col-span-1 flex items-center gap-2">
              ⚡ Difficulty
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" /> Acceptance
            </div>
          </div>

          <AnimatePresence>
            {filteredProblems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-12 text-gray-400 dark:text-gray-500"
              >
                <div className="inline-flex flex-col items-center">
                  <SparklesIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4 animate-pulse" />
                  <p className="text-xl font-medium mb-2">No problems found</p>
                  <p className="text-gray-500 dark:text-gray-600">Try adjusting your filters or search terms</p>
                </div>
              </motion.div>
            ) : (
              filteredProblems.map(problem => (
                <motion.div
                  key={problem._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-gray-200/30 dark:border-gray-700/30 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                >
                  <Link
                    to={`/problems/${problem._id}`}
                    className="grid grid-cols-12 gap-6 items-center px-8 py-6"
                  >
                    {/* Status */}
                    <div className="col-span-1">
                      {user?.submissions?.find(sub => sub === problem._id) ? (
                        <CheckCircleIcon className="h-7 w-7 text-green-500 animate-pulse" />
                      ) : (
                        <div className="h-7 w-7 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                      )}
                    </div>

                    {/* Title */}
                    <div className="col-span-5">
                      <div className="flex items-center gap-4">
                        <div className="font-medium text-lg text-gray-900 dark:text-white">
                          {problem.title}
                          {problem.isPremium && (
                            <span className="ml-3 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs rounded-full inline-flex items-center">
                              <SparklesIcon className="h-4 w-4 mr-1" />
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="col-span-3 flex flex-wrap gap-2">
                      {problem.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-gray-100/70 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium backdrop-blur-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Difficulty */}
                    <div className="col-span-1">
                      <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
                        problem.difficulty === 'Easy' ? 'bg-green-100/70 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-100/70 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                        'bg-red-100/70 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>

                    {/* Acceptance */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-4">
                        <div className="w-full bg-gray-200/70 dark:bg-gray-700/50 h-3 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.round((problem.solveCount / problem.attemptCount) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {Math.round((problem.solveCount / problem.attemptCount) * 100) || 0}%
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ProblemsPage;