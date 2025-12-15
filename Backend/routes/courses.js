const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Instructors can only see their own courses, admins can see all
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    const courses = await Course.find(query)
      .populate('createdBy', 'name email')
      .populate('chapters', 'name duration')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course with chapters and videos
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate({
        path: 'chapters',
        populate: {
          path: 'videos',
          model: 'Video'
        }
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user has access to this course
    if (req.user.role !== 'admin' && course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this course'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Instructor/Admin)
router.post('/', protect, [
  body('name').notEmpty().withMessage('Course name is required'),
  body('description').notEmpty().withMessage('Course description is required')
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

    const { name, description, thumbnail } = req.body;

    const course = await Course.create({
      name,
      description,
      thumbnail: thumbnail || '',
      createdBy: req.user._id
    });

    await course.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Owner/Admin)
router.put('/:id', protect, [
  body('name').optional().notEmpty().withMessage('Course name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Course description cannot be empty')
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

    const course = await Course.findById(req.params.id);

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
        message: 'Not authorized to update this course'
      });
    }

    const { name, description, thumbnail } = req.body;

    course.name = name || course.name;
    course.description = description || course.description;
    course.thumbnail = thumbnail !== undefined ? thumbnail : course.thumbnail;

    await course.save();
    await course.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/courses/:id/publish
// @desc    Publish or unpublish course
// @access  Private (Owner/Admin)
router.patch('/:id/publish', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

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
        message: 'Not authorized to publish this course'
      });
    }

    course.status = course.status === 'draft' ? 'published' : 'draft';
    await course.save();

    res.json({
      success: true,
      message: `Course ${course.status} successfully`,
      data: course
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Owner/Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

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
        message: 'Not authorized to delete this course'
      });
    }

    // Delete associated chapters and videos
    await Chapter.deleteMany({ courseId: course._id });

    await course.deleteOne();

    res.json({
      success: true,
      message: 'Course deleted successfully'
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