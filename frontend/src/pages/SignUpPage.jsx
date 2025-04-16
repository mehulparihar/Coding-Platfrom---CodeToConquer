


import React, { useState, useEffect } from 'react';
import { userStore } from "../stores/userStore";
import { useTheme } from '../stores/useTheme';
import { motion } from 'framer-motion';
import { LockClosedIcon, EnvelopeIcon, UserIcon, CheckIcon, XMarkIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    // const getStrengthColor = () => {
    //     switch (passwordStrength) {
    //         case 0: return 'bg-gray-200 dark:bg-gray-700';
    //         case 1: return 'bg-red-500';
    //         case 2: return 'bg-yellow-500';
    //         case 3: return 'bg-blue-500';
    //         case 4: return 'bg-green-500';
    //         default: return 'bg-gray-200 dark:bg-gray-700';
    //     }
    // };
    
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
    

    const getStrengthColor = () => {
        const colors = [
            'from-red-500 to-red-400',
            'from-orange-500 to-orange-400',
            'from-blue-500 to-blue-400',
            'from-green-500 to-green-400'
        ];
        return colors[passwordStrength] || 'from-gray-200 to-gray-300';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4 transition-colors duration-300">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 120 }}
                className="w-full max-w-xl"
            >
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-gray-200/30 dark:border-gray-700/50 overflow-hidden relative">
                    <div className="absolute inset-0 border-8 border-white/10 dark:border-gray-900/10 rounded-[2rem] pointer-events-none" />
                    
                    <div className="p-12">
                        <div className="text-center mb-12">
                            <motion.div 
                                initial={{ scale: 0.9, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-inner"
                            >
                                <div className="relative">
                                    <UserIcon className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                                    <div className="absolute inset-0 animate-pulse opacity-20">
                                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-lg" />
                                    </div>
                                </div>
                            </motion.div>
                            <motion.h2 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400"
                            >
                                Join the Community
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-3 text-lg text-gray-600 dark:text-gray-400"
                            >
                                Start your coding journey today
                            </motion.p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Name Input */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3" htmlFor="name">
                                    Username
                                </label>
                                <motion.div whileHover={{ scale: 1.02 }} className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <UserIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/70 dark:bg-gray-700/70 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 transition-all duration-300 text-lg"
                                        placeholder="CodingMaster123"
                                        required
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Email Input */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3" htmlFor="email">
                                    Email Address
                                </label>
                                <motion.div whileHover={{ scale: 1.02 }} className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <EnvelopeIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/70 dark:bg-gray-700/70 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 transition-all duration-300 text-lg"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Password Input */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <motion.div whileHover={{ scale: 1.02 }} className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/70 dark:bg-gray-700/70 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 transition-all duration-300 text-lg"
                                        placeholder="••••••••"
                                        required
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

                                {formData.password && (
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                Strength: <span className={`${getStrengthColor().replace('from-', 'text-').replace('to-', '')}`}>
                                                    {getStrengthText()}
                                                </span>
                                            </span>
                                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full bg-gradient-to-r ${getStrengthColor()}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(passwordStrength / 4) * 100}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {Object.entries(passwordRequirements).map(([key, met]) => (
                                                <motion.div
                                                    key={key}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex items-center space-x-2"
                                                >
                                                    {met ? (
                                                        <CheckIcon className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <XMarkIcon className="h-5 w-5 text-red-500" />
                                                    )}
                                                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                                                        {key.replace('has', '').replace('minLength', '8+ characters')}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Confirm Password Input */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">
                                        Confirm Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                                    >
                                        {showConfirmPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <motion.div whileHover={{ scale: 1.02 }} className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/70 dark:bg-gray-700/70 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 transition-all duration-300 text-lg"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" />
                                        ) : (
                                            <EyeIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" />
                                        )}
                                    </button>
                                </motion.div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-2 flex items-center text-red-500 text-sm"
                                    >
                                        <XMarkIcon className="h-5 w-5 mr-1" />
                                        Passwords don't match
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="pt-4"
                            >
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-5 px-6 border border-transparent rounded-xl font-semibold text-white bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 shadow-2xl hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all duration-300 relative overflow-hidden group"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Creating Account...
                                        </div>
                                    ) : (
                                        <>
                                            <span className="relative z-10">Start Coding Now</span>
                                            <ArrowRightIcon className="ml-3 h-6 w-6 relative z-10 transform group-hover:translate-x-1 transition-transform" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        </form>

                        {/* Login Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400"
                        >
                            <span className="opacity-80">Already have an account?</span>{' '}
                            <a 
                                href="/login" 
                                className="font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-300 group"
                            >
                                Sign In
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

export default SignUpPage;