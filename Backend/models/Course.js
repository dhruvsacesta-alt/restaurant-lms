const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  totalDuration: {
    type: String,
    default: '00:00'
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Calculate total duration before saving
courseSchema.pre('save', async function(next) {
  if (this.chapters && this.chapters.length > 0) {
    try {
      const Chapter = mongoose.model('Chapter');
      const chapters = await Chapter.find({ _id: { $in: this.chapters } });
      let totalSeconds = 0;

      chapters.forEach(chapter => {
        if (chapter.duration) {
          const [minutes, seconds] = chapter.duration.split(':').map(Number);
          totalSeconds += minutes * 60 + seconds;
        }
      });

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      this.totalDuration = hours > 0
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        : `${minutes}:${secs.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculating total duration:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);