import { AnimatePresence, motion } from 'motion/react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
  poster?: string;
}

export function VideoPlayerModal({ isOpen, onClose, videoUrl, title, poster }: VideoPlayerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-60 z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-black rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl">
              <div className="px-4 py-3 border-b border-neutral-800 text-white flex items-center justify-between">
                <div className="font-semibold">{title || 'Video'}</div>
                <button onClick={onClose} className="text-white opacity-80 hover:opacity-100">Close</button>
              </div>

              <div className="p-4 flex justify-center">
                <div className="w-full">
                  <video
                    src={videoUrl}
                    poster={poster}
                    controls
                    autoPlay
                    className="w-full h-[45vh] max-h-[60vh] object-contain bg-black rounded"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
