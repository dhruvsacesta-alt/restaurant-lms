const express = require('express');
const { body, validationResult } = require('express-validator');
const Chapter = require('../models/Chapter');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses/:courseId/chapters
// @desc    Get all chapters for a course
// @access  Private
router.get('/courses/:courseId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this course'
      });
    }

    const chapters = await Chapter.find({ courseId: req.params.courseId })
      .populate('videos')
      .sort({ order: 1 });

    res.json({
      success: true,
      data: chapters
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/chapters/:id
// @desc    Get single chapter
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
      .populate('videos')
      .populate('courseId', 'name createdBy');

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

    res.json({
      success: true,
      data: chapter
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/courses/:courseId/chapters
// @desc    Create new chapter
// @access  Private
router.post('/courses/:courseId', protect, [
  body('name').notEmpty().withMessage('Chapter name is required'),
  body('description').notEmpty().withMessage('Chapter description is required')
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

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add chapters to this course'
      });
    }

    const { name, description } = req.body;

    // Get the highest order number for this course
    const lastChapter = await Chapter.findOne({ courseId: req.params.courseId })
      .sort({ order: -1 });
    const order = lastChapter ? lastChapter.order + 1 : 1;

    const chapter = await Chapter.create({
      name,
      description,
      courseId: req.params.courseId,
      order
    });

    // Add chapter to course
    course.chapters.push(chapter._id);
    await course.save();

    await chapter.populate('videos');

    res.status(201).json({
      success: true,
      message: 'Chapter created successfully',
      data: chapter
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/chapters/:id
// @desc    Update chapter
// @access  Private
router.put('/:id', protect, [
  body('name').optional().notEmpty().withMessage('Chapter name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Chapter description cannot be empty')
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

    const chapter = await Chapter.findById(req.params.id).populate('courseId', 'createdBy');

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
        message: 'Not authorized to update this chapter'
      });
    }

    const { name, description } = req.body;

    chapter.name = name || chapter.name;
    chapter.description = description || chapter.description;

    await chapter.save();
    await chapter.populate('videos');

    res.json({
      success: true,
      message: 'Chapter updated successfully',
      data: chapter
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/chapters/:id
// @desc    Delete chapter
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate('courseId', 'createdBy');

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
        message: 'Not authorized to delete this chapter'
      });
    }

    // Remove chapter from course
    await Course.findByIdAndUpdate(chapter.courseId._id, {
      $pull: { chapters: chapter._id }
    });

    // Delete associated videos
    await require('../models/Video').deleteMany({ chapterId: chapter._id });

    await chapter.deleteOne();

    res.json({
      success: true,
      message: 'Chapter deleted successfully'
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