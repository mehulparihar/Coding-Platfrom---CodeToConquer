import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemStore } from '../stores/problemStore';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, MagnifyingGlassIcon, FunnelIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
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
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Coding Challenges
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Master your skills through curated problem-solving exercises
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 rounded-xl p-1 shadow-sm">
              <input
                type="text"
                placeholder="Search problems..."
                className="w-full px-6 py-4 bg-transparent rounded-xl border-0 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                value={filters.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 absolute right-6 top-4" />
            </div>
          </motion.div>

          {/* Filter Row */}
          <motion.div 
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Difficulty Filter */}
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-1 rounded-xl flex gap-2 shadow-sm">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    const newDiff = filters.difficulty.includes(diff)
                      ? filters.difficulty.filter(d => d !== diff)
                      : [...filters.difficulty, diff];
                    setDifficulty(newDiff);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    filters.difficulty.includes(diff)
                      ? `${
                          diff === 'Easy' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                          diff === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                        }`
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {filters.difficulty.includes(diff) && <CheckCircleIcon className="h-4 w-4" />}
                  {diff}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-1 rounded-xl flex gap-2 shadow-sm">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                    filters.status === status
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Tags Filter */}
            <div className="relative group">
              <button className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all shadow-sm">
                <FunnelIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Tags
                {filters.tags.length > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 rounded-full text-xs">
                    {filters.tags.length}
                  </span>
                )}
              </button>
              
              <div className="absolute right-0 mt-2 w-64 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-3 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const newTags = filters.tags.includes(tag)
                          ? filters.tags.filter(t => t !== tag)
                          : [...filters.tags, tag];
                        setTags(newTags);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center justify-center transition-colors ${
                        filters.tags.includes(tag)
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Problems List */}
        <motion.div 
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-white/30 dark:bg-gray-800/30 text-sm font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="col-span-1">Status</div>
            <div className="col-span-6">Title</div>
            <div className="col-span-3">Tags</div>
            <div className="col-span-1">Difficulty</div>
            <div className="col-span-1">Acceptance</div>
          </div>

          <AnimatePresence>
            {filteredProblems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-8 text-gray-400 dark:text-gray-500"
              >
                <SparklesIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                No problems found matching your criteria
              </motion.div>
            ) : (
              filteredProblems.map(problem => (
                <motion.div
                  key={problem._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-gray-200/50 dark:border-gray-700/50 last:border-0"
                >
                  <div className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50/30 dark:hover:bg-gray-700/20 transition-colors">
                    {/* Status */}
                    <div className="col-span-1">
                      {user?.submissions?.find(sub => sub === problem._id) && (
                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      )}
                    </div>

                    {/* Title with Link */}
                    <div className="col-span-6">
                      <Link
                        to={`/problems/${problem._id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                      >
                        {problem.title}
                        {problem.isPremium && (
                          <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs rounded-full">
                            Premium
                          </span>
                        )}
                      </Link>
                    </div>

                    {/* Tags */}
                    <div className="col-span-3 flex flex-wrap gap-2">
                      {problem.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Difficulty */}
                    <div className={`col-span-1 text-sm font-medium ${
                      problem.difficulty === 'Easy' ? 'text-green-600 dark:text-green-400' :
                      problem.difficulty === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {problem.difficulty}
                    </div>

                    {/* Acceptance */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round((problem.solveCount / problem.attemptCount) * 100)}%
                        </span>
                        <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${Math.round((problem.solveCount / problem.attemptCount) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
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