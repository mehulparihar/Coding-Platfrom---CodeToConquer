import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, EnvelopeIcon, ArrowRightIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { userStore } from '../stores/userStore';
import { useTheme } from '../stores/useTheme';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const { login, user } = userStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulating API call delay
        setTimeout(() => {
            try {
                login(formData);
                if(user) {
                    toast.success('Welcome back! 🎉');
                    navigate('/');
                }
                setIsLoading(false);
            } catch (error) {
                toast.error('Authentication failed. Please check your credentials');
                setIsLoading(false);
            }
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="w-full max-w-xl"
            >
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-gray-200/30 dark:border-gray-700/30 overflow-hidden relative">
                    <div className="absolute inset-0 border-8 border-white/10 dark:border-gray-900/10 rounded-[2rem] pointer-events-none" />
                    
                    <div className="p-12">
                        <div className="text-center mb-12">
                            <motion.div 
                                initial={{ scale: 0.9, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-inner"
                            >
                                <div className="relative">
                                    <LockClosedIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                                    <div className="absolute inset-0 animate-pulse opacity-20">
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-lg" />
                                    </div>
                                </div>
                            </motion.div>
                            <motion.h2 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400"
                            >
                                Welcome Back
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-3 text-lg text-gray-600 dark:text-gray-400"
                            >
                                Unlock your coding potential
                            </motion.p>
                        </div>

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-7"
                            >
                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Email Address
                                    </label>
                                    <motion.div whileHover={{ scale: 1.02 }} className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <EnvelopeIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/70 dark:bg-gray-700/70 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 transition-all duration-300 text-lg"
                                            placeholder="name@company.com"
                                        />
                                    </motion.div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    <motion.div whileHover={{ scale: 1.02 }} className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <LockClosedIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/70 dark:bg-gray-700/70 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 transition-all duration-300 text-lg"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" />
                                            ) : (
                                                <EyeIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" />
                                            )}
                                        </button>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-5 px-6 border border-transparent rounded-xl font-semibold text-white bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 shadow-2xl hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 dark:focus:ring-blue-400/20 transition-all duration-300 relative overflow-hidden"
                                >
                                    {isLoading ? (
                                        <LoadingSpinner className="text-white" />
                                    ) : (
                                        <>
                                            <span className="relative z-10">Continue to Dashboard</span>
                                            <ArrowRightIcon className="ml-3 h-6 w-6 relative z-10" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        </form>

                        {/* Signup Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400"
                        >
                            <span className="opacity-80">New to CodeToConquer?</span>{' '}
                            <a 
                                href="/signup" 
                                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300 group"
                            >
                                Create an account
                                <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                                    &rarr;
                                </span>
                            </a>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;