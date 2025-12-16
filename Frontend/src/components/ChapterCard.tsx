import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit, Trash2, Plus, Video, ChevronDown, ChevronUp, Clock, PlayCircle } from 'lucide-react';
import type { Chapter } from '../App';
import { VideoPlayerModal } from './VideoPlayerModal';



interface ChapterCardProps {
  chapter: Chapter;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onAddVideo: () => void;
  onDeleteVideo: (videoId: string) => void;
}

export function ChapterCard({ chapter, index, onEdit, onDelete, onAddVideo, onDeleteVideo }: ChapterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openVideo, setOpenVideo] = useState<OpenVideo | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Chapter Header */}
      <div className="bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg">
                Chapter {index + 1}
              </span>
              <h3 className="text-neutral-900">{chapter.name}</h3>
            </div>
            <p className="text-neutral-600 mb-3">{chapter.description}</p>
            <div className="flex items-center gap-4 text-neutral-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{chapter.duration}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                <span>{chapter.videos.length} Videos</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              title="Edit Chapter"
            >
              <Edit className="w-4 h-4 text-neutral-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete Chapter"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </motion.button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-neutral-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-600" />
              )}
            </button>
          </div>
        </div>

        {/* Add Video Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddVideo}
          className="w-full mt-4 px-4 py-2 border-2 border-dashed border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Upload Video
        </motion.button>
      </div>

      {/* Videos List */}
      <AnimatePresence>
        {isExpanded && chapter.videos.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-neutral-50 border-t border-neutral-200"
          >
            <div className="p-6 space-y-3">
              {chapter.videos.map((video, videoIndex) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: videoIndex * 0.05 }}
                  className="bg-white border border-neutral-200 rounded-lg p-4 flex items-start gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Video Thumbnail */}
                  <div className="w-24 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden"
                       onClick={() => setOpenVideo({ url: video.videoUrl, title: video.title, poster: video.thumbnail })}
                  >
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover rounded" />
                    ) : (
                      <PlayCircle className="w-8 h-8 text-orange-400" />
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-neutral-900 mb-1 truncate">{video.title}</h4>
                    <p className="text-neutral-600 line-clamp-2">{video.description}</p>
                  </div>

                  {/* Delete Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDeleteVideo(video._id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <VideoPlayerModal
        isOpen={!!openVideo}
        onClose={() => setOpenVideo(null)}
        videoUrl={openVideo?.url || ''}
        title={openVideo?.title}
        poster={openVideo?.poster}
      />
    </motion.div>
  );
}

interface OpenVideo { url: string; title?: string; poster?: string };
