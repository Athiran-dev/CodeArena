import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate, Link } from 'react-router';
import axiosClient from "../utils/axiosClient";
import ChatAi from '../components/ChatAi';
import { ArrowLeft, Home } from 'lucide-react';

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [error, setError] = useState(null);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [selectedSolutionLanguage, setSelectedSolutionLanguage] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);
  const [forceLanguageUpdate, setForceLanguageUpdate] = useState(0);
  const editorRef = useRef(null);
  let { problemId } = useParams();
  const navigate = useNavigate();

  const { handleSubmit } = useForm();

  // Helper function for default code
  const getDefaultCode = (language) => {
    switch (language) {
      case 'cpp':
        return `#include <iostream>
#include <vector>
using namespace std;

vector<int> solution(vector<int>& nums, int target) {
    // Write your solution here
    return {};
}`;
      case 'java':
        return `import java.util.*;
class Solution {
    public int[] solution(int[] nums, int target) {
        // Write your solution here
        return new int[0];
    }
}`;
      case 'python':
        return `def solution(nums, target):
    # Write your solution here
    return []`;
      case 'javascript':
        return `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var solution = function(nums, target) {
    // Write your solution here
    return [];
};`;
      default:
        return '// Write your solution here';
    }
  };

  // Normalize language names for consistency
  const normalizeLanguage = (lang) => {
    if (!lang) return 'cpp';
    
    const normalized = lang.toLowerCase();
    if (normalized === 'c++') return 'cpp';
    return normalized;
  };

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching problem with ID:', problemId);
        
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        console.log('Problem data received:', response.data);
        
        if (!response.data) {
          throw new Error('No problem data received');
        }
        
        setProblem(response.data);
        
        let initialCode = getDefaultCode(selectedLanguage);
        if (response.data.startCode && Array.isArray(response.data.startCode)) {
          const codeObj = response.data.startCode.find(sc => 
            sc.language && normalizeLanguage(sc.language) === selectedLanguage
          );
          if (codeObj?.initialCode) {
            initialCode = codeObj.initialCode;
          }
        }
        
        setCode(initialCode);
        
      } catch (error) {
        console.error('Error fetching problem:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  // Fetch user submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        setUserSubmissions(response.data || []);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setUserSubmissions([]);
      }
    };

    if (problemId) {
      fetchSubmissions();
    }
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem && !isUpdatingCode) {
      let newCode = getDefaultCode(selectedLanguage);
      
      if (problem.startCode && Array.isArray(problem.startCode)) {
        const codeObj = problem.startCode.find(sc => 
          sc.language && normalizeLanguage(sc.language) === selectedLanguage
        );
        if (codeObj?.initialCode) {
          newCode = codeObj.initialCode;
        }
      }
      
      setCode(newCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('codearena-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { background: '020617' }, 
        { token: 'keyword', foreground: '06b6d4' }, 
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' }, 
        { token: 'string', foreground: '10b981' }, 
        { token: 'number', foreground: 'd946ef' }, 
        { token: 'type', foreground: '3b82f6' }, 
      ],
      colors: {
        'editor.background': '#020617', 
        'editor.foreground': '#f8fafc', 
        'editor.lineHighlightBackground': '#0f172a', 
        'editorLineNumber.foreground': '#334155', 
        'editorLineNumber.activeForeground': '#06b6d4', 
        'editor.selectionBackground': '#0ea5e940', 
        'editor.inactiveSelectionBackground': '#0ea5e920',
        'editorCursor.foreground': '#06b6d4', 
        'editorIndentGuide.background': '#1e293b', 
        'editorIndentGuide.activeBackground': '#334155', 
        'editorWidget.background': '#0f172a', 
        'editorWidget.border': '#1e293b', 
      }
    });
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setForceLanguageUpdate(prev => prev + 1);
  };

  const handleSolutionLanguageChange = (language) => {
    setSelectedSolutionLanguage(language);
  };

  const handleUseSolution = (solutionCode, solutionLanguage) => {
    setIsUpdatingCode(true);
    
    const normalizedLang = normalizeLanguage(solutionLanguage);
    
    console.log('Setting language to:', normalizedLang, 'from:', solutionLanguage);
    
    setSelectedLanguage(normalizedLang);
    setForceLanguageUpdate(prev => prev + 1);
    
    setTimeout(() => {
      setCode(solutionCode);
      setActiveRightTab('code');
      setIsUpdatingCode(false);
      
      if (editorRef.current) {
        setTimeout(() => {
          editorRef.current?.layout();
          if (window.monaco && editorRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
              window.monaco.editor.setModelLanguage(model, getLanguageForMonaco(normalizedLang));
            }
          }
        }, 100);
      }
    }, 100);
  };

  const handleViewSubmission = (submissionCode, submissionLanguage) => {
    setIsUpdatingCode(true);
    
    const normalizedLang = normalizeLanguage(submissionLanguage);
    
    console.log('View submission - Setting language to:', normalizedLang, 'from:', submissionLanguage);
    
    setSelectedLanguage(normalizedLang);
    setForceLanguageUpdate(prev => prev + 1);
    
    setTimeout(() => {
      setCode(submissionCode);
      setActiveRightTab('code');
      setIsUpdatingCode(false);
      
      if (editorRef.current) {
        setTimeout(() => {
          editorRef.current?.layout();
          if (window.monaco && editorRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
              window.monaco.editor.setModelLanguage(model, getLanguageForMonaco(normalizedLang));
            }
          }
        }, 100);
      }
    }, 100);
  };

  // FIXED: Improved handleRun function
  const handleRun = async () => {
    setActionLoading(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      console.log('Run response:', response.data);
      
      // Handle different response structures
      const result = response.data || {};
      
      // Extract test cases from various possible field names
      let testCases = [];
      if (Array.isArray(result.testCases)) {
        testCases = result.testCases;
      } else if (Array.isArray(result.results)) {
        testCases = result.results;
      } else if (result.data && Array.isArray(result.data.testCases)) {
        testCases = result.data.testCases;
      }
      
      // Determine success status
      const isSuccess = result.success || 
                       result.accepted || 
                       (result.passedTestCases !== undefined && result.passedTestCases === result.totalTestCases) ||
                       false;

      setRunResult({
        success: isSuccess,
        error: result.error || result.message || null,
        runtime: result.runtime || result.time || 'N/A',
        memory: result.memory || 'N/A',
        testCases: testCases,
        message: result.message || result.detail || null,
        passedTestCases: result.passedTestCases || result.passed || 0,
        totalTestCases: result.totalTestCases || result.total || testCases.length
      });
      
      setActiveRightTab('testcase');
      
    } catch (error) {
      console.error('Error running code:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to run code';
      
      setRunResult({
        success: false,
        error: errorMessage,
        runtime: 'N/A',
        memory: 'N/A',
        testCases: [],
        message: 'Execution failed',
        passedTestCases: 0,
        totalTestCases: 0
      });
      
      setActiveRightTab('testcase');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setActionLoading(true);
    setSubmitResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
      setActiveRightTab('result');
      
      // Refresh submissions after submitting
      const submissionsResponse = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
      setUserSubmissions(submissionsResponse.data || []);
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        accepted: false,
        error: error.response?.data?.message || 'Submission failed',
        passedTestCases: 0,
        totalTestCases: 0
      });
      setActiveRightTab('result');
    } finally {
      setActionLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    const normalizedLang = normalizeLanguage(lang);
    switch (normalizedLang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      case 'python': return 'python';
      default: return 'javascript';
    }
  };

  const getLanguageDisplayName = (lang) => {
    const normalizedLang = normalizeLanguage(lang);
    switch (normalizedLang) {
      case 'cpp': return 'C++';
      case 'javascript': return 'JavaScript';
      case 'java': return 'Java';
      case 'python': return 'Python';
      default: return lang;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // FIXED: Improved function to determine test case status
  const getTestCaseStatus = (testCase) => {
    // Check multiple possible status indicators
    if (testCase.status_id === 3 || testCase.passed === true || testCase.status === 'passed') {
      return { passed: true, text: '✓ Passed' };
    }
    if (testCase.status_id === 4 || testCase.passed === false || testCase.status === 'failed') {
      return { passed: false, text: '✗ Failed' };
    }
    // Default to passed if no clear indicator (for backward compatibility)
    return { passed: true, text: '✓ Passed' };
  };

  // Function to render solutions tab
  const renderSolutionsTab = () => {
    if (!problem?.referenceSolution || problem.referenceSolution.length === 0) {
      return (
        <div className="text-gray-500 text-center py-8">
          <p>No solutions available yet.</p>
          <p className="text-sm mt-2">Solutions will be added soon!</p>
        </div>
      );
    }

    const filteredSolutions = selectedSolutionLanguage === 'all' 
      ? problem.referenceSolution 
      : problem.referenceSolution.filter(sol => 
          sol.language && normalizeLanguage(sol.language) === selectedSolutionLanguage
        );

    return (
      <div className="space-y-6">
        <div className="flex gap-2 mb-4 flex-wrap">
          <button 
            className={`btn btn-sm ${selectedSolutionLanguage === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleSolutionLanguageChange('all')}
          >
            All Solutions
          </button>
          <button 
            className={`btn btn-sm ${selectedSolutionLanguage === 'cpp' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleSolutionLanguageChange('cpp')}
          >
            C++
          </button>
          <button 
            className={`btn btn-sm ${selectedSolutionLanguage === 'java' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleSolutionLanguageChange('java')}
          >
            Java
          </button>
          <button 
            className={`btn btn-sm ${selectedSolutionLanguage === 'python' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleSolutionLanguageChange('python')}
          >
            Python
          </button>
        </div>

        {filteredSolutions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No solutions available for {selectedSolutionLanguage}.
          </div>
        ) : (
          filteredSolutions.map((solution, index) => (
            <div key={index} className="border border-slate-700 rounded-lg">
              <div className="bg-slate-800 px-4 py-2 rounded-t-lg flex justify-between items-center">
                <h3 className="font-semibold">{getLanguageDisplayName(solution.language)} Solution</h3>
                <span className="text-xs badge badge-success">Official Solution</span>
              </div>
              <div className="p-0">
                <Editor
                  height="400px"
                  language={getLanguageForMonaco(solution.language)}
                  value={solution.completeCode}
                  theme="codearena-dark"
                  beforeMount={handleEditorWillMount}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'all',
                    scrollbar: {
                      vertical: 'auto',
                      horizontal: 'auto'
                    }
                  }}
                />
              </div>
              <div className="p-4 bg-slate-900 border-t border-slate-700">
                <div className="mt-3">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleUseSolution(solution.completeCode, solution.language)}
                    disabled={isUpdatingCode}
                  >
                    {isUpdatingCode ? 'Loading...' : 'Use This Solution'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Function to render submissions tab
  const renderSubmissionsTab = () => {
    if (!userSubmissions || !Array.isArray(userSubmissions) || userSubmissions.length === 0) {
      return (
        <div className="text-gray-500 text-center py-8">
          <p>No submissions yet.</p>
          <p className="text-sm mt-2">Submit your solution to see it here!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Your Submissions</h3>
          <span className="text-sm text-gray-500">
            {userSubmissions.length} submission(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Time</th>
                <th>Language</th>
                <th>Status</th>
                <th>Runtime</th>
                <th>Memory</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userSubmissions.map((submission, index) => {
                const submissionTime = submission?.createdAt ? new Date(submission.createdAt).toLocaleString() : 'N/A';
                const submissionLanguage = submission?.language ? getLanguageDisplayName(submission.language) : 'N/A';
                const submissionStatus = submission?.status || 'pending';
                const runtime = submission?.runtime ? `${submission.runtime} ms` : 'N/A';
                const memory = submission?.memory ? `${submission.memory} KB` : 'N/A';
                const submissionCode = submission?.code || '';

                return (
                  <tr key={index}>
                    <td>{submissionTime}</td>
                    <td>{submissionLanguage}</td>
                    <td>
                      <span className={`badge ${
                        submissionStatus === 'accepted' ? 'badge-success' :
                        submissionStatus === 'wrong' ? 'badge-error' :
                        submissionStatus === 'runtime_error' ? 'badge-warning' :
                        submissionStatus === 'compilation_error' ? 'badge-error' :
                        'badge-warning'
                      }`}>
                        {submissionStatus}
                      </span>
                    </td>
                    <td>{runtime}</td>
                    <td>{memory}</td>
                    <td>
                      <button 
                        className="btn btn-xs btn-ghost"
                        onClick={() => handleViewSubmission(submissionCode, submission?.language || 'cpp')}
                        disabled={isUpdatingCode || !submissionCode}
                      >
                        {isUpdatingCode ? 'Loading...' : 'View Code'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // FIXED: Improved test case rendering
  const renderTestCase = (testCase, index) => {
    const status = getTestCaseStatus(testCase);
    
    return (
      <div key={index} className="bg-slate-900 p-3 rounded text-xs mb-3 border">
        <div className="font-mono space-y-1">
          <div><strong>Test Case {index + 1}:</strong></div>
          
          {/* Handle different input field names */}
          {(testCase.stdin || testCase.input) && (
            <div><strong>Input:</strong> {testCase.stdin || testCase.input}</div>
          )}
          
          {/* Handle different expected output field names */}
          {(testCase.expected_output || testCase.expected) && (
            <div><strong>Expected:</strong> {testCase.expected_output || testCase.expected}</div>
          )}
          
          {/* Handle different actual output field names */}
          {(testCase.stdout || testCase.output) && (
            <div><strong>Output:</strong> {testCase.stdout || testCase.output}</div>
          )}
          
          {/* Status display */}
          <div className={status.passed ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {status.text}
          </div>
          
          {/* Show error if any */}
          {testCase.error && (
            <div className="text-red-500 bg-red-50 p-2 rounded mt-1">
              <strong>Error:</strong> {testCase.error}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-4">Loading problem...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-error max-w-md">
          <div>
            <span>Error loading problem: {error}</span>
          </div>
          <button 
            className="btn btn-sm btn-ghost"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-warning max-w-md">
          <div>
            <span>Problem not found</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-950 font-sans relative overflow-hidden text-slate-300">
      <div className="absolute inset-0 z-0 bg-mesh-dark animate-mesh opacity-20 pointer-events-none mix-blend-screen"></div>
      
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border border-white/10 bg-slate-900/60 backdrop-blur-xl relative z-10 m-2 rounded-2xl overflow-hidden shadow-clay">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between p-4 bg-slate-950/50 backdrop-blur-md border-b border-white/10 shadow-glass z-20">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500 transition-all shadow-clay-inner group"
              title="Back to Arena"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <h1 className="text-xl font-black text-white tracking-tight truncate max-w-xs">{problem.title}</h1>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r ${
            problem.difficulty === 'easy' ? 'from-green-500/20 to-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
            problem.difficulty === 'medium' ? 'from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30' : 
            'from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/30'
          } shadow-glass`}>
            {problem.difficulty}
          </div>
        </div>

        {/* Left Tabs */}
        <div className="flex px-4 pt-4 pb-0 bg-slate-950/30 border-b border-white/5 space-x-2 overflow-x-auto scrollbar-hide z-20">
          {[
            { id: 'description', label: 'Description' },
            { id: 'editorial', label: 'Editorial' },
            { id: 'solutions', label: 'Solutions' },
            { id: 'chat', label: 'AI Assistant' },
            { id: 'submissions', label: 'Submissions' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`px-4 py-3 text-sm font-bold transition-all relative whitespace-nowrap ${
                activeLeftTab === tab.id ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              onClick={() => setActiveLeftTab(tab.id)}
            >
              {tab.label}
              {activeLeftTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_-2px_10px_rgba(6,182,212,0.8)] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div className="p-6">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {problem.description}
                    </div>
                  </div>

                  {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Examples:</h3>
                      <div className="space-y-4">
                        {problem.visibleTestCases.map((example, index) => (
                          <div key={index} className="bg-slate-800 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                            <div className="space-y-2 text-sm font-mono">
                              <div><strong>Input:</strong> {example.input}</div>
                              <div><strong>Output:</strong> {example.output}</div>
                              {example.explanation && (
                                <div><strong>Explanation:</strong> {example.explanation}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="p-6 prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">Editorial</h2>
                  {problem.editorial?.content ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {problem.editorial.content}
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      Editorial content will be available soon.
                    </div>
                  )}
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Solutions</h2>
                  {renderSolutionsTab()}
                </div>
              )}

              {activeLeftTab === 'chat' && (
                <div className="h-full flex flex-col">
                  <div className="p-6 pb-2">
                    <h2 className="text-xl font-bold mb-3">AI Coding Assistant</h2>
                    <div className="bg-slate-800 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-600">
                        Ask me anything about this problem! I can help you understand the concepts, 
                        debug your code, or explain solutions.
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ChatAi 
                      problem={problem} 
                      currentCode={code} 
                      currentLanguage={selectedLanguage}
                    />
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">My Submissions</h2>
                  {renderSubmissionsTab()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col bg-slate-900/60 backdrop-blur-xl relative z-10 my-2 mr-2 rounded-2xl overflow-hidden shadow-clay border border-white/10">
        {/* Right Tabs */}
        <div className="flex px-4 pt-4 pb-0 bg-slate-950/30 border-b border-white/5 space-x-2 z-20">
          {[
            { id: 'code', label: 'Code Editor' },
            { id: 'testcase', label: 'Testcases' },
            { id: 'result', label: 'Result' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`px-4 py-3 text-sm font-bold transition-all relative ${
                activeRightTab === tab.id ? 'text-fuchsia-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              onClick={() => setActiveRightTab(tab.id)}
            >
              {tab.label}
              {activeRightTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-fuchsia-400 shadow-[0_-2px_10px_rgba(232,121,249,0.8)] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Language Selector */}
              <div className="flex justify-between items-center p-3 bg-slate-950/50 border-b border-white/5 z-20">
                <div className="flex gap-2 p-1 bg-slate-900 rounded-xl shadow-clay-inner">
                  {['cpp', 'java', 'python', 'javascript'].map((lang) => (
                    <button
                      key={lang}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedLanguage === lang 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glass' 
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                      disabled={actionLoading || isUpdatingCode}
                    >
                      {getLanguageDisplayName(lang)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1">
                <Editor
                  key={`editor-${selectedLanguage}-${forceLanguageUpdate}`}
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  beforeMount={handleEditorWillMount}
                  theme="codearena-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                  loading={<div>Loading editor...</div>}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 flex justify-between items-center z-20">
                <button 
                  className="px-5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-slate-300 text-sm font-bold hover:bg-slate-700 shadow-clay-inner transition-colors"
                  onClick={() => setActiveRightTab('testcase')}
                >
                  Console
                </button>
                <div className="flex gap-3">
                  <button
                    className={`px-6 py-2.5 rounded-xl border border-emerald-500/50 text-emerald-400 text-sm font-bold hover:bg-emerald-500/10 transition-all ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleRun}
                    disabled={actionLoading || !code.trim() || isUpdatingCode}
                  >
                    {actionLoading ? 'Running...' : 'Run Code'}
                  </button>
                  <button
                    className={`px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-black shadow-mirror hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={actionLoading || !code.trim() || isUpdatingCode}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Test Results</h3>
              
              {actionLoading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                  <span className="ml-4">Running your code...</span>
                </div>
              ) : runResult ? (
                <div className={`alert ${runResult.success ? 'alert-success' : 'alert-error'} mb-4`}>
                  <div>
                    {runResult.success ? (
                      <div>
                        <h4 className="font-bold text-lg">✅ Execution Successful!</h4>
                        <div className="mt-3 space-y-2 text-sm">
                          {runResult.runtime && runResult.runtime !== 'N/A' && (
                            <p><strong>Runtime:</strong> {runResult.runtime}</p>
                          )}
                          {runResult.memory && runResult.memory !== 'N/A' && (
                            <p><strong>Memory:</strong> {runResult.memory}</p>
                          )}
                          {runResult.totalTestCases > 0 && (
                            <p><strong>Test Cases:</strong> {runResult.passedTestCases}/{runResult.totalTestCases} passed</p>
                          )}
                        </div>

                        {/* Test Cases Details */}
                        {runResult.testCases && runResult.testCases.length > 0 ? (
                          <div className="mt-4 space-y-3">
                            <h5 className="font-semibold">Detailed Results:</h5>
                            {runResult.testCases.map((tc, i) => renderTestCase(tc, i))}
                          </div>
                        ) : runResult.message ? (
                          <div className="mt-3 p-2 bg-slate-900 rounded">
                            <p>{runResult.message}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-lg">❌ Execution Failed</h4>
                        {runResult.error && (
                          <div className="mt-2 p-2 bg-error-content text-error rounded">
                            <strong>Error:</strong> {runResult.error}
                          </div>
                        )}

                        {/* Show test cases even if some failed */}
                        {runResult.testCases && runResult.testCases.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <h5 className="font-semibold">Test Results:</h5>
                            {runResult.testCases.map((tc, i) => renderTestCase(tc, i))}
                          </div>
                        )}
                        
                        {runResult.totalTestCases > 0 && (
                          <div className="mt-3 text-sm">
                            <p><strong>Summary:</strong> {runResult.passedTestCases}/{runResult.totalTestCases} test cases passed</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <p>Click "Run" to test your code with the example test cases.</p>
                  <p className="text-sm mt-2">Your code will be executed against sample inputs to verify correctness.</p>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Submission Result</h3>
              {submitResult ? (
                <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
                  <div>
                    {submitResult.accepted ? (
                      <div>
                        <h4 className="font-bold text-lg">🎉 Accepted</h4>
                        <div className="mt-4 space-y-2">
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                          <p>Runtime: {submitResult.runtime || 'N/A'}</p>
                          <p>Memory: {submitResult.memory || 'N/A'} </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-lg">❌ {submitResult.error || 'Submission Failed'}</h4>
                        <div className="mt-4 space-y-2">
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Submit" to submit your solution for evaluation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;


// import { useState, useEffect, useRef } from 'react';
// import { useForm } from 'react-hook-form';
// import Editor from '@monaco-editor/react';
// import { useParams, useNavigate, Link } from 'react-router';
// import axiosClient from "../utils/axiosClient";
// import ChatAi from '../components/ChatAi';
// import { ArrowLeft, Home } from 'lucide-react';

// const ProblemPage = () => {
//   const [problem, setProblem] = useState(null);
//   const [selectedLanguage, setSelectedLanguage] = useState('cpp');
//   const [code, setCode] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [runResult, setRunResult] = useState(null);
//   const [submitResult, setSubmitResult] = useState(null);
//   const [activeLeftTab, setActiveLeftTab] = useState('description');
//   const [activeRightTab, setActiveRightTab] = useState('code');
//   const [error, setError] = useState(null);
//   const [userSubmissions, setUserSubmissions] = useState([]);
//   const [selectedSolutionLanguage, setSelectedSolutionLanguage] = useState('all');
//   const [actionLoading, setActionLoading] = useState(false);
//   const [isUpdatingCode, setIsUpdatingCode] = useState(false);
//   const [forceLanguageUpdate, setForceLanguageUpdate] = useState(0);
//   const editorRef = useRef(null);
//   let { problemId } = useParams();
//   const navigate = useNavigate();

//   const { handleSubmit } = useForm();

//   // Cleanup function when component unmounts
//   useEffect(() => {
//     return () => {
//       // Cleanup when component unmounts (user navigates away from problem page)
//       if (problemId) {
//         // Only clear if navigating away from problem page entirely
//         const currentPath = window.location.pathname;
//         if (!currentPath.includes('/problem/')) {
//           sessionStorage.removeItem(`chat-${problemId}`);
//         }
//       }
//     };
//   }, [problemId]);

//   // Enhanced cleanup when navigating to home
//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       // Clear all chat sessions when leaving the site
//       Object.keys(sessionStorage).forEach(key => {
//         if (key.startsWith('chat-')) {
//           sessionStorage.removeItem(key);
//         }
//       });
//     };

//     const handleRouteChange = () => {
//       // Check if navigating to home or away from problem page
//       const currentPath = window.location.pathname;
//       if (currentPath === '/' || !currentPath.includes('/problem/')) {
//         if (problemId) {
//           sessionStorage.removeItem(`chat-${problemId}`);
//         }
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     window.addEventListener('popstate', handleRouteChange);

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       window.removeEventListener('popstate', handleRouteChange);
//     };
//   }, [problemId]);

//   // Function to apply code from AI to editor
//   const applyCodeToEditor = (code) => {
//     setCode(code);
//     setActiveRightTab('code');
    
//     // Focus the editor after applying code
//     setTimeout(() => {
//       if (editorRef.current) {
//         editorRef.current.focus();
//         // Scroll to top of editor
//         editorRef.current.revealLine(1);
//       }
//     }, 100);
//   };

//   // Set up global function for ChatAi to call
//   useEffect(() => {
//     window.applyCodeToEditor = applyCodeToEditor;
    
//     return () => {
//       // Cleanup global function when component unmounts
//       delete window.applyCodeToEditor;
//     };
//   }, []);

//   // Helper function for default code
//   const getDefaultCode = (language) => {
//     switch (language) {
//       case 'cpp':
//         return `#include <iostream>
// #include <vector>
// using namespace std;

// vector<int> solution(vector<int>& nums, int target) {
//     // Write your solution here
//     return {};
// }`;
//       case 'java':
//         return `import java.util.*;
// class Solution {
//     public int[] solution(int[] nums, int target) {
//         // Write your solution here
//         return new int[0];
//     }
// }`;
//       case 'python':
//         return `def solution(nums, target):
//     # Write your solution here
//     return []`;
//       case 'javascript':
//         return `/**
//  * @param {number[]} nums
//  * @param {number} target
//  * @return {number[]}
//  */
// var solution = function(nums, target) {
//     // Write your solution here
//     return [];
// };`;
//       default:
//         return '// Write your solution here';
//     }
//   };

//   // Normalize language names for consistency
//   const normalizeLanguage = (lang) => {
//     if (!lang) return 'cpp';
    
//     const normalized = lang.toLowerCase();
//     if (normalized === 'c++') return 'cpp';
//     return normalized;
//   };

//   // Fetch problem data
//   useEffect(() => {
//     const fetchProblem = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         console.log('Fetching problem with ID:', problemId);
        
//         const response = await axiosClient.get(`/problem/problemById/${problemId}`);
//         console.log('Problem data received:', response.data);
        
//         if (!response.data) {
//           throw new Error('No problem data received');
//         }
        
//         setProblem(response.data);
        
//         let initialCode = getDefaultCode(selectedLanguage);
//         if (response.data.startCode && Array.isArray(response.data.startCode)) {
//           const codeObj = response.data.startCode.find(sc => 
//             sc.language && normalizeLanguage(sc.language) === selectedLanguage
//           );
//           if (codeObj?.initialCode) {
//             initialCode = codeObj.initialCode;
//           }
//         }
        
//         setCode(initialCode);
        
//       } catch (error) {
//         console.error('Error fetching problem:', error);
//         setError(error.response?.data?.message || error.message || 'Failed to load problem');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (problemId) {
//       fetchProblem();
//     }
//   }, [problemId]);

//   // Fetch user submissions
//   useEffect(() => {
//     const fetchSubmissions = async () => {
//       try {
//         const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
//         setUserSubmissions(response.data || []);
//       } catch (error) {
//         console.error('Error fetching submissions:', error);
//         setUserSubmissions([]);
//       }
//     };

//     if (problemId) {
//       fetchSubmissions();
//     }
//   }, [problemId]);

//   // Update code when language changes
//   useEffect(() => {
//     if (problem && !isUpdatingCode) {
//       let newCode = getDefaultCode(selectedLanguage);
      
//       if (problem.startCode && Array.isArray(problem.startCode)) {
//         const codeObj = problem.startCode.find(sc => 
//           sc.language && normalizeLanguage(sc.language) === selectedLanguage
//         );
//         if (codeObj?.initialCode) {
//           newCode = codeObj.initialCode;
//         }
//       }
      
//       setCode(newCode);
//     }
//   }, [selectedLanguage, problem]);

//   const handleEditorChange = (value) => {
//     setCode(value || '');
//   };

//   const handleEditorDidMount = (editor) => {
//     editorRef.current = editor;
//   };

//   const handleLanguageChange = (language) => {
//     setSelectedLanguage(language);
//     setForceLanguageUpdate(prev => prev + 1);
//   };

//   const handleSolutionLanguageChange = (language) => {
//     setSelectedSolutionLanguage(language);
//   };

//   const handleUseSolution = (solutionCode, solutionLanguage) => {
//     setIsUpdatingCode(true);
    
//     const normalizedLang = normalizeLanguage(solutionLanguage);
    
//     console.log('Setting language to:', normalizedLang, 'from:', solutionLanguage);
    
//     setSelectedLanguage(normalizedLang);
//     setForceLanguageUpdate(prev => prev + 1);
    
//     setTimeout(() => {
//       setCode(solutionCode);
//       setActiveRightTab('code');
//       setIsUpdatingCode(false);
      
//       if (editorRef.current) {
//         setTimeout(() => {
//           editorRef.current?.layout();
//           if (window.monaco && editorRef.current) {
//             const model = editorRef.current.getModel();
//             if (model) {
//               window.monaco.editor.setModelLanguage(model, getLanguageForMonaco(normalizedLang));
//             }
//           }
//         }, 100);
//       }
//     }, 100);
//   };

//   const handleViewSubmission = (submissionCode, submissionLanguage) => {
//     setIsUpdatingCode(true);
    
//     const normalizedLang = normalizeLanguage(submissionLanguage);
    
//     console.log('View submission - Setting language to:', normalizedLang, 'from:', submissionLanguage);
    
//     setSelectedLanguage(normalizedLang);
//     setForceLanguageUpdate(prev => prev + 1);
    
//     setTimeout(() => {
//       setCode(submissionCode);
//       setActiveRightTab('code');
//       setIsUpdatingCode(false);
      
//       if (editorRef.current) {
//         setTimeout(() => {
//           editorRef.current?.layout();
//           if (window.monaco && editorRef.current) {
//             const model = editorRef.current.getModel();
//             if (model) {
//               window.monaco.editor.setModelLanguage(model, getLanguageForMonaco(normalizedLang));
//             }
//           }
//         }, 100);
//       }
//     }, 100);
//   };

//   const handleRun = async () => {
//     setActionLoading(true);
//     setRunResult(null);
    
//     try {
//       const response = await axiosClient.post(`/submission/run/${problemId}`, {
//         code,
//         language: selectedLanguage
//       });

//       setRunResult(response.data);
//       setActiveRightTab('testcase');
      
//     } catch (error) {
//       console.error('Error running code:', error);
//       setRunResult({
//         success: false,
//         error: error.response?.data?.message || 'Internal server error',
//         testCases: []
//       });
//       setActiveRightTab('testcase');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleSubmitCode = async () => {
//     setActionLoading(true);
//     setSubmitResult(null);
    
//     try {
//       const response = await axiosClient.post(`/submission/submit/${problemId}`, {
//         code: code,
//         language: selectedLanguage
//       });

//       setSubmitResult(response.data);
//       setActiveRightTab('result');
      
//       // Refresh submissions after submitting
//       const submissionsResponse = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
//       setUserSubmissions(submissionsResponse.data || []);
      
//     } catch (error) {
//       console.error('Error submitting code:', error);
//       setSubmitResult({
//         accepted: false,
//         error: error.response?.data?.message || 'Submission failed',
//         passedTestCases: 0,
//         totalTestCases: 0
//       });
//       setActiveRightTab('result');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const getLanguageForMonaco = (lang) => {
//     const normalizedLang = normalizeLanguage(lang);
//     switch (normalizedLang) {
//       case 'javascript': return 'javascript';
//       case 'java': return 'java';
//       case 'cpp': return 'cpp';
//       case 'python': return 'python';
//       default: return 'javascript';
//     }
//   };

//   const getLanguageDisplayName = (lang) => {
//     const normalizedLang = normalizeLanguage(lang);
//     switch (normalizedLang) {
//       case 'cpp': return 'C++';
//       case 'javascript': return 'JavaScript';
//       case 'java': return 'Java';
//       case 'python': return 'Python';
//       default: return lang;
//     }
//   };

//   const getDifficultyColor = (difficulty) => {
//     switch (difficulty) {
//       case 'easy': return 'text-green-500';
//       case 'medium': return 'text-yellow-500';
//       case 'hard': return 'text-red-500';
//       default: return 'text-gray-500';
//     }
//   };

//   // Function to render solutions tab
//   const renderSolutionsTab = () => {
//     if (!problem?.referenceSolution || problem.referenceSolution.length === 0) {
//       return (
//         <div className="text-gray-500 text-center py-8">
//           <p>No solutions available yet.</p>
//           <p className="text-sm mt-2">Solutions will be added soon!</p>
//         </div>
//       );
//     }

//     const filteredSolutions = selectedSolutionLanguage === 'all' 
//       ? problem.referenceSolution 
//       : problem.referenceSolution.filter(sol => 
//           sol.language && normalizeLanguage(sol.language) === selectedSolutionLanguage
//         );

//     return (
//       <div className="space-y-6">
//         <div className="flex gap-2 mb-4 flex-wrap">
//           <button 
//             className={`btn btn-sm ${selectedSolutionLanguage === 'all' ? 'btn-primary' : 'btn-ghost'}`}
//             onClick={() => handleSolutionLanguageChange('all')}
//           >
//             All Solutions
//           </button>
//           <button 
//             className={`btn btn-sm ${selectedSolutionLanguage === 'cpp' ? 'btn-primary' : 'btn-ghost'}`}
//             onClick={() => handleSolutionLanguageChange('cpp')}
//           >
//             C++
//           </button>
//           <button 
//             className={`btn btn-sm ${selectedSolutionLanguage === 'java' ? 'btn-primary' : 'btn-ghost'}`}
//             onClick={() => handleSolutionLanguageChange('java')}
//           >
//             Java
//           </button>
//           <button 
//             className={`btn btn-sm ${selectedSolutionLanguage === 'python' ? 'btn-primary' : 'btn-ghost'}`}
//             onClick={() => handleSolutionLanguageChange('python')}
//           >
//             Python
//           </button>
//         </div>

//         {filteredSolutions.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             No solutions available for {selectedSolutionLanguage}.
//           </div>
//         ) : (
//           filteredSolutions.map((solution, index) => (
//             <div key={index} className="border border-slate-700 rounded-lg">
//               <div className="bg-slate-800 px-4 py-2 rounded-t-lg flex justify-between items-center">
//                 <h3 className="font-semibold">{getLanguageDisplayName(solution.language)} Solution</h3>
//                 <span className="text-xs badge badge-success">Official Solution</span>
//               </div>
//               <div className="p-0">
//                 <Editor
//                   height="400px"
//                   language={getLanguageForMonaco(solution.language)}
//                   value={solution.completeCode}
//                   theme="vs-dark"
//                   options={{
//                     readOnly: true,
//                     minimap: { enabled: false },
//                     scrollBeyondLastLine: false,
//                     fontSize: 14,
//                     lineNumbers: 'on',
//                     wordWrap: 'on',
//                     automaticLayout: true,
//                     folding: true,
//                     lineDecorationsWidth: 10,
//                     lineNumbersMinChars: 3,
//                     renderLineHighlight: 'all',
//                     scrollbar: {
//                       vertical: 'auto',
//                       horizontal: 'auto'
//                     }
//                   }}
//                 />
//               </div>
//               <div className="p-4 bg-slate-900 border-t border-slate-700">
//                 <div className="mt-3">
//                   <button 
//                     className="btn btn-sm btn-outline"
//                     onClick={() => handleUseSolution(solution.completeCode, solution.language)}
//                     disabled={isUpdatingCode}
//                   >
//                     {isUpdatingCode ? 'Loading...' : 'Use This Solution'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     );
//   };

//   // Function to render submissions tab
//   const renderSubmissionsTab = () => {
//     if (!userSubmissions || !Array.isArray(userSubmissions) || userSubmissions.length === 0) {
//       return (
//         <div className="text-gray-500 text-center py-8">
//           <p>No submissions yet.</p>
//           <p className="text-sm mt-2">Submit your solution to see it here!</p>
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-4">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="font-semibold">Your Submissions</h3>
//           <span className="text-sm text-gray-500">
//             {userSubmissions.length} submission(s)
//           </span>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="table table-zebra w-full">
//             <thead>
//               <tr>
//                 <th>Time</th>
//                 <th>Language</th>
//                 <th>Status</th>
//                 <th>Runtime</th>
//                 <th>Memory</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {userSubmissions.map((submission, index) => {
//                 const submissionTime = submission?.createdAt ? new Date(submission.createdAt).toLocaleString() : 'N/A';
//                 const submissionLanguage = submission?.language ? getLanguageDisplayName(submission.language) : 'N/A';
//                 const submissionStatus = submission?.status || 'pending';
//                 const runtime = submission?.runtime ? `${submission.runtime} ms` : 'N/A';
//                 const memory = submission?.memory ? `${submission.memory} KB` : 'N/A';
//                 const submissionCode = submission?.code || '';

//                 return (
//                   <tr key={index}>
//                     <td>{submissionTime}</td>
//                     <td>{submissionLanguage}</td>
//                     <td>
//                       <span className={`badge ${
//                         submissionStatus === 'accepted' ? 'badge-success' :
//                         submissionStatus === 'wrong' ? 'badge-error' :
//                         submissionStatus === 'runtime_error' ? 'badge-warning' :
//                         submissionStatus === 'compilation_error' ? 'badge-error' :
//                         'badge-warning'
//                       }`}>
//                         {submissionStatus}
//                       </span>
//                     </td>
//                     <td>{runtime}</td>
//                     <td>{memory}</td>
//                     <td>
//                       <button 
//                         className="btn btn-xs btn-ghost"
//                         onClick={() => handleViewSubmission(submissionCode, submission?.language || 'cpp')}
//                         disabled={isUpdatingCode || !submissionCode}
//                       >
//                         {isUpdatingCode ? 'Loading...' : 'View Code'}
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <span className="loading loading-spinner loading-lg"></span>
//         <span className="ml-4">Loading problem...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="alert alert-error max-w-md">
//           <div>
//             <span>Error loading problem: {error}</span>
//           </div>
//           <button 
//             className="btn btn-sm btn-ghost"
//             onClick={() => window.location.reload()}
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!problem) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="alert alert-warning max-w-md">
//           <div>
//             <span>Problem not found</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex bg-slate-900">
//       {/* Left Panel */}
//       <div className="w-1/2 flex flex-col border-r border-slate-700">
//         {/* Header with Back Button */}
//         <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
//           <div className="flex items-center gap-3">
//             <Link 
//               to="/" 
//               className="btn btn-ghost btn-sm gap-2"
//               title="Back to Home"
//             >
//               <ArrowLeft size={18} />
//               <Home size={18} />
//             </Link>
//             <h1 className="text-lg font-bold truncate max-w-xs">{problem.title}</h1>
//           </div>
//           <div className={`badge badge-outline ${getDifficultyColor(problem.difficulty)}`}>
//             {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
//           </div>
//         </div>

//         {/* Left Tabs */}
//         <div className="tabs tabs-bordered bg-slate-800 px-4">
//           <button 
//             className={`tab ${activeLeftTab === 'description' ? 'tab-active' : ''}`}
//             onClick={() => setActiveLeftTab('description')}
//           >
//             Description
//           </button>
//           <button 
//             className={`tab ${activeLeftTab === 'editorial' ? 'tab-active' : ''}`}
//             onClick={() => setActiveLeftTab('editorial')}
//           >
//             Editorial
//           </button>
//           <button 
//             className={`tab ${activeLeftTab === 'solutions' ? 'tab-active' : ''}`}
//             onClick={() => setActiveLeftTab('solutions')}
//           >
//             Solutions
//           </button>
//           <button 
//             className={`tab ${activeLeftTab === 'chat' ? 'tab-active' : ''}`}
//             onClick={() => setActiveLeftTab('chat')}
//           >
//             AI Assistant
//           </button>
//           <button 
//             className={`tab ${activeLeftTab === 'submissions' ? 'tab-active' : ''}`}
//             onClick={() => setActiveLeftTab('submissions')}
//           >
//             Submissions
//           </button>
//         </div>

//         {/* Left Content */}
//         <div className="flex-1 overflow-y-auto">
//           {problem && (
//             <>
//               {activeLeftTab === 'description' && (
//                 <div className="p-6">
//                   <div className="flex items-center gap-4 mb-6">
//                     <div className="badge badge-primary">{problem.tags}</div>
//                   </div>

//                   <div className="prose max-w-none">
//                     <div className="whitespace-pre-wrap text-sm leading-relaxed">
//                       {problem.description}
//                     </div>
//                   </div>

//                   {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
//                     <div className="mt-8">
//                       <h3 className="text-lg font-semibold mb-4">Examples:</h3>
//                       <div className="space-y-4">
//                         {problem.visibleTestCases.map((example, index) => (
//                           <div key={index} className="bg-slate-800 p-4 rounded-lg">
//                             <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
//                             <div className="space-y-2 text-sm font-mono">
//                               <div><strong>Input:</strong> {example.input}</div>
//                               <div><strong>Output:</strong> {example.output}</div>
//                               {example.explanation && (
//                                 <div><strong>Explanation:</strong> {example.explanation}</div>
//                               )}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeLeftTab === 'editorial' && (
//                 <div className="p-6 prose max-w-none">
//                   <h2 className="text-xl font-bold mb-4">Editorial</h2>
//                   {problem.editorial?.content ? (
//                     <div className="whitespace-pre-wrap text-sm leading-relaxed">
//                       {problem.editorial.content}
//                     </div>
//                   ) : (
//                     <div className="text-gray-500">
//                       Editorial content will be available soon.
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeLeftTab === 'solutions' && (
//                 <div className="p-6">
//                   <h2 className="text-xl font-bold mb-4">Solutions</h2>
//                   {renderSolutionsTab()}
//                 </div>
//               )}

//               {activeLeftTab === 'chat' && (
//                 <div className="h-full flex flex-col">
//                   <div className="p-6 pb-2">
//                     <h2 className="text-xl font-bold mb-3">AI Coding Assistant</h2>
//                     <div className="bg-slate-800 rounded-lg p-4 mb-3">
//                       <p className="text-sm text-gray-600 mb-2">
//                         Ask me anything about this problem! I can help you understand the concepts, 
//                         debug your code, or explain solutions.
//                       </p>
//                       <div className="text-xs text-gray-500 space-y-1">
//                         <p>💡 <strong>Code blocks are clearly separated from text</strong></p>
//                         <p>📋 <strong>Copy code</strong> with one click</p>
//                         <p>⚡ <strong>Apply code</strong> directly to your editor</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex-1 min-h-0">
//                     <ChatAi 
//                       problem={problem} 
//                       currentCode={code} 
//                       currentLanguage={selectedLanguage}
//                     />
//                   </div>
//                 </div>
//               )}

//               {activeLeftTab === 'submissions' && (
//                 <div className="p-6">
//                   <h2 className="text-xl font-bold mb-4">My Submissions</h2>
//                   {renderSubmissionsTab()}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Right Panel */}
//       <div className="w-1/2 flex flex-col">
//         {/* Right Tabs */}
//         <div className="tabs tabs-bordered bg-slate-800 px-4">
//           <button 
//             className={`tab ${activeRightTab === 'code' ? 'tab-active' : ''}`}
//             onClick={() => setActiveRightTab('code')}
//           >
//             Code
//           </button>
//           <button 
//             className={`tab ${activeRightTab === 'testcase' ? 'tab-active' : ''}`}
//             onClick={() => setActiveRightTab('testcase')}
//           >
//             Testcase
//           </button>
//           <button 
//             className={`tab ${activeRightTab === 'result' ? 'tab-active' : ''}`}
//             onClick={() => setActiveRightTab('result')}
//           >
//             Result
//           </button>
//         </div>

//         {/* Right Content */}
//         <div className="flex-1 flex flex-col">
//           {activeRightTab === 'code' && (
//             <div className="flex-1 flex flex-col">
//               {/* Language Selector */}
//               <div className="flex justify-between items-center p-4 border-b border-slate-700">
//                 <div className="flex gap-2">
//                   {['cpp', 'java', 'python', 'javascript'].map((lang) => (
//                     <button
//                       key={lang}
//                       className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`}
//                       onClick={() => handleLanguageChange(lang)}
//                       disabled={actionLoading || isUpdatingCode}
//                     >
//                       {getLanguageDisplayName(lang)}
//                     </button>
//                   ))}
//                 </div>
//                 <span className="text-xs text-gray-500">
//                   Current: {getLanguageDisplayName(selectedLanguage)}
//                 </span>
//               </div>

//               {/* Monaco Editor */}
//               <div className="flex-1">
//                 <Editor
//                   key={`editor-${selectedLanguage}-${forceLanguageUpdate}`}
//                   height="100%"
//                   language={getLanguageForMonaco(selectedLanguage)}
//                   value={code}
//                   onChange={handleEditorChange}
//                   onMount={handleEditorDidMount}
//                   theme="vs-dark"
//                   options={{
//                     fontSize: 14,
//                     minimap: { enabled: false },
//                     scrollBeyondLastLine: false,
//                     automaticLayout: true,
//                     tabSize: 2,
//                     insertSpaces: true,
//                     wordWrap: 'on',
//                     lineNumbers: 'on',
//                     glyphMargin: false,
//                     folding: true,
//                     lineDecorationsWidth: 10,
//                     lineNumbersMinChars: 3,
//                     renderLineHighlight: 'line',
//                     selectOnLineNumbers: true,
//                     roundedSelection: false,
//                     readOnly: false,
//                     cursorStyle: 'line',
//                     mouseWheelZoom: true,
//                   }}
//                   loading={<div>Loading editor...</div>}
//                 />
//               </div>

//               {/* Action Buttons */}
//               <div className="p-4 border-t border-slate-700 flex justify-between">
//                 <div className="flex gap-2">
//                   <button 
//                     className="btn btn-ghost btn-sm"
//                     onClick={() => setActiveRightTab('testcase')}
//                   >
//                     Console
//                   </button>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     className={`btn btn-outline btn-sm ${actionLoading ? 'loading' : ''}`}
//                     onClick={handleRun}
//                     disabled={actionLoading || !code.trim() || isUpdatingCode}
//                   >
//                     Run
//                   </button>
//                   <button
//                     className={`btn btn-primary btn-sm ${actionLoading ? 'loading' : ''}`}
//                     onClick={handleSubmitCode}
//                     disabled={actionLoading || !code.trim() || isUpdatingCode}
//                   >
//                     Submit
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeRightTab === 'testcase' && (
//             <div className="flex-1 p-4 overflow-y-auto">
//               <h3 className="font-semibold mb-4">Test Results</h3>
//               {runResult ? (
//                 <div className={`alert ${runResult.success ? 'alert-success' : 'alert-error'} mb-4`}>
//                   <div>
//                     {runResult.success ? (
//                       <div>
//                         <h4 className="font-bold">✅ All test cases passed!</h4>
//                         <p className="text-sm mt-2">Runtime: {runResult.runtime + " sec"}</p>
//                         <p className="text-sm">Memory: {runResult.memory + " KB"}</p>
                        
//                         <div className="mt-4 space-y-2">
//                           {runResult.testCases.map((tc, i) => (
//                             <div key={i} className="bg-slate-900 p-3 rounded text-xs">
//                               <div className="font-mono">
//                                 <div><strong>Input:</strong> {tc.stdin}</div>
//                                 <div><strong>Expected:</strong> {tc.expected_output}</div>
//                                 <div><strong>Output:</strong> {tc.stdout}</div>
//                                 <div className={tc.status_id === 3 ? 'text-green-600' : 'text-red-600'}>
//                                   {tc.status_id === 3 ? '✓ Passed' : '✗ Failed'}
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ) : (
//                       <div>
//                         <h4 className="font-bold">❌ Error</h4>
//                         <div className="mt-4 space-y-2">
//                           {runResult.testCases.map((tc, i) => (
//                             <div key={i} className="bg-slate-900 p-3 rounded text-xs">
//                               <div className="font-mono">
//                                 <div><strong>Input:</strong> {tc.stdin}</div>
//                                 <div><strong>Expected:</strong> {tc.expected_output}</div>
//                                 <div><strong>Output:</strong> {tc.stdout}</div>
//                                 <div className={tc.status_id === 3 ? 'text-green-600' : 'text-red-600'}>
//                                   {tc.status_id === 3 ? '✓ Passed' : '✗ Failed'}
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-gray-500">
//                   Click "Run" to test your code with the example test cases.
//                 </div>
//               )}
//             </div>
//           )}

//           {activeRightTab === 'result' && (
//             <div className="flex-1 p-4 overflow-y-auto">
//               <h3 className="font-semibold mb-4">Submission Result</h3>
//               {submitResult ? (
//                 <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
//                   <div>
//                     {submitResult.accepted ? (
//                       <div>
//                         <h4 className="font-bold text-lg">🎉 Accepted</h4>
//                         <div className="mt-4 space-y-2">
//                           <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
//                           <p>Runtime: {submitResult.runtime + " sec"}</p>
//                           <p>Memory: {submitResult.memory + "KB"} </p>
//                         </div>
//                       </div>
//                     ) : (
//                       <div>
//                         <h4 className="font-bold text-lg">❌ {submitResult.error}</h4>
//                         <div className="mt-4 space-y-2">
//                           <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-gray-500">
//                   Click "Submit" to submit your solution for evaluation.
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProblemPage;


// import { useState, useEffect, useRef } from 'react';
// import { useForm } from 'react-hook-form';
// import Editor from '@monaco-editor/react';
// import { useParams, useNavigate, Link } from 'react-router';
// import axiosClient from "../utils/axiosClient";
// import ChatAi from '../components/ChatAi';
// import Editorial from '../components/Editorial';
// import { ArrowLeft, Home } from 'lucide-react';

// const ProblemPage = () => {
//   const [problem, setProblem] = useState(null);
//   const [selectedLanguage, setSelectedLanguage] = useState('cpp');
//   const [code, setCode] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [runResult, setRunResult] = useState(null);
//   const [submitResult, setSubmitResult] = useState(null);
//   const [activeLeftTab, setActiveLeftTab] = useState('description');
//   const [activeRightTab, setActiveRightTab] = useState('code');
//   const [error, setError] = useState(null);
//   const [userSubmissions, setUserSubmissions] = useState([]);
//   const [selectedSolutionLanguage, setSelectedSolutionLanguage] = useState('all');
//   const [actionLoading, setActionLoading] = useState(false);
//   const [isUpdatingCode, setIsUpdatingCode] = useState(false);
//   const [forceLanguageUpdate, setForceLanguageUpdate] = useState(0);
//   const [videoEditorial, setVideoEditorial] = useState(null); // NEW: State for video data
//   const [loadingVideo, setLoadingVideo] = useState(false); // NEW: Loading state for video
//   const editorRef = useRef(null);
//   let { problemId } = useParams();
//   const navigate = useNavigate();

//   const { handleSubmit } = useForm();

//   // NEW: Function to fetch video editorial data
//   const fetchVideoEditorial = async () => {
//     if (!problemId) return;
    
//     setLoadingVideo(true);
//     try {
//       console.log('Fetching video editorial for problem:', problemId);
//       // You'll need to create an API endpoint to get videos by problemId
//       const response = await axiosClient.get(`/video/problem/${problemId}`);
//       console.log('Video editorial response:', response.data);
      
//       if (response.data && response.data.length > 0) {
//         // Use the first video (or you can implement selection logic)
//         setVideoEditorial(response.data[0]);
//       } else {
//         setVideoEditorial(null);
//       }
//     } catch (error) {
//       console.error('Error fetching video editorial:', error);
//       setVideoEditorial(null);
//     } finally {
//       setLoadingVideo(false);
//     }
//   };

//   // NEW: Fetch video data when problemId changes or when editorial tab is active
//   useEffect(() => {
//     if (problemId && activeLeftTab === 'editorial') {
//       fetchVideoEditorial();
//     }
//   }, [problemId, activeLeftTab]);

//   // Cleanup function when component unmounts
//   useEffect(() => {
//     return () => {
//       if (problemId) {
//         const currentPath = window.location.pathname;
//         if (!currentPath.includes('/problem/')) {
//           sessionStorage.removeItem(`chat-${problemId}`);
//         }
//       }
//     };
//   }, [problemId]);

//   // Enhanced cleanup when navigating to home
//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       Object.keys(sessionStorage).forEach(key => {
//         if (key.startsWith('chat-')) {
//           sessionStorage.removeItem(key);
//         }
//       });
//     };

//     const handleRouteChange = () => {
//       const currentPath = window.location.pathname;
//       if (currentPath === '/' || !currentPath.includes('/problem/')) {
//         if (problemId) {
//           sessionStorage.removeItem(`chat-${problemId}`);
//         }
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     window.addEventListener('popstate', handleRouteChange);

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       window.removeEventListener('popstate', handleRouteChange);
//     };
//   }, [problemId]);

//   // Function to apply code from AI to editor
//   const applyCodeToEditor = (code) => {
//     setCode(code);
//     setActiveRightTab('code');
    
//     setTimeout(() => {
//       if (editorRef.current) {
//         editorRef.current.focus();
//         editorRef.current.revealLine(1);
//       }
//     }, 100);
//   };

//   // Set up global function for ChatAi to call
//   useEffect(() => {
//     window.applyCodeToEditor = applyCodeToEditor;
    
//     return () => {
//       delete window.applyCodeToEditor;
//     };
//   }, []);

//   // Helper function for default code
//   const getDefaultCode = (language) => {
//     switch (language) {
//       case 'cpp':
//         return `#include <iostream>
// #include <vector>
// using namespace std;

// vector<int> solution(vector<int>& nums, int target) {
//     // Write your solution here
//     return {};
// }`;
//       case 'java':
//         return `import java.util.*;
// class Solution {
//     public int[] solution(int[] nums, int target) {
//         // Write your solution here
//         return new int[0];
//     }
// }`;
//       case 'python':
//         return `def solution(nums, target):
//     # Write your solution here
//     return []`;
//       case 'javascript':
//         return `/**
//  * @param {number[]} nums
//  * @param {number} target
//  * @return {number[]}
//  */
// var solution = function(nums, target) {
//     // Write your solution here
//     return [];
// };`;
//       default:
//         return '// Write your solution here';
//     }
//   };

//   // Normalize language names for consistency
//   const normalizeLanguage = (lang) => {
//     if (!lang) return 'cpp';
    
//     const normalized = lang.toLowerCase();
//     if (normalized === 'c++') return 'cpp';
//     return normalized;
//   };

//   // Fetch problem data
//   useEffect(() => {
//     const fetchProblem = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         console.log('Fetching problem with ID:', problemId);
        
//         const response = await axiosClient.get(`/problem/problemById/${problemId}`);
//         console.log('Problem data received:', response.data);
        
//         if (!response.data) {
//           throw new Error('No problem data received');
//         }
        
//         setProblem(response.data);
        
//         let initialCode = getDefaultCode(selectedLanguage);
//         if (response.data.startCode && Array.isArray(response.data.startCode)) {
//           const codeObj = response.data.startCode.find(sc => 
//             sc.language && normalizeLanguage(sc.language) === selectedLanguage
//           );
//           if (codeObj?.initialCode) {
//             initialCode = codeObj.initialCode;
//           }
//         }
        
//         setCode(initialCode);
        
//       } catch (error) {
//         console.error('Error fetching problem:', error);
//         setError(error.response?.data?.message || error.message || 'Failed to load problem');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (problemId) {
//       fetchProblem();
//     }
//   }, [problemId]);

//   // Fetch user submissions
//   useEffect(() => {
//     const fetchSubmissions = async () => {
//       try {
//         const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
//         setUserSubmissions(response.data || []);
//       } catch (error) {
//         console.error('Error fetching submissions:', error);
//         setUserSubmissions([]);
//       }
//     };

//     if (problemId) {
//       fetchSubmissions();
//     }
//   }, [problemId]);

//   // Update code when language changes
//   useEffect(() => {
//     if (problem && !isUpdatingCode) {
//       let newCode = getDefaultCode(selectedLanguage);
      
//       if (problem.startCode && Array.isArray(problem.startCode)) {
//         const codeObj = problem.startCode.find(sc => 
//           sc.language && normalizeLanguage(sc.language) === selectedLanguage
//         );
//         if (codeObj?.initialCode) {
//           newCode = codeObj.initialCode;
//         }
//       }
      
//       setCode(newCode);
//     }
//   }, [selectedLanguage, problem]);

//   const handleEditorChange = (value) => {
//     setCode(value || '');
//   };

//   const handleEditorDidMount = (editor) => {
//     editorRef.current = editor;
//   };

//   const handleLanguageChange = (language) => {
//     setSelectedLanguage(language);
//     setForceLanguageUpdate(prev => prev + 1);
//   };

//   const handleSolutionLanguageChange = (language) => {
//     setSelectedSolutionLanguage(language);
//   };

//   const handleUseSolution = (solutionCode, solutionLanguage) => {
//     setIsUpdatingCode(true);
    
//     const normalizedLang = normalizeLanguage(solutionLanguage);
    
//     console.log('Setting language to:', normalizedLang, 'from:', solutionLanguage);
    
//     setSelectedLanguage(normalizedLang);
//     setForceLanguageUpdate(prev => prev + 1);
    
//     setTimeout(() => {
//       setCode(solutionCode);
//       setActiveRightTab('code');
//       setIsUpdatingCode(false);
      
//       if (editorRef.current) {
//         setTimeout(() => {
//           editorRef.current?.layout();
//           if (window.monaco && editorRef.current) {
//             const model = editorRef.current.getModel();
//             if (model) {
//               window.monaco.editor.setModelLanguage(model, getLanguageForMonaco(normalizedLang));
//             }
//           }
//         }, 100);
//       }
//     }, 100);
//   };

//   const handleViewSubmission = (submissionCode, submissionLanguage) => {
//     setIsUpdatingCode(true);
    
//     const normalizedLang = normalizeLanguage(submissionLanguage);
    
//     console.log('View submission - Setting language to:', normalizedLang, 'from:', submissionLanguage);
    
//     setSelectedLanguage(normalizedLang);
//     setForceLanguageUpdate(prev => prev + 1);
    
//     setTimeout(() => {
//       setCode(submissionCode);
//       setActiveRightTab('code');
//       setIsUpdatingCode(false);
      
//       if (editorRef.current) {
//         setTimeout(() => {
//           editorRef.current?.layout();
//           if (window.monaco && editorRef.current) {
//             const model = editorRef.current.getModel();
//             if (model) {
//               window.monaco.editor.setModelLanguage(model, getLanguageForMonaco(normalizedLang));
//             }
//           }
//         }, 100);
//       }
//     }, 100);
//   };

//   const handleRun = async () => {
//     setActionLoading(true);
//     setRunResult(null);
    
//     try {
//       const response = await axiosClient.post(`/submission/run/${problemId}`, {
//         code,
//         language: selectedLanguage
//       });

//       setRunResult(response.data);
//       setActiveRightTab('testcase');
      
//     } catch (error) {
//       console.error('Error running code:', error);
//       setRunResult({
//         success: false,
//         error: error.response?.data?.message || 'Internal server error',
//         testCases: []
//       });
//       setActiveRightTab('testcase');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleSubmitCode = async () => {
//     setActionLoading(true);
//     setSubmitResult(null);
    
//     try {
//       const response = await axiosClient.post(`/submission/submit/${problemId}`, {
//         code: code,
//         language: selectedLanguage
//       });

//       setSubmitResult(response.data);
//       setActiveRightTab('result');
      
//       // Refresh submissions after submitting
//       const submissionsResponse = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
//       setUserSubmissions(submissionsResponse.data || []);
      
//     } catch (error) {
//       console.error('Error submitting code:', error);
//       setSubmitResult({
//         accepted: false,
//         error: error.response?.data?.message || 'Submission failed',
//         passedTestCases: 0,
//         totalTestCases: 0
//       });
//       setActiveRightTab('result');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const getLanguageForMonaco = (lang) => {
//     const normalizedLang = normalizeLanguage(lang);
//     switch (normalizedLang) {
//       case 'javascript': return 'javascript';
//       case 'java': return 'java';
//       case 'cpp': return 'cpp';
//       case 'python': return 'python';
//       default: return 'javascript';
//     }
//   };

//   const getLanguageDisplayName = (lang) => {
//     const normalizedLang = normalizeLanguage(lang);
//     switch (normalizedLang) {
//       case 'cpp': return 'C++';
//       case 'javascript': return 'JavaScript';
//       case 'java': return 'Java';
//       case 'python': return 'Python';
//       default: return lang;
//     }
//   };

//   const getDifficultyColor = (difficulty) => {
//     switch (difficulty) {
//       case 'easy': return 'text-green-500';
//       case 'medium': return 'text-yellow-500';
//       case 'hard': return 'text-red-500';
//       default: return 'text-gray-500';
//     }
//   };

//   // NEW: Updated function to render editorial tab
//   const renderEditorialTab = () => {
//     if (loadingVideo) {
//       return (
//         <div className="flex justify-center items-center py-12">
//           <span className="loading loading-spinner loading-lg"></span>
//           <span className="ml-4">Loading video editorial...</span>
//         </div>
//       );
//     }

//     // Check if we have video editorial data
//     if (videoEditorial) {
//       return (
//         <div className="p-6">
//           <h2 className="text-xl font-bold mb-4">Video Editorial</h2>
//           <div className="flex justify-center">
//             <Editorial 
//               secureUrl={videoEditorial.secureUrl}
//               thumbnailUrl={videoEditorial.thumbnailUrl}
//               duration={videoEditorial.duration}
//             />
//           </div>
          
//           {/* Video information */}
//           <div className="mt-6 bg-slate-800 p-4 rounded-lg">
//             <h3 className="text-lg font-semibold mb-2">Video Information</h3>
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 <strong>Duration:</strong> {Math.floor(videoEditorial.duration / 60)}:{(videoEditorial.duration % 60).toString().padStart(2, '0')}
//               </div>
//               <div>
//                 <strong>Uploaded:</strong> {new Date(videoEditorial.createdAt).toLocaleDateString()}
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }
    
//     // No video editorial content available
//     return (
//       <div className="text-gray-500 text-center py-8">
//         <p>No video editorial available yet.</p>
//         <p className="text-sm mt-2">Video explanations will be added soon!</p>
//       </div>
//     );
//   };

//   // Function to render solutions tab
//   const renderSolutionsTab = () => {
//     if (!problem?.referenceSolution || problem.referenceSolution.length === 0) {
//       return (
//         <div className="text-gray-500 text-center py-8">
//           <p>No solutions available yet.</p>
//           <p className="text-sm mt-2">Solutions will be added soon!</p>
//         </div>
//       );
//     }

//     const filteredSolutions = selectedSolutionLanguage === 'all' 
//       ? problem.referenceSolution 
//       : problem.referenceSolution.filter(sol => 
//           sol.language && normalizeLanguage(sol.language) === selectedSolutionLanguage
//         );

//     return (
//       <div className="space-y-6">
//         <div className="flex gap-2 mb-4 flex-wrap">
//           <button 
//             className={`btn btn-sm ${selectedSolutionLanguage === 'all' ? 'btn-primary' : 'btn-ghost'}`}
//             onClick={() => handleSolutionLanguageChange('all')}
//           >
//             All Solutions
//           </button>
//           <button 
//             className={`btn btn-sm ${selectedSolutionLanguage === 'cpp' ? 'btn-primary' : 'btn-ghost'}`}
//             onClick={() => handleSolutionLanguageChange('cpp')}
//           >
//             C++
//           </button>
//           <button 
//             className={`btn btn-sm ${selectedSolutionLanguage === 'java' ? 'btn-primary' : 'btn-ghost'}`}
//             onClick={() => handleSolutionLanguageChange('java')}
//           >
//             Java
//           </button>
//           <button 
//             className={`btn btn-sm ${selectedSolutionLanguage === 'python' ? 'btn-primary' : 'btn-ghost'}`}
//             onClick={() => handleSolutionLanguageChange('python')}
//           >
//             Python
//           </button>
//         </div>

//         {filteredSolutions.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             No solutions available for {selectedSolutionLanguage}.
//           </div>
//         ) : (
//           filteredSolutions.map((solution, index) => (
//             <div key={index} className="border border-slate-700 rounded-lg">
//               <div className="bg-slate-800 px-4 py-2 rounded-t-lg flex justify-between items-center">
//                 <h3 className="font-semibold">{getLanguageDisplayName(solution.language)} Solution</h3>
//                 <span className="text-xs badge badge-success">Official Solution</span>
//               </div>
//               <div className="p-0">
//                 <Editor
//                   height="400px"
//                   language={getLanguageForMonaco(solution.language)}
//                   value={solution.completeCode}
//                   theme="vs-dark"
//                   options={{
//                     readOnly: true,
//                     minimap: { enabled: false },
//                     scrollBeyondLastLine: false,
//                     fontSize: 14,
//                     lineNumbers: 'on',
//                     wordWrap: 'on',
//                     automaticLayout: true,
//                     folding: true,
//                     lineDecorationsWidth: 10,
//                     lineNumbersMinChars: 3,
//                     renderLineHighlight: 'all',
//                     scrollbar: {
//                       vertical: 'auto',
//                       horizontal: 'auto'
//                     }
//                   }}
//                 />
//               </div>
//               <div className="p-4 bg-slate-900 border-t border-slate-700">
//                 <div className="mt-3">
//                   <button 
//                     className="btn btn-sm btn-outline"
//                     onClick={() => handleUseSolution(solution.completeCode, solution.language)}
//                     disabled={isUpdatingCode}
//                   >
//                     {isUpdatingCode ? 'Loading...' : 'Use This Solution'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     );
//   };

//   // Function to render submissions tab
//   const renderSubmissionsTab = () => {
//     if (!userSubmissions || !Array.isArray(userSubmissions) || userSubmissions.length === 0) {
//       return (
//         <div className="text-gray-500 text-center py-8">
//           <p>No submissions yet.</p>
//           <p className="text-sm mt-2">Submit your solution to see it here!</p>
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-4">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="font-semibold">Your Submissions</h3>
//           <span className="text-sm text-gray-500">
//             {userSubmissions.length} submission(s)
//           </span>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="table table-zebra w-full">
//             <thead>
//               <tr>
//                 <th>Time</th>
//                 <th>Language</th>
//                 <th>Status</th>
//                 <th>Runtime</th>
//                 <th>Memory</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {userSubmissions.map((submission, index) => {
//                 const submissionTime = submission?.createdAt ? new Date(submission.createdAt).toLocaleString() : 'N/A';
//                 const submissionLanguage = submission?.language ? getLanguageDisplayName(submission.language) : 'N/A';
//                 const submissionStatus = submission?.status || 'pending';
//                 const runtime = submission?.runtime ? `${submission.runtime} ms` : 'N/A';
//                 const memory = submission?.memory ? `${submission.memory} KB` : 'N/A';
//                 const submissionCode = submission?.code || '';

//                 return (
//                   <tr key={index}>
//                     <td>{submissionTime}</td>
//                     <td>{submissionLanguage}</td>
//                     <td>
//                       <span className={`badge ${
//                         submissionStatus === 'accepted' ? 'badge-success' :
//                         submissionStatus === 'wrong' ? 'badge-error' :
//                         submissionStatus === 'runtime_error' ? 'badge-warning' :
//                         submissionStatus === 'compilation_error' ? 'badge-error' :
//                         'badge-warning'
//                       }`}>
//                         {submissionStatus}
//                       </span>
//                     </td>
//                     <td>{runtime}</td>
//                     <td>{memory}</td>
//                     <td>
//                       <button 
//                         className="btn btn-xs btn-ghost"
//                         onClick={() => handleViewSubmission(submissionCode, submission?.language || 'cpp')}
//                         disabled={isUpdatingCode || !submissionCode}
//                       >
//                         {isUpdatingCode ? 'Loading...' : 'View Code'}
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <span className="loading loading-spinner loading-lg"></span>
//         <span className="ml-4">Loading problem...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="alert alert-error max-w-md">
//           <div>
//             <span>Error loading problem: {error}</span>
//           </div>
//           <button 
//             className="btn btn-sm btn-ghost"
//             onClick={() => window.location.reload()}
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!problem) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="alert alert-warning max-w-md">
//           <div>
//             <span>Problem not found</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex bg-slate-900">
//       {/* Left Panel */}
//       <div className="w-1/2 flex flex-col border-r border-slate-700">
//         {/* Header with Back Button */}
//         <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
//           <div className="flex items-center gap-3">
//             <Link 
//               to="/" 
//               className="btn btn-ghost btn-sm gap-2"
//               title="Back to Home"
//             >
//               <ArrowLeft size={18} />
//               <Home size={18} />
//             </Link>
//             <h1 className="text-lg font-bold truncate max-w-xs">{problem.title}</h1>
//           </div>
//           <div className={`badge badge-outline ${getDifficultyColor(problem.difficulty)}`}>
//             {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
//           </div>
//         </div>

//         {/* Left Tabs */}
//         <div className="tabs tabs-bordered bg-slate-800 px-4">
//           <button 
//             className={`tab ${activeLeftTab === 'description' ? 'tab-active' : ''}`}
//             onClick={() => setActiveLeftTab('description')}
//           >
//             Description
//           </button>
//           <button 
//             className={`tab ${activeLeftTab === 'editorial' ? 'tab-active' : ''}`}
//             onClick={() => setActiveLeftTab('editorial')}
//           >
//             Editorial
//           </button>
//           <button 
//             className={`tab ${activeLeftTab === 'solutions' ? 'tab-active' : ''}`}
//             onClick={() => setActiveLeftTab('solutions')}
//           >
//             Solutions
//           </button>
//           <button 
//             className={`tab ${activeLeftTab === 'chat' ? 'tab-active' : ''}`}
//             onClick={() => setActiveLeftTab('chat')}
//           >
//             AI Assistant
//           </button>
//           <button 
//             className={`tab ${activeLeftTab === 'submissions' ? 'tab-active' : ''}`}
//             onClick={() => setActiveLeftTab('submissions')}
//           >
//             Submissions
//           </button>
//         </div>

//         {/* Left Content */}
//         <div className="flex-1 overflow-y-auto">
//           {problem && (
//             <>
//               {activeLeftTab === 'description' && (
//                 <div className="p-6">
//                   <div className="flex items-center gap-4 mb-6">
//                     <div className="badge badge-primary">{problem.tags}</div>
//                   </div>

//                   <div className="prose max-w-none">
//                     <div className="whitespace-pre-wrap text-sm leading-relaxed">
//                       {problem.description}
//                     </div>
//                   </div>

//                   {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
//                     <div className="mt-8">
//                       <h3 className="text-lg font-semibold mb-4">Examples:</h3>
//                       <div className="space-y-4">
//                         {problem.visibleTestCases.map((example, index) => (
//                           <div key={index} className="bg-slate-800 p-4 rounded-lg">
//                             <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
//                             <div className="space-y-2 text-sm font-mono">
//                               <div><strong>Input:</strong> {example.input}</div>
//                               <div><strong>Output:</strong> {example.output}</div>
//                               {example.explanation && (
//                                 <div><strong>Explanation:</strong> {example.explanation}</div>
//                               )}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeLeftTab === 'editorial' && renderEditorialTab()}

//               {activeLeftTab === 'solutions' && (
//                 <div className="p-6">
//                   <h2 className="text-xl font-bold mb-4">Solutions</h2>
//                   {renderSolutionsTab()}
//                 </div>
//               )}

//               {activeLeftTab === 'chat' && (
//                 <div className="h-full flex flex-col">
//                   <div className="p-6 pb-2">
//                     <h2 className="text-xl font-bold mb-3">AI Coding Assistant</h2>
//                     <div className="bg-slate-800 rounded-lg p-4 mb-3">
//                       <p className="text-sm text-gray-600 mb-2">
//                         Ask me anything about this problem! I can help you understand the concepts, 
//                         debug your code, or explain solutions.
//                       </p>
//                       <div className="text-xs text-gray-500 space-y-1">
//                         <p>💡 <strong>Code blocks are clearly separated from text</strong></p>
//                         <p>📋 <strong>Copy code</strong> with one click</p>
//                         <p>⚡ <strong>Apply code</strong> directly to your editor</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex-1 min-h-0">
//                     <ChatAi 
//                       problem={problem} 
//                       currentCode={code} 
//                       currentLanguage={selectedLanguage}
//                     />
//                   </div>
//                 </div>
//               )}

//               {activeLeftTab === 'submissions' && (
//                 <div className="p-6">
//                   <h2 className="text-xl font-bold mb-4">My Submissions</h2>
//                   {renderSubmissionsTab()}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Right Panel */}
//       <div className="w-1/2 flex flex-col">
//         {/* Right Tabs */}
//         <div className="tabs tabs-bordered bg-slate-800 px-4">
//           <button 
//             className={`tab ${activeRightTab === 'code' ? 'tab-active' : ''}`}
//             onClick={() => setActiveRightTab('code')}
//           >
//             Code
//           </button>
//           <button 
//             className={`tab ${activeRightTab === 'testcase' ? 'tab-active' : ''}`}
//             onClick={() => setActiveRightTab('testcase')}
//           >
//             Testcase
//           </button>
//           <button 
//             className={`tab ${activeRightTab === 'result' ? 'tab-active' : ''}`}
//             onClick={() => setActiveRightTab('result')}
//           >
//             Result
//           </button>
//         </div>

//         {/* Right Content */}
//         <div className="flex-1 flex flex-col">
//           {activeRightTab === 'code' && (
//             <div className="flex-1 flex flex-col">
//               {/* Language Selector */}
//               <div className="flex justify-between items-center p-4 border-b border-slate-700">
//                 <div className="flex gap-2">
//                   {['cpp', 'java', 'python', 'javascript'].map((lang) => (
//                     <button
//                       key={lang}
//                       className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`}
//                       onClick={() => handleLanguageChange(lang)}
//                       disabled={actionLoading || isUpdatingCode}
//                     >
//                       {getLanguageDisplayName(lang)}
//                     </button>
//                   ))}
//                 </div>
//                 <span className="text-xs text-gray-500">
//                   Current: {getLanguageDisplayName(selectedLanguage)}
//                 </span>
//               </div>

//               {/* Monaco Editor */}
//               <div className="flex-1">
//                 <Editor
//                   key={`editor-${selectedLanguage}-${forceLanguageUpdate}`}
//                   height="100%"
//                   language={getLanguageForMonaco(selectedLanguage)}
//                   value={code}
//                   onChange={handleEditorChange}
//                   onMount={handleEditorDidMount}
//                   theme="vs-dark"
//                   options={{
//                     fontSize: 14,
//                     minimap: { enabled: false },
//                     scrollBeyondLastLine: false,
//                     automaticLayout: true,
//                     tabSize: 2,
//                     insertSpaces: true,
//                     wordWrap: 'on',
//                     lineNumbers: 'on',
//                     glyphMargin: false,
//                     folding: true,
//                     lineDecorationsWidth: 10,
//                     lineNumbersMinChars: 3,
//                     renderLineHighlight: 'line',
//                     selectOnLineNumbers: true,
//                     roundedSelection: false,
//                     readOnly: false,
//                     cursorStyle: 'line',
//                     mouseWheelZoom: true,
//                   }}
//                   loading={<div>Loading editor...</div>}
//                 />
//               </div>

//               {/* Action Buttons */}
//               <div className="p-4 border-t border-slate-700 flex justify-between">
//                 <div className="flex gap-2">
//                   <button 
//                     className="btn btn-ghost btn-sm"
//                     onClick={() => setActiveRightTab('testcase')}
//                   >
//                     Console
//                   </button>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     className={`btn btn-outline btn-sm ${actionLoading ? 'loading' : ''}`}
//                     onClick={handleRun}
//                     disabled={actionLoading || !code.trim() || isUpdatingCode}
//                   >
//                     Run
//                   </button>
//                   <button
//                     className={`btn btn-primary btn-sm ${actionLoading ? 'loading' : ''}`}
//                     onClick={handleSubmitCode}
//                     disabled={actionLoading || !code.trim() || isUpdatingCode}
//                   >
//                     Submit
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeRightTab === 'testcase' && (
//             <div className="flex-1 p-4 overflow-y-auto">
//               <h3 className="font-semibold mb-4">Test Results</h3>
//               {runResult ? (
//                 <div className={`alert ${runResult.success ? 'alert-success' : 'alert-error'} mb-4`}>
//                   <div>
//                     {runResult.success ? (
//                       <div>
//                         <h4 className="font-bold">✅ All test cases passed!</h4>
//                         <p className="text-sm mt-2">Runtime: {runResult.runtime + " sec"}</p>
//                         <p className="text-sm">Memory: {runResult.memory + " KB"}</p>
                        
//                         <div className="mt-4 space-y-2">
//                           {runResult.testCases.map((tc, i) => (
//                             <div key={i} className="bg-slate-900 p-3 rounded text-xs">
//                               <div className="font-mono">
//                                 <div><strong>Input:</strong> {tc.stdin}</div>
//                                 <div><strong>Expected:</strong> {tc.expected_output}</div>
//                                 <div><strong>Output:</strong> {tc.stdout}</div>
//                                 <div className={tc.status_id === 3 ? 'text-green-600' : 'text-red-600'}>
//                                   {tc.status_id === 3 ? '✓ Passed' : '✗ Failed'}
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ) : (
//                       <div>
//                         <h4 className="font-bold">❌ Error</h4>
//                         <div className="mt-4 space-y-2">
//                           {runResult.testCases.map((tc, i) => (
//                             <div key={i} className="bg-slate-900 p-3 rounded text-xs">
//                               <div className="font-mono">
//                                 <div><strong>Input:</strong> {tc.stdin}</div>
//                                 <div><strong>Expected:</strong> {tc.expected_output}</div>
//                                 <div><strong>Output:</strong> {tc.stdout}</div>
//                                 <div className={tc.status_id === 3 ? 'text-green-600' : 'text-red-600'}>
//                                   {tc.status_id === 3 ? '✓ Passed' : '✗ Failed'}
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-gray-500">
//                   Click "Run" to test your code with the example test cases.
//                 </div>
//               )}
//             </div>
//           )}

//           {activeRightTab === 'result' && (
//             <div className="flex-1 p-4 overflow-y-auto">
//               <h3 className="font-semibold mb-4">Submission Result</h3>
//               {submitResult ? (
//                 <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
//                   <div>
//                     {submitResult.accepted ? (
//                       <div>
//                         <h4 className="font-bold text-lg">🎉 Accepted</h4>
//                         <div className="mt-4 space-y-2">
//                           <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
//                           <p>Runtime: {submitResult.runtime + " sec"}</p>
//                           <p>Memory: {submitResult.memory + "KB"} </p>
//                         </div>
//                       </div>
//                     ) : (
//                       <div>
//                         <h4 className="font-bold text-lg">❌ {submitResult.error}</h4>
//                         <div className="mt-4 space-y-2">
//                           <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-gray-500">
//                   Click "Submit" to submit your solution for evaluation.
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProblemPage;