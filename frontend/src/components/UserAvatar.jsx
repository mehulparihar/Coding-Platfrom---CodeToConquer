export default function UserAvatar({ user, size = 8, className = '' }) {
    const avatarSize = `h-${size} w-${size}`;
    
    return (
      <div className={`inline-flex items-center justify-center rounded-full 
        bg-blue-100 dark:bg-blue-900/50 ${avatarSize} ${className}`}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className={`rounded-full ${avatarSize} object-cover`}
          />
        ) : (
          <span className="font-medium text-blue-600 dark:text-blue-300">
            {user?.username?.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
    );
  }