import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  FiUsers,
  FiClock,
  FiCode,
  FiMessageSquare,
  FiAward,
  FiStar,
  FiAlertTriangle,
  FiInfo
} from 'react-icons/fi';
import {
  ChevronLeftIcon,
  CodeBracketIcon,
  LightBulbIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import io from 'socket.io-client';
import { battleStore } from '../stores/battleStore';
import { userStore } from '../stores/userStore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import UserAvatar from '../components/UserAvatar';

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
  javascript: `// Write your JavaScript solution here`
};

const SubmissionResult = ({ result }) => {
  if (!result) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
    >
      <div className={`text-2xl font-bold mb-6 flex items-center gap-3 ${result.status === 'Accepted' ? 'text-emerald-600' : 'text-rose-600'}`}>
        {result.status === 'Accepted' ? (
          <CheckCircleIcon className="h-8 w-8" />
        ) : (
          <XCircleIcon className="h-8 w-8" />
        )}
        {result.status}
      </div>
      
      <div className="space-y-5">
        <div className="grid grid-cols-4 gap-5 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">
          <div>Test Case</div>
          <div>Status</div>
          <div>Output</div>
          <div>Expected</div>
        </div>
        
        {result.results?.map((testResult, index) => (
          <div
            key={index}
            className="grid grid-cols-4 gap-5 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <div className="text-sm font-medium">Case #{index + 1}</div>
            <div className="flex items-center gap-2">
              {testResult.passed ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-rose-500" />
              )}
              <span>{testResult.passed ? 'Passed' : 'Failed'}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 font-mono whitespace-pre-wrap bg-gray-200 dark:bg-gray-800 p-2 rounded">
              {testResult.actual || 'No output'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 font-mono whitespace-pre-wrap bg-gray-200 dark:bg-gray-800 p-2 rounded">
              {testResult.expected}
            </div>
          </div>
        ))}
      </div>

      {result.error && (
        <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900 rounded-xl border border-rose-200 dark:border-rose-700">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-200 font-medium mb-3">
            <FiAlertTriangle className="h-5 w-5" />
            <h3>Runtime Error</h3>
          </div>
          <pre className="text-sm font-mono text-rose-700 dark:text-rose-300 whitespace-pre-wrap">
            {result.error}
          </pre>
        </div>
      )}
    </motion.div>
  );
};

