import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MonacoEditor from "@monaco-editor/react";
import { problemStore } from '../stores/problemStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, CodeBracketIcon, LightBulbIcon, ChartBarIcon, CheckCircleIcon, XCircleIcon, BookOpenIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { userStore } from '../stores/userStore';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const SubmissionResult = ({ result }) => {
    if (!result) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6"
        >
            <div className={`flex items-center gap-3 text-2xl font-bold mb-6 ${result.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                {result.status === 'Accepted' ? (
                    <CheckCircleIcon className="h-8 w-8" />
                ) : (
                    <XCircleIcon className="h-8 w-8" />
                )}
                {result.status}
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 font-medium text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                    <div>Test Case</div>
                    <div>Status</div>
                    <div>Output</div>
                </div>

                {result.results?.map((testResult, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-3 gap-4 p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl"
                    >
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <BeakerIcon className="h-5 w-5 mr-2 text-blue-400" />
                            Case #{index + 1}
                        </div>
                        <div className="flex items-center">
                            {testResult.passed ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                                <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            <span className={testResult.passed ? 'text-green-600' : 'text-red-600'}>
                                {testResult.passed ? 'Passed' : 'Failed'}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap">
                            {testResult.actual || 'No output'}
                        </div>
                    </motion.div>
                ))}
            </div>

            {result.error && (
                <div className="mt-6 p-4 bg-red-100/50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <h3 className="text-red-500 font-medium mb-2 flex items-center gap-2">
                        <XCircleIcon className="h-5 w-5" />
                        Runtime Error
                    </h3>
                    <pre className="text-sm text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap">
                        {result.error}
                    </pre>
                </div>
            )}
        </motion.div>
    );
};

const defaultCodes = {
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    return 0;
}`,
    python: `def solve():
    pass

if __name__ == "__main__":
    solve()`,
    java: `public class Main {
    public static void main(String[] args) {
    }
}`,
};

