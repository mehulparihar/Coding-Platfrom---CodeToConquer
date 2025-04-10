import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { problemStore } from '../stores/problemStore';
import { contestStore } from '../stores/contestStore';
import { FiX, FiEdit, FiTrash, FiPlus, FiCode, FiClock } from 'react-icons/fi';
import Modal from 'react-modal';
import { MdComputer } from 'react-icons/md';
import toast from 'react-hot-toast';

// Modal.setAppElement('#root');

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [isContestModalOpen, setIsContestModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedContest, setSelectedContest] = useState(null);

  const { problems, fetchAllProblem, createProblem, updateProblem, deleteProblem } = problemStore();
  const { contests, getContest, createContest, updateContest, deleteContest } = contestStore();

  // Problem Form State
  const [problemForm, setProblemForm] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    constraints: '',
    tags: [],
    hints: [],
    starterCodes: { python: '', cpp: '', java: '' },
    testCases: [{ input: '', expected_output: '', is_hidden: false }]
  });

  // Contest Form State
  const [contestForm, setContestForm] = useState({
    title: '',
    description: '',
    problems: [],
    startTime: '',
    endTime: '',
    isPublished: false
  });

  useEffect(() => {
    fetchAllProblem();
    getContest();
  }, [fetchAllProblem, getContest]);

  // Problem Handlers
  const handleProblemSubmit = async (e) => {
    e.preventDefault();
    try {
      // if (selectedProblem) {
      //   await updateProblem(selectedProblem._id, problemForm);
      // } else {
        await createProblem(problemForm);
      // }
      setIsProblemModalOpen(false);
      resetForms();
    } catch (error) {
      console.error('Error saving problem:', error);
    }
  };

  const handleAddTestCase = () => {
    setProblemForm({
      ...problemForm,
      testCases: [...problemForm.testCases, { input: '', expected_output: '', is_hidden: false }]
    });
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...problemForm.testCases];
    newTestCases[index][field] = value;
    setProblemForm({ ...problemForm, testCases: newTestCases });
  };

  // Contest Handlers
  const handleContestSubmit = async (e) => {
    e.preventDefault();
    try {
      const contestData = {
        ...contestForm,
        startTime: new Date(contestForm.startTime),
        endTime: new Date(contestForm.endTime)
      }; 
      await createContest(contestData);
      setIsContestModalOpen(false);
      resetForms();
    } catch (error) {
      console.error('Error saving contest:', error);
    }
  };
  const handleDeleteProblem = async (problemId) => {
    try {
        await deleteProblem(problemId);
    } catch (error) {
        toast.error("Error in deleting problem");
    }
  }
  const resetForms = () => {
    setProblemForm({
      title: '',
      description: '',
      difficulty: 'Medium',
      constraints: '',
      tags: [],
      hints: [],
      starterCodes: { python: '', cpp: '', java: '' },
      testCases: [{ input: '', expected_output: '', is_hidden: false }]
    });
    setContestForm({
      title: '',
      description: '',
      problems: [],
      startTime: '',
      endTime: '',
      isPublished: false
    });
    setSelectedProblem(null);
    setSelectedContest(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Tabs and Tables remain similar */}
      <div className="max-w-7xl mx-auto">
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-2 mb-8 border-b border-gray-200">
            {['Problems', 'Contests'].map((tab, idx) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  `px-4 py-2 text-sm font-medium rounded-t-lg ${selected
                    ? 'bg-white text-blue-600 border border-b-0 border-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            {/* Problems Tab */}
            <Tab.Panel>
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Manage Problems</h3>
                  <button
                    onClick={() => setIsProblemModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FiPlus /> Add Problem
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {problems.map(problem => (
                        <tr key={problem._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{problem.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {problem.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              {problem.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedProblem(problem);
                                setProblemForm(problem);
                                setIsProblemModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteProblem(problem._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Tab.Panel>

            {/* Contests Tab */}
            <Tab.Panel>
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Manage Contests</h3>
                  <button
                    onClick={() => setIsContestModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FiPlus /> Create Contest
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Problem</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contests.map(contest => (
                        <tr key={contest._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{contest.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {problems.find(p => p._id === contest.problemId)?.title || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(contest.startTime).toLocaleDateString()} - {' '}
                            {new Date(contest.endTime).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              {contest.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedContest(contest);
                                setContestForm(contest);
                                setIsContestModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteContest(contest._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Problem Modal */}
      <Modal
        isOpen={isProblemModalOpen}
        onRequestClose={() => setIsProblemModalOpen(false)}
        className="bg-white rounded-lg p-6 max-w-3xl mx-auto mt-20 shadow-xl max-h-[80vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{selectedProblem ? 'Edit Problem' : 'Create Problem'}</h2>
          <FiX className="cursor-pointer" onClick={() => setIsProblemModalOpen(false)} />
        </div>

        <form onSubmit={handleProblemSubmit} className="space-y-6">
          {/* Core Problem Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                required
                className="w-full p-2 border rounded"
                value={problemForm.title}
                onChange={e => setProblemForm({ ...problemForm, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                className="w-full p-2 border rounded"
                value={problemForm.difficulty}
                onChange={e => setProblemForm({ ...problemForm, difficulty: e.target.value })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                required
                className="w-full p-2 border rounded h-32"
                value={problemForm.description}
                onChange={e => setProblemForm({ ...problemForm, description: e.target.value })}
              />
          </div>
          <div>
              <label className="block text-sm font-medium mb-2">Constraints</label>
              <textarea
                required
                className="w-full p-2 border rounded"
                value={problemForm.constraints}
                onChange={e => setProblemForm({ ...problemForm, constraints: e.target.value })}
              />
          </div>

          {/* Tags and Hints */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
              <input
                className="w-full p-2 border rounded"
                value={problemForm.tags.join(',')}
                onChange={e => setProblemForm({ ...problemForm, tags: e.target.value.split(',') })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hints</label>
              <div className="space-y-2">
                {problemForm.hints.map((hint, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      className="flex-1 p-2 border rounded"
                      value={hint}
                      onChange={e => {
                        const newHints = [...problemForm.hints];
                        newHints[index] = e.target.value;
                        setProblemForm({ ...problemForm, hints: newHints });
                      }}
                    />
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={() => setProblemForm({
                        ...problemForm,
                        hints: problemForm.hints.filter((_, i) => i !== index)
                      })}
                    >
                      <FiTrash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-blue-500 text-sm"
                  onClick={() => setProblemForm({ ...problemForm, hints: [...problemForm.hints, ''] })}
                >
                  Add Hint
                </button>
              </div>
            </div>
          </div>

          {/* Starter Code */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MdComputer /> Starter Code
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {['python', 'java', 'cpp'].map(lang => (
                <div key={lang}>
                  <label className="block text-sm font-medium mb-2">{lang.charAt(0).toUpperCase() + lang.slice(1)}</label>
                  <textarea
                    className="w-full p-2 border rounded h-32 font-mono text-sm"
                    value={problemForm.starterCodes[lang]}
                    onChange={e => setProblemForm({
                      ...problemForm,
                      starterCodes: { ...problemForm.starterCodes, [lang]: e.target.value }
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Test Cases */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FiCode /> Test Cases
            </h3>
            {problemForm.testCases.map((testCase, index) => (
              <div key={index} className="border p-4 rounded space-y-2">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Input</label>
                    <textarea
                      className="w-full p-2 border rounded h-20 font-mono text-sm"
                      value={testCase.input}
                      onChange={e => handleTestCaseChange(index, 'input', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Expected Output</label>
                    <textarea
                      className="w-full p-2 border rounded h-20 font-mono text-sm"
                      value={testCase.expected_output}
                      onChange={e => handleTestCaseChange(index, 'expected_output', e.target.value)}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={testCase.is_hidden}
                    onChange={e => handleTestCaseChange(index, 'is_hidden', e.target.checked)}
                  />
                  Hidden Test Case
                </label>
                <button
                  type="button"
                  className="text-red-500 text-sm"
                  onClick={() => setProblemForm({
                    ...problemForm,
                    testCases: problemForm.testCases.filter((_, i) => i !== index)
                  })}
                >
                  Remove Test Case
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-100 text-blue-600 px-4 py-2 rounded"
              onClick={handleAddTestCase}
            >
              Add Test Case
            </button>
          </div>

          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full">
            {selectedProblem ? 'Update Problem' : 'Create Problem'}
          </button>
        </form>
      </Modal>

      {/* Contest Modal */}
      <Modal
        isOpen={isContestModalOpen}
        onRequestClose={() => setIsContestModalOpen(false)}
        className="bg-white rounded-lg p-6 max-w-2xl mx-auto mt-20 shadow-xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{selectedContest ? 'Edit Contest' : 'Create Contest'}</h2>
          <FiX className="cursor-pointer" onClick={() => setIsContestModalOpen(false)} />
        </div>

        <form onSubmit={handleContestSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              required
              className="w-full p-2 border rounded"
              value={contestForm.title}
              onChange={e => setContestForm({ ...contestForm, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded h-32"
              value={contestForm.description}
              onChange={e => setContestForm({ ...contestForm, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Problems</label>
            <select
              multiple
              className="w-full p-2 border rounded h-32"
              value={contestForm.problems}
              onChange={e => setContestForm({
                ...contestForm,
                problems: Array.from(e.target.selectedOptions, option => option.value)
              })}
            >
              {problems.map(problem => (
                <option key={problem._id} value={problem._id}>
                  {problem.title} ({problem.difficulty})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <input
                type="datetime-local"
                required
                className="w-full p-2 border rounded"
                value={contestForm.startTime}
                onChange={e => setContestForm({ ...contestForm, startTime: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <input
                type="datetime-local"
                required
                className="w-full p-2 border rounded"
                value={contestForm.endTime}
                onChange={e => setContestForm({ ...contestForm, endTime: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={contestForm.isPublished}
              onChange={e => setContestForm({ ...contestForm, isPublished: e.target.checked })}
            />
            Publish Contest Immediately
          </label>

          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full">
            {selectedContest ? 'Update Contest' : 'Create Contest'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPage;