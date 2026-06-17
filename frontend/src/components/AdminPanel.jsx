import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { ArrowLeft, Code2, Plus, Trash2, Save } from 'lucide-react';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'string', 'linkedList', 'graph', 'dp', 'stack', 'tree', 'queue', 'hashTable', 'binarySearch', 'greedy', 'backtracking']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript', 'Python']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(4, 'All four languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript', 'Python']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(4, 'All four languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' },
        { language: 'Python', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' },
        { language: 'Python', completeCode: '' }
      ],
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }]
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({
    control, name: 'visibleTestCases'
  });

  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({
    control, name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const defaultCodes = {
    'C++': `#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> solution(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}`,
    'Java': `import java.util.*;\nclass Solution {\n    public int[] solution(int[] nums, int target) {\n        // Write your solution here\n        return new int[0];\n    }\n}`,
    'JavaScript': `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar solution = function(nums, target) {\n    // Write your solution here\n    return [];\n};`,
    'Python': `def solution(nums, target):\n    # Write your solution here\n    return []`
  };

  const languageNames = ['C++', 'Java', 'JavaScript', 'Python'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans relative overflow-hidden pb-20">
      <div className="absolute inset-0 z-0 bg-mesh-dark animate-mesh opacity-20 mix-blend-screen pointer-events-none"></div>

      <div className="container mx-auto px-6 pt-12 max-w-5xl relative z-10">
        <button 
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group font-medium"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-4 shadow-glass">
            <Code2 size={16} /> Problem Editor
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Create New Problem</h1>
          <p className="text-slate-400 mt-2">Design and deploy a new algorithmic challenge to the arena.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Basic Information */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-clay">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">1</span>
              Basic Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Title</label>
                <input
                  {...register('title')}
                  className={`w-full bg-slate-950/50 backdrop-blur-md text-white border border-slate-700 shadow-inner rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${errors.title ? 'ring-2 ring-red-500/50' : ''}`}
                  placeholder="e.g. Two Sum"
                />
                {errors.title && <span className="text-red-400 text-sm mt-1">{errors.title.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Description</label>
                <textarea
                  {...register('description')}
                  className={`w-full bg-slate-950/50 backdrop-blur-md text-white border border-slate-700 shadow-inner rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all min-h-[150px] ${errors.description ? 'ring-2 ring-red-500/50' : ''}`}
                  placeholder="Markdown supported description..."
                />
                {errors.description && <span className="text-red-400 text-sm mt-1">{errors.description.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Difficulty</label>
                  <select
                    {...register('difficulty')}
                    className="w-full bg-slate-950/50 backdrop-blur-md text-white border border-slate-700 shadow-inner rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Tag</label>
                  <select
                    {...register('tags')}
                    className="w-full bg-slate-950/50 backdrop-blur-md text-white border border-slate-700 shadow-inner rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="array">Array</option>
                    <option value="string">String</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                    <option value="stack">Stack</option>
                    <option value="tree">Tree</option>
                    <option value="queue">Queue</option>
                    <option value="hashTable">Hash Table</option>
                    <option value="binarySearch">Binary Search</option>
                    <option value="greedy">Greedy</option>
                    <option value="backtracking">Backtracking</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-clay">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">2</span>
              Test Cases
            </h2>
            
            {/* Visible Test Cases */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-300">Visible Test Cases</h3>
                <button
                  type="button"
                  onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-bold border border-cyan-500/20"
                >
                  <Plus size={16} /> Add Case
                </button>
              </div>
              
              <div className="space-y-4">
                {visibleFields.map((field, index) => (
                  <div key={field.id} className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl relative group">
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      disabled={visibleFields.length === 1}
                      className="absolute top-4 right-4 text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <h4 className="text-sm font-bold text-slate-500 mb-4">Case #{index + 1}</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">Input</label>
                          <input {...register(`visibleTestCases.${index}.input`)} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 outline-none" placeholder="e.g. [1,2,3], 5" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">Output</label>
                          <input {...register(`visibleTestCases.${index}.output`)} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 outline-none" placeholder="e.g. [0,1]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Explanation</label>
                        <input {...register(`visibleTestCases.${index}.explanation`)} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 outline-none" placeholder="Brief explanation..." />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Test Cases */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-300">Hidden Test Cases</h3>
                <button
                  type="button"
                  onClick={() => appendHidden({ input: '', output: '' })}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20 transition-colors text-sm font-bold border border-fuchsia-500/20"
                >
                  <Plus size={16} /> Add Hidden Case
                </button>
              </div>
              
              <div className="space-y-4">
                {hiddenFields.map((field, index) => (
                  <div key={field.id} className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl relative group">
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      disabled={hiddenFields.length === 1}
                      className="absolute top-4 right-4 text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <h4 className="text-sm font-bold text-slate-500 mb-4">Secret Case #{index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Input</label>
                        <input {...register(`hiddenTestCases.${index}.input`)} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:ring-2 focus:ring-fuchsia-500/50 outline-none" placeholder="Hidden input" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Expected Output</label>
                        <input {...register(`hiddenTestCases.${index}.output`)} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:ring-2 focus:ring-fuchsia-500/50 outline-none" placeholder="Expected result" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Code Templates */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-clay">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm">3</span>
              Code Templates
            </h2>
            
            <div className="space-y-8">
              {languageNames.map((language, index) => (
                <div key={language} className="border border-slate-800 bg-slate-950/30 rounded-2xl p-6">
                  <h3 className="font-bold text-lg text-orange-400 mb-4">{language}</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">Starter Template</label>
                      <textarea
                        {...register(`startCode.${index}.initialCode`)}
                        className="w-full h-48 font-mono text-sm bg-slate-950 border border-slate-700 rounded-xl p-4 text-emerald-300 focus:outline-none focus:border-orange-500/50 transition-colors"
                        defaultValue={defaultCodes[language]}
                        spellCheck="false"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">Reference Solution</label>
                      <textarea
                        {...register(`referenceSolution.${index}.completeCode`)}
                        className="w-full h-48 font-mono text-sm bg-slate-950 border border-slate-700 rounded-xl p-4 text-cyan-300 focus:outline-none focus:border-orange-500/50 transition-colors"
                        placeholder="Provide the working solution..."
                        spellCheck="false"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate('/admin')}
              className="flex-1 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-black shadow-glass hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
              <Save size={20} /> Deploy Problem to Arena
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;