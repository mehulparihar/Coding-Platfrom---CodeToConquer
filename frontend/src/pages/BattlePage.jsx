import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  FiUsers,
  FiClock,
  FiCode,
  FiMessageSquare,
  FiAward
} from 'react-icons/fi';
import {
  ChevronLeftIcon,
  CodeBracketIcon,
  LightBulbIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import io from 'socket.io-client';
import { battleStore } from '../stores/battleStore';
import { userStore } from '../stores/userStore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className={`text-xl font-semibold mb-4 ${result.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>
        {result.status}
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 font-medium text-gray-700 dark:text-gray-300">
          <div>Test Case</div>
          <div>Status</div>
          <div>Output</div>
        </div>
        {result.results?.map((testResult, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-sm">Case #{index + 1}</div>
            <div className="flex items-center">
              {testResult.passed ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
              )}
              {testResult.passed ? 'Passed' : 'Failed'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {testResult.actual || 'No output'}
            </div>
          </div>
        ))}
      </div>
      {result.error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 rounded">
          <h3 className="text-red-600 dark:text-red-200 font-medium mb-2">Error:</h3>
          <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">{result.error}</pre>
        </div>
      )}
    </div>
  );
};

const BattlePage = () => {
  const [activeTab, setActiveTab] = useState('description');
  const [showHints, setShowHints] = useState(false);
  const [language, setLanguage] = useState('python');
  const [codes, setCodes] = useState({ ...defaultCodes });
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]); // Local state for chat messages
  const [timeLeft, setTimeLeft] = useState(0);
  
  const { id } = useParams();
  const { getBattleById, battle, updateBattleState } = battleStore();
  const { user } = userStore();
  
  const socket = useRef(null);

  // Load battle details when id or battle update changes.
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
      // Load participant's code if exists.
      const participant = battle?.participants.find(p => p.user.toString() === user?._id.toString());
      if (participant?.code) {
        setCodes(prev => ({ ...prev, [language]: participant.code }));
      }
    };

    loadBattle();
  }, [id, battle?.problem, user, language, getBattleById]);

  // Initialize Socket.IO when user and battle id are available.
  useEffect(() => {
    if (!user?._id || !id) return;

    socket.current = io('http://localhost:5000', {
      withCredentials: true,
      // auth: { token: localStorage.getItem('token') }
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
      // Assume backend sends { user: { _id, username }, text, timestamp }
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

  // Local timer: update every second based on battle.endTime.
  useEffect(() => {
    if (battle && battle.endTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(battle.endTime).getTime();
        const diff = Math.max(0, end - now);
        setTimeLeft(Math.floor(diff / 1000));
        if (diff <= 0) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
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

  if (!battle) return <div className="p-8 text-center">Loading battle...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Battle Header */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{battle.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  {battle.difficulty}
                </span>
                <span className="flex items-center gap-1">
                  <FiUsers className="text-gray-500" />
                  {battle.currentParticipants}/{battle.maxParticipants}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FiClock className="text-gray-500" />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                {battle.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Problem Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiCode className="text-blue-500" /> Problem Statement
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {battle.problem.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm dark:bg-blue-900 dark:text-blue-200">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="flex space-x-8">
                  {['description', 'testcases', 'hints'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
              {activeTab === 'description' && (
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: battle.problem.description.replace(/\n/g, '<br>') }} />
                  {battle.problem.constraints && (
                    <div className="mt-4 bg-orange-50 dark:bg-orange-900 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                      <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">Constraints</h3>
                      <pre className="text-sm text-orange-700 dark:text-orange-300 whitespace-pre-wrap">
                        {battle.problem.constraints}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'testcases' && (
                <div className="space-y-4">
                  {battle.problem.testCases
                    .filter(testCase => !testCase.is_hidden)
                    .map((testCase, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Input:</span>
                            <pre className="mt-1 text-gray-600 dark:text-gray-200 whitespace-pre-wrap">
                              {testCase.input}
                            </pre>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Expected Output:</span>
                            <pre className="mt-1 text-gray-600 dark:text-gray-200 whitespace-pre-wrap">
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
                    className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    <LightBulbIcon className="h-5 w-5 mr-2" />
                    {showHints ? 'Hide Hints' : 'Show Hints'}
                  </button>
                  {showHints && (
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                      {battle.problem.hints.map((hint, index) => (
                        <li key={index}>{hint}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Code Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
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
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
                <button
                  onClick={handleCodeSubmit}
                  disabled={isSubmitting || battle.status !== 'active'}
                  className={`px-4 py-2 text-white rounded-md text-sm font-medium transition-all ${
                    isSubmitting || battle.status !== 'active'
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                </button>
              </div>
              <Editor
                height="60vh"
                language={language}
                value={codes[language]}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14
                }}
              />
            </div>

            {/* Submission Results */}
            {submissionResult && <SubmissionResult result={submissionResult} />}
            {submissionError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 rounded">
                <p className="text-red-600 dark:text-red-200">{submissionError}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Leaderboard */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiAward className="text-yellow-500" /> Leaderboard
              </h2>
              <div className="space-y-3">
                {battle.participants
                  .sort((a, b) => (b.solved ? 1 : -1) || a.completionTime - b.completionTime)
                  .map((participant, index) => (
                    <div key={participant._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center gap-3">
                        <span>#{index + 1}</span>
                        <span>{participant.user?.username}</span>
                        {participant.solved && <span className="text-green-500">✓</span>}
                      </div>
                      <div className="text-sm text-right">
                        <div>{participant.executionTime || '--'}ms</div>
                        <div className="text-gray-500">
                          {participant.submissionStatus}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiMessageSquare className="text-green-500" /> Chat
              </h2>
              <div className="h-64 overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <div key={index} className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">{message.user?.username || message.user}</span>
                      <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">{message.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default BattlePage;
