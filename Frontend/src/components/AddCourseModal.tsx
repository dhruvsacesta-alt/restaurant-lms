import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import type { Course } from '../App';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  editingCourse: Course | null;
}

export function AddCourseModal({ isOpen, onClose, onSave, editingCourse }: AddCourseModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (editingCourse) {
      setName(editingCourse.name);
      setDescription(editingCourse.description);
      setThumbnail(editingCourse.thumbnail);
    } else {
      setName('');
      setDescription('');
      setThumbnail('');
    }
  }, [editingCourse, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const course: Course = {
      _id: editingCourse?._id || Date.now().toString(),
      name,
      description,
      thumbnail,
      status: editingCourse?.status || 'draft',
      chapters: editingCourse?.chapters || [
        {
          _id: `default-${Date.now()}`,
          name: 'Introduction',
          description: 'Default chapter',
          duration: '00:00',
          courseId: editingCourse?._id || Date.now().toString(),
          videos: []
        }
      ]
    };

    onSave(course);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Simulate file upload
    setThumbnail('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80');
  };

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
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-neutral-900">{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
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
                  <label htmlFor="courseName" className="block text-neutral-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    id="courseName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Food Safety & Hygiene"
                  />
                </div>

                <div>
                  <label htmlFor="courseDescription" className="block text-neutral-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="courseDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Describe what students will learn in this course..."
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 mb-2">
                    Course Thumbnail
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-neutral-300 hover:border-orange-400'
                    }`}
                  >
                    {thumbnail ? (
                      <div className="space-y-4">
                        <img src={thumbnail} alt="Thumbnail preview" className="w-full h-48 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setThumbnail('')}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <motion.div
                        animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-center">
                          <div className="bg-neutral-100 p-4 rounded-full">
                            <ImageIcon className="w-8 h-8 text-neutral-400" />
                          </div>
                        </div>
                        <div>
                          <p className="text-neutral-700 mb-1">
                            Drag and drop an image here, or click to browse
                          </p>
                          <p className="text-neutral-500">PNG, JPG up to 5MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setThumbnail('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80')}
                          className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                          Browse Files
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700">
                    Note: A default chapter will be created automatically. You can add more chapters after creating the course.
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
                    <Upload className="w-5 h-5" />
                    {editingCourse ? 'Update Course' : 'Save to Drafts'}
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
