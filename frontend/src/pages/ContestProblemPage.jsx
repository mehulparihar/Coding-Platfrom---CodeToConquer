import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MonacoEditor from "@monaco-editor/react";
import { problemStore } from '../stores/problemStore';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, CodeBracketIcon, LightBulbIcon, ChartBarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { userStore } from '../stores/userStore';
import axios from '../lib/axios';

const SubmissionResult = ({ result }) => {
    if (!result) return null;

    return (
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
            <div className={`text-xl font-semibold mb-4 ${result.status === 'Accepted' ? 'text-green-600' : 'text-red-600'
                }`}>
                {result.status}
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 font-medium text-gray-700">
                    <div>Test Case</div>
                    <div>Status</div>
                    <div>Output</div>
                </div>

                {result.results?.map((testResult, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
                        <div className="text-sm">Case #{index + 1}</div>
                        <div className="flex items-center">
                            {testResult.passed ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                                <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            {testResult.passed ? 'Passed' : 'Failed'}
                        </div>
                        <div className="text-sm text-gray-600 whitespace-pre-wrap">
                            {testResult.actual || 'No output'}
                        </div>
                    </div>
                ))}
            </div>

            {result.error && (
                <div className="mt-4 p-4 bg-red-50 rounded">
                    <h3 className="text-red-600 font-medium mb-2">Error:</h3>
                    <pre className="text-sm text-red-700 whitespace-pre-wrap">{result.error}</pre>
                </div>
            )}
        </div>
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


const ContestProblemPage = () => {


    const { contestId, problemId } = useParams();
    const { fetchProblemById, problem } = problemStore();
    const [activeTab, setActiveTab] = useState('description');
    const [language, setLanguage] = useState('python');
    const [codes, setCodes] = useState({ ...defaultCodes });;
    const [showHints, setShowHints] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);
    const {user} = userStore();
    useEffect(() => {
        if (problemId) {
            fetchProblemById(problemId)
        }
        
    }, [problemId, language, fetchProblemById]);
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
                    console.log(data);
                }
            } catch (error) {
                clearInterval(pollInterval);
                setIsSubmitting(false);
                setSubmissionError('Failed to get submission results');
            }
        }, 2000);
    };
   
      
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            setSubmissionError(null);
            setSubmissionResult(null);

            const response = await axios.post(`/contest/${contestId}/submit`, {
                user_id: user._id, 
                problem_id: problemId,
                code: codes[language],
                language
            });
            startPolling(response.data._id);
        } catch (error) {
            setIsSubmitting(false);
            setSubmissionError(error.response?.data?.error || 'Submission failed');
        }
    };


    if (!problem) return <div>Loading...</div>;

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Navigation Header */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to= {`/contests/${contestId}`} className="flex items-center text-gray-600 hover:text-blue-600">
                        <ChevronLeftIcon className="h-5 w-5 mr-1" />
                        Back to Problems
                    </Link>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {problem.difficulty}
                            </span>
                            <span className="text-sm text-gray-500">
                                <ChartBarIcon className="h-4 w-4 inline mr-1" />
                                {problem.solveCount} solved / {problem.attemptCount} attempted
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden">
                {/* Problem Content */}
                <div className="w-1/2 bg-white overflow-y-auto p-8 border-r border-gray-200">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-900">{problem.title}</h1>

                        {/* Tags */}
                        {/* <div className="flex flex-wrap gap-2">
                            {problem.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {tag}
                                </span>
                            ))}
                        </div> */}

                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8">
                                {['description', 'testcases'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-8">
                            {activeTab === 'description' && (
                                <div className="prose max-w-none">
                                    <div className="space-y-6">
                                        <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br>')  }} />

                                        {problem.constraints && (
                                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                                <h3 className="text-sm font-semibold text-orange-800 mb-2">Constraints</h3>
                                                <pre className="text-sm text-orange-700 whitespace-pre-wrap">
                                                    {problem.constraints}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'testcases' && (
                                <div className="space-y-4">
                                    {problem.testCases.filter(testCase => !testCase.is_hidden).map((testCase, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Input:</span>
                                                    <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                                                        {testCase.is_hidden ? 'Hidden' : testCase.input}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Expected Output:</span>
                                                    <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                                                        {testCase.expected_output}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'hints' && (
                                <div className="space-y-4">
                                    <button
                                        onClick={() => setShowHints(!showHints)}
                                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        <LightBulbIcon className="h-5 w-5 mr-2" />
                                        {showHints ? 'Hide Hints' : 'Show Hints'}
                                    </button>

                                    {showHints && (
                                        <ul className="space-y-3 list-disc pl-6 text-gray-700">
                                            {problem.hints.map((hint, index) => (
                                                <li key={index} className="leading-relaxed">
                                                    {hint}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                        {submissionResult && <SubmissionResult result={submissionResult} />}
                        {submissionError && (
                            <div className="mt-4 p-4 bg-red-50 rounded">
                                <p className="text-red-600">{submissionError}</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Code Editor Section */}

                <div className="w-1/2 flex flex-col bg-gray-900">
                    <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
                        <div className="flex items-center space-x-4">
                            <CodeBracketIcon className="h-5 w-5 text-gray-400" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-gray-800 text-gray-200 px-3 py-1 rounded-md border border-gray-600 text-sm"
                            >
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                            </select>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`px-4 py-2 text-white rounded-md text-sm font-medium transition-colors ${isSubmitting
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
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
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestProblemPage;

