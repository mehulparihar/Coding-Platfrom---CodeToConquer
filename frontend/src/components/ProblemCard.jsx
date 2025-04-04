const ProblemCard = ({ problem }) => {
    const difficultyColors = {
      Easy: 'green',
      Medium: 'yellow',
      Hard: 'red'
    };
  
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {problem.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {problem.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {problem.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="ml-4 flex flex-col items-end">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${difficultyColors[problem.difficulty]}-100 text-${difficultyColors[problem.difficulty]}-800 dark:bg-${difficultyColors[problem.difficulty]}-900/30 dark:text-${difficultyColors[problem.difficulty]}-400`}>
              {problem.difficulty}
            </span>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Acceptance: {problem.acceptanceRate}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default ProblemCard;