const express = require('express');
const { body, validationResult } = require('express-validator');
const Video = require('../models/Video');
const Chapter = require('../models/Chapter');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chapters/:chapterId/videos
// @desc    Get all videos for a chapter
// @access  Private
router.get('/chapters/:chapterId', protect, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId).populate('courseId', 'createdBy');

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && chapter.courseId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chapter'
      });
    }

    const videos = await Video.find({ chapterId: req.params.chapterId, isActive: true })
      .sort({ order: 1 });

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/videos/:id
// @desc    Get single video
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate({
        path: 'chapterId',
        populate: {
          path: 'courseId',
          select: 'name createdBy'
        }
      });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && video.chapterId.courseId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video'
      });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/chapters/:chapterId/videos
// @desc    Create new video
// @access  Private
router.post('/chapters/:chapterId', protect, [
  body('title').notEmpty().withMessage('Video title is required'),
  body('description').notEmpty().withMessage('Video description is required'),
  body('videoUrl').notEmpty().withMessage('Video URL is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const chapter = await Chapter.findById(req.params.chapterId).populate('courseId', 'createdBy');

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && chapter.courseId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add videos to this chapter'
      });
    }

    const { title, description, thumbnail, videoUrl, duration } = req.body;

    // Get the highest order number for this chapter
    const lastVideo = await Video.findOne({ chapterId: req.params.chapterId })
      .sort({ order: -1 });
    const order = lastVideo ? lastVideo.order + 1 : 1;

    const video = await Video.create({
      title,
      description,
      thumbnail: thumbnail || '',
      videoUrl,
      duration: duration || '00:00',
      chapterId: req.params.chapterId,
      order
    });

    // Add video to chapter
    chapter.videos.push(video._id);
    await chapter.save();

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/videos/:id
// @desc    Update video
// @access  Private
router.put('/:id', protect, [
  body('title').optional().notEmpty().withMessage('Video title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Video description cannot be empty'),
  body('videoUrl').optional().notEmpty().withMessage('Video URL cannot be empty')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const video = await Video.findById(req.params.id)
      .populate({
        path: 'chapterId',
        populate: {
          path: 'courseId',
          select: 'createdBy'
        }
      });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && video.chapterId.courseId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this video'
      });
    }

    const { title, description, thumbnail, videoUrl, duration } = req.body;

    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnail !== undefined ? thumbnail : video.thumbnail;
    video.videoUrl = videoUrl || video.videoUrl;
    video.duration = duration || video.duration;

    await video.save();

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/videos/:id
// @desc    Delete video
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate({
        path: 'chapterId',
        populate: {
          path: 'courseId',
          select: 'createdBy'
        }
      });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && video.chapterId.courseId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video'
      });
    }

    // Remove video from chapter
    await Chapter.findByIdAndUpdate(video.chapterId._id, {
      $pull: { videos: video._id }
    });

    await video.deleteOne();

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;