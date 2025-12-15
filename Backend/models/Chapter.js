const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chapter name is required'],
    trim: true,
    maxlength: [100, 'Chapter name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Chapter description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  duration: {
    type: String,
    default: '00:00'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate duration from videos before saving
chapterSchema.pre('save', async function(next) {
  if (this.videos && this.videos.length > 0) {
    try {
      const Video = mongoose.model('Video');
      const videos = await Video.find({ _id: { $in: this.videos } });
      let totalSeconds = 0;

      videos.forEach(video => {
        if (video.duration) {
          const [minutes, seconds] = video.duration.split(':').map(Number);
          totalSeconds += minutes * 60 + seconds;
        }
      });

      const minutes = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      this.duration = `${minutes}:${secs.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculating chapter duration:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Chapter', chapterSchema);