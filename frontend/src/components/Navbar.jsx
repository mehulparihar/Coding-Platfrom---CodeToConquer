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

    // Close mobile menu when clicking on a link
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest('.relative')) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    return (
        <nav className="sticky bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 fixed w-full top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and mobile menu button */}
                    <div className="flex items-center">
                        {/* Mobile menu button */}
                        <button
                            type="button"
                            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none mr-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="h-5 w-5" />
                            ) : (
                                <Bars3Icon className="h-5 w-5" />
                            )}
                        </button>

                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-shrink-0 flex items-center"
                        >
                            <Link
                                to="/"
                                className="flex items-center space-x-2"
                            >
                                <img
                                    src="/CTC_LOGO.png"
                                    alt="CodePulse Logo"
                                    className="h-8 w-auto"
                                />
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                                    CodeToConquer
                                </span>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Navigation Links - Center (Desktop) */}
                    <div className="hidden md:flex space-x-1 items-center">
                        <Link
                            to="/"
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                        >
                            Home
                        </Link>
                        <Link
                            to="/problems"
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                        >
                            Problems
                        </Link>
                        <Link
                            to="/contest"
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                        >
                            Contests
                        </Link>
                        <Link
                            to="/battles"
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                        >
                            Live Battles
                        </Link>
                        <Link
                            to="/leaderboard"
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                        >
                            Leaderboard
                        </Link>
                        <Link
                            to="/ai-helper"
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                        >
                            AI Assistant
                        </Link>

                    </div>

                    {/* Right side elements */}
                    <div className="flex items-center space-x-3">
                        {/* Dark mode toggle */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600/50 transition-all duration-300"
                            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {darkMode ? (
                                <SunIcon className="h-5 w-5" />
                            ) : (
                                <MoonIcon className="h-5 w-5" />
                            )}
                        </motion.button>

                        {/* User profile dropdown */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {user.name}
                                    </span>
                                    <ChevronDownIcon className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'transform rotate-180' : ''}`} />
                                </button>

                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50"
                                    >
                                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Sign out
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex space-x-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                                >
                                    Login
                                </Link>
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Link
                                        to="/signup"
                                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                                    >
                                        Get Started
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
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                to="/"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                onClick={closeMobileMenu}
                            >
                                Home
                            </Link>
                            <Link
                                to="/contests/past"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                onClick={closeMobileMenu}
                            >
                                Past Contests
                            </Link>
                            {user && (
                                <Link
                                    to="/bookmarks"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                    onClick={closeMobileMenu}
                                >
                                    Bookmarks
                                </Link>
                            )}
                            {!user && (
                                <>
                                    <Link
                                        to="/login"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                        onClick={closeMobileMenu}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        onClick={closeMobileMenu}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                            {user && (
                                <>

                                    <button
                                        onClick={() => {
                                            closeMobileMenu();
                                            handleLogout();
                                        }}
                                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                    >
                                        Sign out
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;