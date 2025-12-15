import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { CourseCard } from './CourseCard';
import { AddCourseModal } from './AddCourseModal';
import { ConfirmModal } from './ConfirmModal';
import { Toast } from './Toast';
import type { Course } from '../App';

interface DashboardProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onPublishCourse: (courseId: string) => void;
  onViewCourse: (courseId: string) => void;
  onRefresh: () => Promise<void>;
  loading: boolean;
  error: string | null;
  title: string;
}

export function Dashboard({
  courses,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onPublishCourse,
  onViewCourse,
  onRefresh,
  loading,
  error,
  title
}: DashboardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [confirmPublish, setConfirmPublish] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSaveCourse = (course: Course) => {
    if (editingCourse) {
      onUpdateCourse(course);
      setToast({ message: 'Course updated successfully!', type: 'success' });
    } else {
      onAddCourse(course);
      setToast({ message: 'Course created successfully!', type: 'success' });
    }
    setIsAddModalOpen(false);
    setEditingCourse(null);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsAddModalOpen(true);
  };

  const handlePublish = (courseId: string) => {
    onPublishCourse(courseId);
    setConfirmPublish(null);
    setToast({ message: 'Course published successfully!', type: 'success' });
  };

  const handleDelete = (courseId: string) => {
    onDeleteCourse(courseId);
    setConfirmDelete(null);
    setToast({ message: 'Course deleted successfully!', type: 'success' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-neutral-900 mb-2">{title}</h1>
            <p className="text-neutral-600">Create and manage your restaurant training courses</p>
          </div>
          <motion.button
            onClick={() => {
              setEditingCourse(null);
              setIsAddModalOpen(true);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 justify-center shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Course
          </motion.button>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <CourseCard
                key={course._id}
                course={course}
                index={index}
                onEdit={() => handleEditCourse(course)}
                onDelete={() => setConfirmDelete(course._id)}
                onPublish={() => setConfirmPublish(course._id)}
                onView={() => onViewCourse(course._id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-neutral-500">No courses yet. Create your first course!</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCourse(null);
        }}
        onSave={handleSaveCourse}
        editingCourse={editingCourse}
      />

      <ConfirmModal
        isOpen={confirmPublish !== null}
        onClose={() => setConfirmPublish(null)}
        onConfirm={() => confirmPublish && handlePublish(confirmPublish)}
        title="Publish Course"
        message="Are you sure you want to publish this course? It will be moved to the Published section and made available to students."
        confirmText="Publish"
        confirmColor="green"
      />

      <ConfirmModal
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
