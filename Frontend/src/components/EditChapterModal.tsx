import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import type { Chapter } from '../App';

interface EditChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chapter: Chapter) => void;
  chapter: Chapter | null;
}

export function EditChapterModal({ isOpen, onClose, onSave, chapter }: EditChapterModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (chapter) {
      setName(chapter.name);
      setDescription(chapter.description);
      setDuration(chapter.duration);
    } else {
      setName('');
      setDescription('');
      setDuration('');
    }
  }, [chapter, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!chapter) return;

    const updatedChapter: Chapter = {
      ...chapter,
      name,
      description,
      duration: duration || '00:00'
    };

    onSave(updatedChapter);
  };

  const formatDuration = (value: string) => {
    // Remove non-numeric characters
    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;

    // Format as MM:SS
    const minutes = numbers.slice(0, -2);
    const seconds = numbers.slice(-2);
    return `${minutes}:${seconds}`;
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDuration(e.target.value);
    setDuration(formatted);
  };

  if (!chapter) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl">
              {/* Header */}
              <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-neutral-900">Edit Chapter</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label htmlFor="chapterName" className="block text-neutral-700 mb-2">
                    Chapter Name *
                  </label>
                  <input
                    id="chapterName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Introduction to Food Safety"
                  />
                </div>

                <div>
                  <label htmlFor="chapterDescription" className="block text-neutral-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="chapterDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Describe what will be covered in this chapter..."
                  />
                </div>

                <div>
                  <label htmlFor="chapterDuration" className="block text-neutral-700 mb-2">
                    Duration (MM:SS)
                  </label>
                  <input
                    id="chapterDuration"
                    type="text"
                    value={duration}
                    onChange={handleDurationChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="15:30"
                    maxLength={5}
                  />
                  <p className="text-neutral-500 mt-1">
                    Enter duration in minutes and seconds (e.g., 15:30)
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Update Chapter
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
