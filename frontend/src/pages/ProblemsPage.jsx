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
  const {user} = userStore();
  useEffect(() => {
    fetchAllProblem();
  }, [fetchAllProblem]);

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const statusOptions = ['all', 'solved', 'unsolved'];
  const allTags = [...new Set(problems.flatMap(problem => problem.tags))];
  const filteredProblems = getFilteredProblems(user);

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Coding Problems
          </h1>
          <p className="text-gray-600">
            Practice your problem-solving skills
          </p>
        </div>

        
        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search problems..."
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500 transition-all"
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute right-4 top-3.5" />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4 justify-center">
            {/* Difficulty Filter */}
            <div className="bg-gray-50 p-1 rounded-lg flex gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    const newDiff = filters.difficulty.includes(diff)
                      ? filters.difficulty.filter(d => d !== diff)
                      : [...filters.difficulty, diff];
                    setDifficulty(newDiff);
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${
                    filters.difficulty.includes(diff)
                      ? `bg-${diff.toLowerCase()}-100 text-${diff.toLowerCase()}-800`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filters.difficulty.includes(diff) && <CheckCircleIcon className="h-4 w-4" />}
                  {diff}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="bg-gray-50 p-1 rounded-lg flex gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatus(status)}
                  className={`px-3 py-1.5 rounded-md text-sm capitalize ${
                    filters.status === status
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Tags Filter */}
            <div className="relative group">
              <button className="bg-gray-50 px-3 py-1.5 rounded-lg text-sm text-gray-600 flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <FunnelIcon className="h-4 w-4 text-blue-600" />
                Tags
                {filters.tags.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 px-2 rounded-full text-xs">
                    {filters.tags.length}
                  </span>
                )}
              </button>
              
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-50">
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
                      className={`px-2 py-1 rounded-md text-sm flex items-center justify-center transition-colors ${
                        filters.tags.includes(tag)
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-200">
            <div className="col-span-1">Status</div>
            <div className="col-span-6">Title</div>
            <div className="col-span-3">Tags</div>
            <div className="col-span-1">Difficulty</div>
            <div className="col-span-1">Acceptance</div>
          </div>

          <AnimatePresence>
            {filteredProblems.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                No problems found matching your criteria
              </div>
            ) : (
              filteredProblems.map(problem => (
                <motion.div
                  key={problem._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-gray-100 last:border-0"
                >
                  <div className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors">
                    {/* Status */}
                    <div className="col-span-1">
                      {user?.submissions?.find(sub => sub === problem._id) && (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      )}
                    </div>

                    {/* Title with Link */}
                    <div className="col-span-6">
                      <Link
                        to={`/problems/${problem._id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {problem.title}
                      </Link>
                    </div>

                    {/* Tags */}
                    <div className="col-span-3 flex flex-wrap gap-2">
                      {problem.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Difficulty */}
                    <div className={`col-span-1 text-sm ${
                      problem.difficulty === 'Easy' ? 'text-green-700' :
                      problem.difficulty === 'Medium' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {problem.difficulty}
                    </div>

                    {/* Acceptance */}
                    <div className="col-span-1">
                      <span className="text-sm text-gray-600">
                        {Math.round((problem.solveCount / problem.attemptCount) * 100)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProblemsPage;