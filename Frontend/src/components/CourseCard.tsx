import { motion } from 'motion/react';
import { Edit, Trash2, Upload, BookOpen } from 'lucide-react';
import type { Course } from '../App';

interface CourseCardProps {
  course: Course;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onPublish?: () => void;
  onView: () => void;
}

export function CourseCard({ course, index, onEdit, onDelete, onPublish, onView }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Thumbnail */}
      <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center relative group cursor-pointer" onClick={onView}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.name} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="w-16 h-16 text-orange-400" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-neutral-900 flex-1">{course.name}</h3>
          {course.status === 'published' && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm flex-shrink-0 ml-2">
              Published
            </span>
          )}
        </div>
        
        <p className="text-neutral-600 mb-4 line-clamp-2">{course.description}</p>

        <div className="flex items-center gap-2 text-neutral-500 mb-6">
          <BookOpen className="w-4 h-4" />
          <span>
            {course.chapters.length} {course.chapters.length === 1 ? 'Chapter' : 'Chapters'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 text-neutral-700"
          >
            <Edit className="w-4 h-4" />
            Edit
          </motion.button>

          {course.status === 'draft' && onPublish && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPublish}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Publish
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
