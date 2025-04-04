// Input component
export const Input = ({ className, ...props }) => (
    <input
      className={`rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${className}`}
      {...props}
    />
  );
  
  // Checkbox component
  export const Checkbox = ({ label, checked, onChange, color = 'blue' }) => (
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`rounded text-${color}-500 focus:ring-${color}-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700`}
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
  
  // Tag component
  export const Tag = ({ children, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        active 
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );