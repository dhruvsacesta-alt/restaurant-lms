import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Video as VideoIcon, Image as ImageIcon } from 'lucide-react';
import type { Video, Chapter } from '../App';

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (video: Video) => void;
  courseId: string;
  chapterId: string | null;
  chapters: Chapter[];
}

export function UploadVideoModal({ isOpen, onClose, onSave, courseId, chapterId, chapters }: UploadVideoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState(chapterId || '');
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (chapterId) {
      setSelectedChapterId(chapterId);
    }
  }, [chapterId, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setThumbnail('');
      setVideoUrl('');
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [isOpen]);

  const simulateUpload = (callback: () => void) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          callback();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const video: Video = {
      _id: `video-${Date.now()}`,
      title,
      description,
      thumbnail,
      videoUrl: videoUrl || 'https://example.com/video.mp4',
      chapterId: selectedChapterId
    };

    onSave(video);
  };

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumb(false);
    setThumbnail('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80');
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    simulateUpload(() => {
      setVideoUrl('https://example.com/uploaded-video.mp4');
    });
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
                <h2 className="text-neutral-900">Upload Video</h2>
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
                  <label htmlFor="videoTitle" className="block text-neutral-700 mb-2">
                    Video Title *
                  </label>
                  <input
                    id="videoTitle"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Proper Handwashing Technique"
                  />
                </div>

                <div>
                  <label htmlFor="videoDescription" className="block text-neutral-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="videoDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Describe what students will learn in this video..."
                  />
                </div>

                <div>
                  <label htmlFor="chapterSelect" className="block text-neutral-700 mb-2">
                    Chapter *
                  </label>
                  <select
                    id="chapterSelect"
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a chapter</option>
                    {chapters.map((chapter, index) => (
                      <option key={chapter._id} value={chapter._id}>
                        Chapter {index + 1}: {chapter.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 mb-2">
                    Video Thumbnail
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingThumb(true); }}
                    onDragLeave={() => setIsDraggingThumb(false)}
                    onDrop={handleThumbnailDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDraggingThumb
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-neutral-300 hover:border-orange-400'
                    }`}
                  >
                    {thumbnail ? (
                      <div className="space-y-3">
                        <img src={thumbnail} alt="Thumbnail preview" className="w-full h-32 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => setThumbnail('')}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <ImageIcon className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-600">Drag & drop thumbnail or click to browse</p>
                        <button
                          type="button"
                          onClick={() => setThumbnail('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80')}
                          className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                          Browse
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 mb-2">
                    Video File *
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                    onDragLeave={() => setIsDraggingVideo(false)}
                    onDrop={handleVideoDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDraggingVideo
                        ? 'border-orange-500 bg-orange-50'
                        : videoUrl
                        ? 'border-green-300 bg-green-50'
                        : 'border-neutral-300 hover:border-orange-400'
                    }`}
                  >
                    {isUploading ? (
                      <div className="space-y-3">
                        <VideoIcon className="w-8 h-8 text-orange-500 mx-auto animate-pulse" />
                        <p className="text-neutral-700">Uploading video...</p>
                        <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="bg-orange-500 h-full"
                          />
                        </div>
                        <p className="text-neutral-600">{uploadProgress}%</p>
                      </div>
                    ) : videoUrl ? (
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <div className="bg-green-100 p-3 rounded-full">
                            <VideoIcon className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                        <p className="text-green-700">Video uploaded successfully!</p>
                        <button
                          type="button"
                          onClick={() => setVideoUrl('')}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Upload Different Video
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <VideoIcon className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-600">Drag & drop video file or click to browse</p>
                        <p className="text-neutral-500">MP4, MOV, AVI up to 500MB</p>
                        <button
                          type="button"
                          onClick={() => simulateUpload(() => setVideoUrl('https://example.com/video.mp4'))}
                          className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                          Browse Files
                        </button>
                      </div>
                    )}
                  </div>
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
                    disabled={!videoUrl}
                    className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-5 h-5" />
                    Save Video
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
