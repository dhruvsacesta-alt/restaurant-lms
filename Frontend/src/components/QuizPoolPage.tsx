import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileQuestion, Plus, BookOpen } from 'lucide-react';
import { quizPoolsAPI } from '../services/api';
import { CreateQuizModal } from './CreateQuizModal';

export function QuizPoolPage() {
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadPools = async () => {
    try {
      setLoading(true);
      const res = await quizPoolsAPI.list();
      setPools(res.data || []);
    } catch (err) {
      console.error('Failed to load quiz pools', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPools(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-soft">
            <FileQuestion className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 gradient-text">Quiz Pools</h1>
            <p className="text-slate-600 mt-1">Manage your quiz collections</p>
          </div>
        </div>
        <motion.button
          onClick={() => setIsCreateOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-soft hover:shadow-soft-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Quiz Pool
        </motion.button>
      </motion.div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-16"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {pools.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 animate-float">
                <FileQuestion className="w-12 h-12 text-indigo-500 mx-auto mt-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Quiz Pools Yet</h3>
              <p className="text-slate-600 mb-6">Create your first quiz pool to get started</p>
              <motion.button
                onClick={() => setIsCreateOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-soft"
              >
                Create Your First Quiz Pool
              </motion.button>
            </motion.div>
          ) : (
            pools.map((pool, index) => (
              <motion.div
                key={pool._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="glass rounded-2xl p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-slate-200/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-xl">
                      <FileQuestion className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">{pool.name}</h3>
                      <div className="flex items-center gap-2 text-slate-600 mt-1">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">Course: {pool.courseId?.name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{pool.questions?.length || 0}</div>
                    <div className="text-sm text-slate-500">Questions</div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      <CreateQuizModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreated={() => { setIsCreateOpen(false); loadPools(); }} />
    </div>
  );
}