const ProblemPage = () => {
    const { id } = useParams();
    const { fetchProblemById, problem } = problemStore();
    const [activeTab, setActiveTab] = useState('description');
    const [language, setLanguage] = useState('python');
    const [codes, setCodes] = useState({ ...defaultCodes });
    const [showHints, setShowHints] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);
    const { user } = userStore();

    useEffect(() => {
        if (id) fetchProblemById(id);
    }, [id, language, fetchProblemById]);

    useEffect(() => {
        if (!codes[language]) {
            setCodes((prev) => ({ ...prev, [language]: defaultCodes[language] }));
        }
    }, [language]);

    const startPolling = (submissionId) => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await axios.get(`/submissions/user/${submissionId}`);
                const { data } = response;
                if (data.status !== 'Pending') {
                    clearInterval(pollInterval);
                    setIsSubmitting(false);
                    setSubmissionResult(data);
                }
            } catch (error) {
                clearInterval(pollInterval);
                setIsSubmitting(false);
                setSubmissionError('Failed to get submission results');
            }
        }, 2000);
    };

    const handleSubmit = async () => {
        if (!user) return toast.error("Login to Submit Code");
        try {
            setIsSubmitting(true);
            setSubmissionError(null);
            setSubmissionResult(null);

            const response = await axios.post('/submissions', {
                user_id: user._id,
                problem_id: id,
                code: codes[language],
                language
            });
            startPolling(response.data._id);
        } catch (error) {
            setIsSubmitting(false);
            setSubmissionError(error.response?.data?.error || 'Submission failed');
        }
    };

    if (!problem) return <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">Loading...</div>;

    return (
        <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
            {/* Navigation Header */}
            <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/problems" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">
                        <ChevronLeftIcon className="h-6 w-6 mr-2" />
                        <span className="font-medium">Back to Problems</span>
                    </Link>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                problem.difficulty === 'Easy' ? 'bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                problem.difficulty === 'Medium' ? 'bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                'bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}>
                                {problem.difficulty}
                            </span>
                            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                                <ChartBarIcon className="h-5 w-5" />
                                <span className="text-sm">
                                    {problem.solveCount} solved / {problem.attemptCount} attempted
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden">
                {/* Problem Content */}
                <div className="w-1/2 overflow-y-auto p-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8 max-w-3xl mx-auto"
                    >
                        {/* Problem Header */}
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{problem.title}</h1>
                            <div className="flex flex-wrap gap-2">
                                {problem.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200/50 dark:border-gray-700/50">
                            <nav className="flex space-x-8">
                                {['description', 'testcases', 'hints'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-4 px-1 border-b-2 font-medium text-sm relative ${
                                            activeTab === tab
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        {activeTab === tab && (
                                            <motion.div
                                                className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"
                                                layoutId="underline"
                                            />
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content Sections */}
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {activeTab === 'description' && (
                                    <div className="prose max-w-none dark:prose-invert">
                                        <div className="space-y-6">
                                            <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br>') }} />

                                            {problem.constraints && (
                                                <div className="bg-orange-50/50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50">
                                                    <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-300 mb-3">
                                                        Constraints
                                                    </h3>
                                                    <pre className="text-sm text-orange-700 dark:text-orange-300 font-mono whitespace-pre-wrap">
                                                        {problem.constraints}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'testcases' && (
                                    <div className="space-y-6">
                                        {problem.testCases.filter(testCase => !testCase.is_hidden).map((testCase, index) => (
                                            <div key={index} className="bg-gray-50/50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                                                <div className="grid grid-cols-2 gap-6 text-sm">
                                                    <div>
                                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                                                            <CodeBracketIcon className="h-4 w-4" />
                                                            Input
                                                        </div>
                                                        <pre className="text-gray-600 dark:text-gray-300 font-mono whitespace-pre-wrap">
                                                            {testCase.is_hidden ? 'Hidden' : testCase.input}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                                                            <CheckCircleIcon className="h-4 w-4" />
                                                            Expected Output
                                                        </div>
                                                        <pre className="text-gray-600 dark:text-gray-300 font-mono whitespace-pre-wrap">
                                                            {testCase.expected_output}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'hints' && (
                                    <div className="space-y-6">
                                        <button
                                            onClick={() => setShowHints(!showHints)}
                                            className="flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                        >
                                            <LightBulbIcon className="h-6 w-6 mr-2" />
                                            {showHints ? 'Hide Hints' : 'Show Hints'}
                                        </button>

                                        {showHints && (
                                            <motion.ul
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-4 pl-6"
                                            >
                                                {problem.hints.map((hint, index) => (
                                                    <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                                        <span className="text-blue-500 font-bold mt-1">#{index + 1}</span>
                                                        {hint}
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Submission Results */}
                        {submissionResult && <SubmissionResult result={submissionResult} />}
                        {submissionError && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 bg-red-100/50 dark:bg-red-900/20 rounded-xl border border-red-200/50 dark:border-red-800/50"
                            >
                                <p className="text-red-600 dark:text-red-400">{submissionError}</p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Code Editor Section */}
                <div className="w-1/2 flex flex-col bg-gray-900 border-l border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center gap-2 text-gray-300">
                                <CodeBracketIcon className="h-6 w-6 text-blue-400" />
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg border border-gray-600 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="python">Python</option>
                                    <option value="cpp">C++</option>
                                    <option value="java">Java</option>
                                </select>
                            </div>
                        </div>
                        <motion.button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                            className={`px-6 py-3 text-white rounded-lg font-medium transition-all ${
                                isSubmitting
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg'
                            }`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Code →'}
                        </motion.button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <MonacoEditor
                            height="100%"
                            defaultLanguage={language}
                            language={language}
                            theme="vs-dark"
                            value={codes[language]}
                            onChange={(value) => setCodes((prev) => ({ ...prev, [language]: value || '' }))}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                fontLigatures: true,
                                contextmenu: false,
                                scrollbar: {
                                    vertical: 'hidden',
                                    horizontal: 'hidden',
                                    handleMouseWheel: false
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemPage;