import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { userStore } from '../stores/userStore';
import { useTheme } from '../stores/useTheme';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const { login, user } = userStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulating API call delay
        setTimeout(() => {
            // localStorage.setItem('token', 'mockToken123');
            try {
                login(formData);
                if(user) {
                    toast.success('Login successful!');
                    navigate('/');
                }
                setIsLoading(false);
            } catch (error) {
                toast.error('Invalid credentials');
                setIsLoading(false);
            }
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                    <div className="p-10">
                        <div className="text-center mb-10">
                            <motion.div 
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4"
                            >
                                <LockClosedIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </motion.div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Welcome Back
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                Sign in to access your account
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-5"
                            >
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white sm:text-sm transition-all duration-200"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white sm:text-sm transition-all duration-200"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md"
                                >
                                    {isLoading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRightIcon className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        </form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400"
                        >
                            Don't have an account?{' '}
                            <a 
                                href="/signup" 
                                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                            >
                                Sign up now
                            </a>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;