import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { coursesAPI, chaptersAPI, quizPoolsAPI, uploadAPI } from '../services/api';
import type { Course, Chapter } from '../App';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateQuizModal({ isOpen, onClose, onCreated }: CreateQuizModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [displayQuestions, setDisplayQuestions] = useState<number | null>(null);
  const [minPassing, setMinPassing] = useState(50);
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await coursesAPI.getAll();
        setCourses(res.data || []);
      } catch (err) { console.error(err); }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return setChapters([]);
    (async () => {
      setChaptersLoading(true);
      setChapters([]);
      try {
        const res = await chaptersAPI.getByCourseId(selectedCourse);
        setChapters(res.data || []);
      } catch (err) {
        console.error('Failed to load chapters for course', err);
        alert('Failed to load chapters for selected course. Please try again.');
      } finally {
        setChaptersLoading(false);
      }
    })();
  }, [selectedCourse]);

  const addQuestion = () => {
    setQuestions(prev => [...prev, { type: 'single', text: '', options: ['', ''], correctAnswers: [] }]);
  };

  const updateQuestion = (idx: number, patch: any) => {
    setQuestions(prev => prev.map((q,i) => i===idx ? { ...q, ...patch } : q));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!name || !selectedCourse || !totalQuestions || !minPassing || !attemptsAllowed || questions.length===0) {
      alert('Please fill required fields and add at least one question');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name,
        courseId: selectedCourse,
        chapterIds: selectedChapters,
        totalQuestions,
        displayQuestions: displayQuestions || null,
        minPassing,
        attemptsAllowed,
        status: 'draft',
        questions
      };

      await quizPoolsAPI.create(payload);
      onCreated();
    } catch (err) {
      console.error('Failed to create quiz pool', err);
      alert('Failed to create quiz pool');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose} className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm z-40" />

          <motion.div initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:20, opacity:0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass rounded-2xl shadow-soft-lg w-full max-w-3xl max-h-[calc(100vh-4rem)] overflow-auto border border-slate-200/50">
              <div className="sticky top-0 glass backdrop-blur-xl border-b border-slate-200/50 px-6 py-4 rounded-t-2xl">
                <h2 className="text-slate-800 font-semibold gradient-text text-xl">Create Quiz Pool</h2>
              </div>
              <div className="p-6">

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="input w-full" required />
                </div>

                <div>
                  <label className="form-label">Course *</label>
                  <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedChapters([]); }} className="input w-full" required>
                    <option value="">Select course</option>
                    {courses.map(c => (<option key={c._id} value={c._id}>{c.name} ({c.status})</option>))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Chapters (optional)</label>
                  <div className="mt-1">
                    {chaptersLoading ? (
                      <div style={{ color: 'var(--muted-foreground)' }} className="text-sm">Loading chapters...</div>
                    ) : chapters.length === 0 ? (
                      <div style={{ color: 'var(--muted-foreground)' }} className="text-sm">No chapters for selected course.</div>
                    ) : (
                      <select multiple value={selectedChapters} onChange={e => setSelectedChapters(Array.from(e.target.selectedOptions, o => o.value))} className="input w-full">
                        {chapters.map(ch => (<option key={ch._id} value={ch._id}>{ch.name}</option>))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Total Questions *</label>
                    <input type="number" value={totalQuestions} onChange={e => setTotalQuestions(Number(e.target.value))} className="input w-full" min={1} required />
                  </div>
                  <div>
                    <label className="form-label">Display Questions (optional)</label>
                    <input type="number" value={displayQuestions ?? ''} onChange={e => setDisplayQuestions(e.target.value ? Number(e.target.value) : null)} className="input w-full" min={1} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Min Passing (%) *</label>
                    <input type="number" value={minPassing} onChange={e => setMinPassing(Number(e.target.value))} className="input w-full" min={0} max={100} required />
                  </div>
                  <div>
                    <label className="form-label">Attempts Allowed *</label>
                    <input type="number" value={attemptsAllowed} onChange={e => setAttemptsAllowed(Number(e.target.value))} className="input w-full" min={1} required />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="form-label">Questions *</label>
                    <button type="button" onClick={addQuestion} className="text-sm" style={{ color: 'var(--primary)' }}>Add Question</button>
                  </div>

                  <div className="space-y-3 mt-3">
                    {questions.map((q, idx) => (
                      <div key={idx} className="border p-3 rounded">
                        <div className="flex items-center gap-3 mb-2">
                          <select value={q.type} onChange={e => updateQuestion(idx, { type: e.target.value })} className="input px-2 py-1 rounded">
                            <option value="single">Single Choice</option>
                            <option value="multiple">Multiple Choice</option>
                            <option value="truefalse">True / False</option>
                            <option value="image">Image-based</option>
                          </select>
                          <input value={q.text} onChange={e => updateQuestion(idx, { text: e.target.value })} placeholder="Question text" className="input flex-1" />
                        </div>

                        <div className="space-y-2">
                          {(q.type === 'single' || q.type === 'multiple') && (
                            <div>
                              {q.options.map((opt: string, oi: number) => (
                                <div key={oi} className="flex items-center gap-2 mb-2">
                                  <input value={opt} onChange={e => updateQuestion(idx, { options: q.options.map((o:any,i:number)=> i===oi?e.target.value:o) })} className="input flex-1" />
                                  <label className="text-sm">Correct
                                    <input type={q.type==='single' ? 'radio' : 'checkbox'} name={`correct-${idx}`} checked={q.correctAnswers.includes(oi)} onChange={e => {
                                      const checked = e.target.checked;
                                      if (q.type==='single') updateQuestion(idx, { correctAnswers: [oi] });
                                      else {
                                        const set = new Set(q.correctAnswers || []);
                                        if (checked) set.add(oi); else set.delete(oi);
                                        updateQuestion(idx, { correctAnswers: Array.from(set) });
                                      }
                                    }} className="ml-2" />
                                  </label>
                                </div>
                              ))}
                              <button type="button" onClick={() => updateQuestion(idx, { options: [...q.options, ''] })} className="text-sm" style={{ color: 'var(--primary)' }}>Add option</button>
                            </div>
                          )}

                          {q.type === 'truefalse' && (
                            <div className="flex gap-3">
                              <label className="flex items-center gap-2"><input type="radio" name={`tf-${idx}`} checked={q.correctAnswers.includes(0)} onChange={() => updateQuestion(idx, { correctAnswers: [0] })} /> True</label>
                              <label className="flex items-center gap-2"><input type="radio" name={`tf-${idx}`} checked={q.correctAnswers.includes(1)} onChange={() => updateQuestion(idx, { correctAnswers: [1] })} /> False</label>
                            </div>
                          )}

                          {q.type === 'image' && (
                            <div>
                              <label className="block text-sm">Upload image</label>
                              <input type="file" accept="image/*" onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  try {
                                    const res = await uploadAPI.uploadImage(f);
                                    updateQuestion(idx, { imageUrl: res.data.url });
                                  } catch (err) { console.error(err); alert('Image upload failed'); }
                                }
                              }} />
                              <div className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>Options for image-based questions will be displayed on the user side.</div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button type="button" onClick={() => setQuestions(questions.filter((_,i)=>i!==idx))} className="text-red-600">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end pt-4">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-slate-50/50 backdrop-blur-sm text-slate-700 rounded-xl hover:bg-slate-100/50 transition-all duration-300 shadow-soft"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-soft hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      'Create'
                    )}
                  </motion.button>
                </div>
              </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
