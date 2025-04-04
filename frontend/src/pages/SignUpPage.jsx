import React, { useState, useEffect } from 'react';
import { userStore } from "../stores/userStore";
import { useTheme } from '../stores/useTheme';
import { motion } from 'framer-motion';
import { LockClosedIcon, EnvelopeIcon, UserIcon, CheckIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const SignUpPage = () => {
    const { signup } = userStore();
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordRequirements, setPasswordRequirements] = useState({
        minLength: false,
        hasNumber: false,
        hasSpecialChar: false,
        hasUpperCase: false,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    useEffect(() => {
        if (formData.password) {
            checkPasswordStrength(formData.password);
        } else {
            setPasswordStrength(0);
            setPasswordRequirements({
                minLength: false,
                hasNumber: false,
                hasSpecialChar: false,
                hasUpperCase: false,
            });
        }
    }, [formData.password]);

    const checkPasswordStrength = (password) => {
        const requirements = {
            minLength: password.length >= 8,
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            hasUpperCase: /[A-Z]/.test(password),
        };

        setPasswordRequirements(requirements);

        const strength = Object.values(requirements).filter(Boolean).length;
        setPasswordStrength(strength);
    };

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 0: return 'bg-gray-200 dark:bg-gray-700';
            case 1: return 'bg-red-500';
            case 2: return 'bg-yellow-500';
            case 3: return 'bg-blue-500';
            case 4: return 'bg-green-500';
            default: return 'bg-gray-200 dark:bg-gray-700';
        }
    };

    const getStrengthText = () => {
        switch (passwordStrength) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Moderate';
            case 3: return 'Strong';
            case 4: return 'Very Strong';
            default: return '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }

        if (passwordStrength < 3) {
            toast.error("Please choose a stronger password");
            return;
        }

        setIsLoading(true);
        try {
            await signup(formData);
            toast.success('Account created successfully!');
        } catch (error) {
            toast.error(error.message || 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <motion.div 
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4"
                            >
                                <UserIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </motion.div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Create Account
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                Join our coding community
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="name">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white sm:text-sm transition-all duration-200"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white sm:text-sm transition-all duration-200"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white sm:text-sm transition-all duration-200"
                                        placeholder="Create a password"
                                        required
                                    />
                                </div>

                                {formData.password && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Password Strength: <span className={`font-bold ${passwordStrength >= 3 ? 'text-green-500' : passwordStrength >= 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                    {getStrengthText()}
                                                </span>
                                            </span>
                                            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${getStrengthColor()}`}
                                                    style={{ width: `${passwordStrength * 25}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center">
                                                {passwordRequirements.minLength ? (
                                                    <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
                                                ) : (
                                                    <XMarkIcon className="h-4 w-4 text-red-500 mr-1" />
                                                )}
                                                <span>8+ characters</span>
                                            </div>
                                            <div className="flex items-center">
                                                {passwordRequirements.hasNumber ? (
                                                    <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
                                                ) : (
                                                    <XMarkIcon className="h-4 w-4 text-red-500 mr-1" />
                                                )}
                                                <span>Number</span>
                                            </div>
                                            <div className="flex items-center">
                                                {passwordRequirements.hasUpperCase ? (
                                                    <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
                                                ) : (
                                                    <XMarkIcon className="h-4 w-4 text-red-500 mr-1" />
                                                )}
                                                <span>Uppercase</span>
                                            </div>
                                            <div className="flex items-center">
                                                {passwordRequirements.hasSpecialChar ? (
                                                    <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
                                                ) : (
                                                    <XMarkIcon className="h-4 w-4 text-red-500 mr-1" />
                                                )}
                                                <span>Special char</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="confirmPassword">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white sm:text-sm transition-all duration-200"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="pt-2"
                            >
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </span>
                                    ) : (
                                        <>
                                            Sign Up
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
                            className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
                        >
                            Already have an account?{' '}
                            <a 
                                href="/login" 
                                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                            >
                                Log In
                            </a>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignUpPage;