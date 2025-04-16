import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userStore } from "../stores/userStore";
import { SunIcon, MoonIcon, ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../stores/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout, checkAuth } = userStore();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest('.relative')) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Problems', path: '/problems' },
        { name: 'Contests', path: '/contests' },
        { name: 'Live Battles', path: '/battles' },
        { name: 'Leaderboard', path: '/leaderboard' },
        ...(user?.role === "admin" ? [{ name: 'Dashboard', path: '/dashboard' }] : [])
    ];

    return (
        <nav className="sticky bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 fixed w-full top-0 z-50 shadow-xl">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Left Section */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile Menu Button */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="md:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </motion.button>

                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-shrink-0"
                        >
                            <Link to="/" className="flex items-center space-x-3">
                                <img
                                    src="/CTC_LOGO.png"
                                    alt="CodePulse Logo"
                                    className="h-9 w-auto transform transition-transform hover:scale-105"
                                />
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    CodeToConquer
                                </span>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Center Navigation (Desktop) */}
                    <div className="hidden md:flex items-center space-x-1 mx-4">
                        {navLinks.map((link) => (
                            <motion.div
                                key={link.name}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    to={link.path}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                                    bg-gradient-to-r from-transparent to-transparent hover:from-gray-100/50 hover:to-gray-100/20
                                    dark:hover:from-gray-800/50 dark:hover:to-gray-800/20 text-gray-700 dark:text-gray-300
                                    hover:shadow-sm"
                                >
                                    {link.name}
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        {/* Theme Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleDarkMode}
                            className="p-2.5 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm
                            text-gray-700 dark:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50
                            shadow-sm hover:shadow-md transition-all"
                            aria-label={darkMode ? 'Light Mode' : 'Dark Mode'}
                        >
                            {darkMode ? (
                                <SunIcon className="h-6 w-6" />
                            ) : (
                                <MoonIcon className="h-6 w-6" />
                            )}
                        </motion.button>

                        {/* User Profile */}
                        {user ? (
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-3 group focus:outline-none"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500
                                        flex items-center justify-center text-white font-bold shadow-lg
                                        group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {user.role === 'admin' ? 'Administrator' : 'Coder'}
                                        </p>
                                    </div>
                                    <ChevronDownIcon className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform
                                        ${isMenuOpen ? 'rotate-180' : ''}`} />
                                </motion.button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {isMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-3 w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
                                            rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50
                                            overflow-hidden z-50"
                                        >
                                            <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500
                                                        flex items-center justify-center text-white font-bold">
                                                        {user?.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full px-4 py-3 text-left rounded-xl text-sm font-medium
                                                    text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20
                                                    transition-colors flex items-center space-x-2"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-3">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link
                                        to="/login"
                                        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                                        bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50
                                        text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md"
                                    >
                                        Login
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link
                                        to="/signup"
                                        className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600
                                        to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700
                                        transition-all flex items-center space-x-2"
                                    >
                                        <span>Start Coding</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <motion.div
                                    key={link.name}
                                    whileHover={{ scale: 1.02 }}
                                    className="border-b border-gray-100/50 dark:border-gray-800/50 last:border-0"
                                >
                                    <Link
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-lg font-medium text-gray-800 dark:text-gray-200
                                        hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                            
                            {!user && (
                                <div className="pt-4 space-y-3">
                                    <motion.div whileHover={{ scale: 1.02 }}>
                                        <Link
                                            to="/login"
                                            className="block px-4 py-3 text-center font-semibold bg-gray-100/50 dark:bg-gray-800/50
                                            text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.02 }}>
                                        <Link
                                            to="/signup"
                                            className="block px-4 py-3 text-center font-semibold bg-gradient-to-r from-blue-600 to-purple-600
                                            text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Start Coding Free
                                        </Link>
                                    </motion.div>
                                </div>
                            )}
                            
                            {user && (
                                <div className="pt-4">
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full px-4 py-3 text-center font-semibold text-red-600 dark:text-red-400
                                        hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;