const BattlePage = () => {
  // All hook calls are declared at the top level.
  const [activeTab, setActiveTab] = useState('description');
  const [showHints, setShowHints] = useState(false);
  const [language, setLanguage] = useState('python');
  const [codes, setCodes] = useState({ ...defaultCodes });
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const { id } = useParams();
  const { getBattleById, battle, updateBattleState } = battleStore();
  const { user } = userStore();
  const navigate = useNavigate();
  
  const chatEndRef = useRef(null);
  const editorRef = useRef(null);
  const socket = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load battle data on mount/update.
  useEffect(() => {
    const loadBattle = async () => {
      await getBattleById(id);
      if (battle?.problem?.starterCodes) {
        setCodes({
          python: battle.problem.starterCodes.python || defaultCodes.python,
          cpp: battle.problem.starterCodes.cpp || defaultCodes.cpp,
          java: battle.problem.starterCodes.java || defaultCodes.java,
          javascript: defaultCodes.javascript
        });
      }
      const participant = battle?.participants.find(
        (p) => p.user.toString() === user?._id.toString()
      );
      if (participant?.code) {
        setCodes(prev => ({ ...prev, [language]: participant.code }));
      }
    };
    if (battle?.duration) setTimeLeft(Number(battle.duration) * 60);
    loadBattle();
  }, [id, user, language, getBattleById]);

  // Initialize Socket.IO when user and battle id are available.
  useEffect(() => {
    if (!user?._id || !id) return;
    socket.current = io('http://localhost:5000', {
      withCredentials: true,
    });
    socket.current.on("connect", () => {
      console.log("Connected to Socket.IO backend:", socket.current.id);
    });
    socket.current.emit('joinBattle', { battleId: id, userId: user._id });
    socket.current.on('submissionResult', (result) => {
      setIsSubmitting(false);
      setSubmissionResult(result);
      setSubmissionError(null);
    });
    socket.current.on('submissionError', (error) => {
      setIsSubmitting(false);
      setSubmissionError(error);
    });
    socket.current.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });
    socket.current.on('timeUpdate', ({ timeLeft, status }) => {
      setTimeLeft(Math.floor(timeLeft / 1000));
      updateBattleState({ status });
    });
    socket.current.on('battleCompleted', (updatedBattle) => {
      updateBattleState(updatedBattle);
      if (updatedBattle.status === 'completed' && updatedBattle.winner) {
        toast.success(`Battle Completed! Winner: ${updatedBattle.winner.username}`, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    });
    return () => {
      socket.current?.off("submissionResult");
      socket.current?.off("submissionError");
      socket.current?.off("newMessage");
      socket.current?.off("timeUpdate");
      socket.current?.off("battleCompleted");
      socket.current?.disconnect();
    };
  }, [id, user]);

  // Local timer based on battle.endTime.
  useEffect(() => {
    if (battle) {
      let computedEnd;
      if (battle.endTime) {
        computedEnd = new Date(battle.endTime).getTime();
      } else if (battle.startTime && battle.duration) {
        computedEnd = new Date(battle.startTime).getTime() + Number(battle.duration) * 60000;
      }
      if (computedEnd) {
        const updateTimer = () => {
          const now = Date.now();
          const diff = Math.max(0, computedEnd - now);
          setTimeLeft(Math.floor(diff / 1000));
        };
        updateTimer();
        const interval = setInterval(() => {
          updateTimer();
          if (Date.now() >= computedEnd) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [battle]);

  const handleCodeChange = (value) => {
    const newCodes = { ...codes, [language]: value };
    setCodes(newCodes);
    if (socket.current) {
      socket.current.emit('updateCode', {
        battleId: id,
        userId: user._id,
        code: value,
        language
      });
    }
  };

  const handleCodeSubmit = () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionResult(null);
    socket.current.emit('submitSolution', {
      battleId: id,
      userId: user._id,
      code: codes[language],
      language
    });
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      socket.current.emit('chatMessage', {
        battleId: id,
        userId: user._id,
        message: chatMessage
      });
      setChatMessage('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Instead of an early return, conditionally render inside the main JSX.
  const renderContent = () => {
    if (!battle) {
      return <div className="p-8 text-center">Loading battle...</div>;
    }

    // Check if the current user is the battle owner.
    const isBattleOwner = battle.battleOwner && battle.battleOwner.toString() === user?._id.toString();
    const getWinnerUsername = () => {
      if (battle.status !== "completed" || !battle.participants || battle.participants.length === 0)
        return null;
      const solvedParticipants = battle.participants.filter(p => p.solved);
      if (!solvedParticipants.length) return null;
      const winnerParticipant = solvedParticipants.sort((a, b) => a.completionTime - b.completionTime)[0];
      return winnerParticipant?.user?.username || null;
    };

    const winnerUsername = getWinnerUsername();
    

    const getMedalColor = (position) => {
      switch(position) {
        case 0: return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
        case 1: return 'bg-gradient-to-r from-gray-400 to-gray-500';
        case 2: return 'bg-gradient-to-r from-amber-600 to-amber-700';
        default: return 'bg-gray-100 dark:bg-gray-700';
      }
    };

    return (
      <div className="space-y-8">
        {/* Winner Banner */}
        <AnimatePresence>
          {battle.status === 'completed' && winnerUsername && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-center shadow-lg"
            >
              <div className="flex items-center justify-center gap-4">
                <TrophyIcon className="h-8 w-8 text-yellow-300" />
                <div>
                  <h2 className="text-2xl font-bold">Battle Concluded!</h2>
                  <p className="text-lg">Champion: {winnerUsername}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Battle Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {battle.title}
                <span className="ml-3 text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {battle.difficulty}
                </span>
              </h1>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <FiUsers className="h-5 w-5" />
                  <span>{battle.currentParticipants}/{battle.maxParticipants} Warriors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiClock className="h-5 w-5" />
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl flex items-center gap-3">
                <FiInfo className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Code: {battle.battleCode}</span>
              </div>
              {battle.status === "waiting" && isBattleOwner && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    socket.current.emit("startBattle", { battleId: id, userId: user._id });
                    socket.current.emit("startTimer", id);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Commence Battle
                </motion.button>
              )}
            </div>
          </div>

          {/* Team Status */}
          {battle.battleType === 'Team' && (
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-xl border border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-bold mb-3 text-blue-600 dark:text-blue-300">Team Alpha</h3>
                <div className="flex items-center gap-3">
                  {battle.teamA.map((member) => (
                    <UserAvatar 
                      user={member} 
                      size="lg"
                      className="border-2 border-blue-500"
                    />
                  ))}
                </div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900 rounded-xl border border-red-200 dark:border-red-700">
                <h3 className="text-lg font-bold mb-3 text-red-600 dark:text-red-300">Team Beta</h3>
                <div className="flex items-center gap-3">
                  {battle.teamB.map((member) => (
                    <UserAvatar 
                      user={member} 
                      size="lg"
                      className="border-2 border-red-500"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Problem Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <SparklesIcon className="h-7 w-7 text-purple-500" />
                  Problem Statement
                </h2>
                <div className="flex gap-2">
                  {battle?.problem?.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 dark:from-purple-800 dark:to-blue-800 dark:text-purple-100 text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="flex space-x-8">
                  {['description', 'testcases', 'hints'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {activeTab === 'description' && (
                    <>
                      <div 
                        className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: battle.problem.description }}
                      />
                      {battle.problem.constraints && (
                        <div className="p-5 bg-amber-50 dark:bg-amber-900 rounded-xl border border-amber-200 dark:border-amber-700">
                          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-200 mb-3">
                            <FiAlertTriangle className="h-5 w-5" />
                            <h3 className="font-semibold">Important Constraints</h3>
                          </div>
                          <pre className="text-sm font-mono text-amber-800 dark:text-amber-300 whitespace-pre-wrap">
                            {battle.problem.constraints}
                          </pre>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'testcases' && (
                    <div className="space-y-5">
                      {battle.problem.testCases
                        .filter(testCase => !testCase.is_hidden)
                        .map((testCase, index) => (
                          <div 
                            key={index}
                            className="p-5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                          >
                            <div className="grid grid-cols-2 gap-5 text-sm">
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                                  INPUT
                                </label>
                                <pre className="font-mono p-3 bg-white dark:bg-gray-800 rounded-lg">
                                  {testCase.input}
                                </pre>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                                  EXPECTED OUTPUT
                                </label>
                                <pre className="font-mono p-3 bg-white dark:bg-gray-800 rounded-lg">
                                  {testCase.expected_output}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {activeTab === 'hints' && (
                    <div className="space-y-5">
                      <button
                        onClick={() => setShowHints(!showHints)}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
                      >
                        <LightBulbIcon className="h-6 w-6" />
                        {showHints ? 'Collapse Hints' : 'Reveal Strategic Insights'}
                      </button>
                      <AnimatePresence>
                        {showHints && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            {battle.problem.hints.map((hint, index) => (
                              <div 
                                key={index}
                                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-purple-500"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-purple-500 font-bold">#{index + 1}</span>
                                  <p className="text-gray-700 dark:text-gray-300">{hint}</p>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Editor Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl">
                <div className="flex items-center gap-4">
                  <CodeBracketIcon className="h-6 w-6 text-white" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent text-white px-3 py-2 rounded-md border border-white/20 text-sm font-medium focus:ring-2 focus:ring-white"
                  >
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCodeSubmit}
                  disabled={isSubmitting || battle.status !== 'active'}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold ${
                    isSubmitting || battle.status !== 'active'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-white text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Execute Solution'
                  )}
                </motion.button>
              </div>
              
              <Editor
                height="60vh"
                language={language}
                value={codes[language]}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                }}
                onMount={(editor) => (editorRef.current = editor)}
                className="rounded-b-2xl"
              />
            </div>

            {/* Submission Results */}
            <AnimatePresence>
              {submissionResult && (
                <SubmissionResult result={submissionResult} />
              )}
            </AnimatePresence>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Leaderboard */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FiAward className="h-7 w-7 text-amber-500" />
                Leaderboard
              </h2>
              <div className="space-y-4">
                {battle.participants
                  .sort((a, b) => (b.solved ? 1 : -1) || a.completionTime - b.completionTime)
                  .map((participant, index) => (
                    <div 
                      key={participant._id}
                      className={`p-4 rounded-xl transition-all ${
                        participant.user._id === user._id
                          ? 'bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getMedalColor(index)}`}>
                            <span className="text-sm font-bold text-white">
                              {index > 2 ? index + 1 : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <UserAvatar user={participant.user} size="md" />
                            <div>
                              <h3 className="font-medium">{participant.user.username}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                {participant.solved && (
                                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Solved
                                  </span>
                                )}
                                {participant.executionTime && (
                                  <span>{participant.executionTime}ms</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {participant.submissionStatus}
                          </div>
                          {participant.completionTime && (
                            <div className="text-xs text-gray-500">
                              {formatTime(participant.completionTime)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Chat Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FiMessageSquare className="h-7 w-7 text-cyan-500" />
                War Room Chat
              </h2>
              <div className="h-96 overflow-y-auto pr-3 mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {messages.map((message, index) => (
                  <div 
                    key={index}
                    className={`flex ${message.user._id === user._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      message.user._id === user._id 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-gray-100 dark:bg-gray-700 rounded-bl-none'
                    }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <UserAvatar user={message.user} size="xs" />
                        <span className="text-sm font-medium">
                          {message.user._id === user._id ? 'You' : message.user.username}
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Send strategic message..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium shadow-md hover:bg-purple-700 transition-colors"
                >
                  Send
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <ToastContainer position="bottom-right" theme="colored" />
    </>
  );
};

export default BattlePage;
