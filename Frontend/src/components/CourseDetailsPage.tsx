import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { ChapterCard } from './ChapterCard';
import { AddChapterModal } from './AddChapterModal';
import { UploadVideoModal } from './UploadVideoModal';
import { ConfirmModal } from './ConfirmModal';
import { Toast } from './Toast';
import { chaptersAPI, videosAPI, coursesAPI } from '../services/api';
import type { Course, Chapter } from '../App';

export function CourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [isUploadVideoOpen, setIsUploadVideoOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourseAndChapters();
    }
  }, [courseId]);

  const loadCourseAndChapters = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      console.log('Loading course with ID:', courseId);
      const [courseResponse, chaptersResponse] = await Promise.all([
        coursesAPI.getById(courseId),
        chaptersAPI.getByCourseId(courseId)
      ]);
      console.log('Course response:', courseResponse);
      console.log('Chapters response:', chaptersResponse);
      setCourse(courseResponse.data);
      setChapters(chaptersResponse.data);
    } catch (error) {
      console.error('Error loading course and chapters:', error);
      setToast({ message: 'Failed to load course details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChapter = async (chapter: Chapter) => {
    if (!courseId) return;

    try {
      const chapterData = {
        name: chapter.name,
        description: chapter.description,
        duration: chapter.duration
      };

      if (editingChapter) {
        await chaptersAPI.update(editingChapter._id, chapterData);
        setToast({ message: 'Chapter updated successfully!', type: 'success' });
      } else {
        await chaptersAPI.create(courseId, chapterData);
        setToast({ message: 'Chapter added successfully!', type: 'success' });
      }
      await loadCourseAndChapters(); // Refresh both course and chapters
      setIsAddChapterOpen(false);
      setEditingChapter(null);
    } catch (error) {
      console.error('Error saving chapter:', error);
      setToast({ message: 'Failed to save chapter', type: 'error' });
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await chaptersAPI.delete(chapterId);
      setToast({ message: 'Chapter deleted successfully!', type: 'success' });
      await loadCourseAndChapters(); // Refresh both course and chapters
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      setToast({ message: 'Failed to delete chapter', type: 'error' });
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setIsAddChapterOpen(true);
  };

  const handleAddVideo = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setIsUploadVideoOpen(true);
  };

  const handleDeleteVideo = async (_chapterId: string, videoId: string) => {
    try {
      await videosAPI.delete(videoId);
      setToast({ message: 'Video deleted successfully!', type: 'success' });
      await loadCourseAndChapters(); // Refresh both course and chapters to get updated videos
    } catch (error) {
      console.error('Error deleting video:', error);
      setToast({ message: 'Failed to delete video', type: 'error' });
    }
  };

  const handleSaveVideo = async (videoData: {
    title: string;
    description: string;
    videoUrl: string;
    thumbnail?: string;
    duration?: string;
  }) => {
    try {
      if (!selectedChapterId) return;

      await videosAPI.create(selectedChapterId as string, videoData);
      setToast({ message: 'Video uploaded successfully!', type: 'success' });
      await loadCourseAndChapters(); // Refresh both course and chapters to get updated videos
      setIsUploadVideoOpen(false);
      setSelectedChapterId(null);
    } catch (error) {
      console.error('Error uploading video:', error);
      setToast({ message: 'Failed to upload video', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-500">Course not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </motion.button>

      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md border border-neutral-200 p-8 mb-8"
      >
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <BookOpen className="w-16 h-16 text-orange-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-neutral-900">{course.name}</h1>
              {course.status === 'published' && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg">
                  Published
                </span>
              )}
            </div>
            <p className="text-neutral-600 mb-4">{course.description}</p>
            <div className="flex items-center gap-4 text-neutral-500">
              <span>{chapters.length} Chapters</span>
              <span>•</span>
              <span>
                {chapters.reduce((acc, chapter) => acc + chapter.videos.length, 0)} Videos
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chapters Section */}
      <div className="bg-white rounded-lg shadow-md border border-neutral-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-neutral-900">Course Chapters</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingChapter(null);
              setIsAddChapterOpen(true);
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Chapter
          </motion.button>
        </div>

        {chapters.length > 0 ? (
          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <ChapterCard
                key={chapter._id}
                chapter={chapter}
                index={index}
                onEdit={() => handleEditChapter(chapter)}
                onDelete={() => setConfirmDelete(chapter._id)}
                onAddVideo={() => handleAddVideo(chapter._id)}
                onDeleteVideo={(videoId) => handleDeleteVideo(chapter._id, videoId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
            <BookOpen className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 mb-4">No chapters yet. Add your first chapter to get started.</p>
            <button
              onClick={() => {
                setEditingChapter(null);
                setIsAddChapterOpen(true);
              }}
              className="text-orange-600 hover:text-orange-700"
            >
              Add Chapter
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddChapterModal
        isOpen={isAddChapterOpen}
        onClose={() => {
          setIsAddChapterOpen(false);
          setEditingChapter(null);
        }}
        onSave={handleSaveChapter}
        courseId={courseId || ''}
        editingChapter={editingChapter}
      />

      <UploadVideoModal
        isOpen={isUploadVideoOpen}
        onClose={() => {
          setIsUploadVideoOpen(false);
          setSelectedChapterId(null);
        }}
        onSave={handleSaveVideo}
        courseId={courseId || ''}
        chapterId={selectedChapterId}
        chapters={chapters}
      />

      <ConfirmModal
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDeleteChapter(confirmDelete)}
        title="Delete Chapter"
        message="Are you sure you want to delete this chapter? All videos in this chapter will also be deleted. This action cannot be undone."
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
