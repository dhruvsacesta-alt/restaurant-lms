const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Chapter = require('./models/Chapter');
const Video = require('./models/Video');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-lms');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Chapter.deleteMany({});
    await Video.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@restaurant.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Created admin user');

    // Create instructor user
    const instructorUser = await User.create({
      name: 'Chef Maria',
      email: 'maria@restaurant.com',
      password: 'password123',
      role: 'instructor'
    });
    console.log('Created instructor user');

    // Create courses
    const foodSafetyCourse = await Course.create({
      name: 'Food Safety & Hygiene',
      description: 'Essential food safety practices for restaurant staff including proper handling, storage, and preparation techniques.',
      thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      status: 'published',
      createdBy: adminUser._id
    });

    const customerServiceCourse = await Course.create({
      name: 'Customer Service Excellence',
      description: 'Learn how to provide exceptional customer service and create memorable dining experiences.',
      thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      status: 'published',
      createdBy: instructorUser._id
    });

    const kitchenOperationsCourse = await Course.create({
      name: 'Kitchen Operations',
      description: 'Master the fundamentals of kitchen operations, equipment handling, and team coordination.',
      thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      status: 'draft',
      createdBy: instructorUser._id
    });

    console.log('Created courses');

    // Create chapters for Food Safety course
    const introChapter = await Chapter.create({
      name: 'Introduction to Food Safety',
      description: 'Basic principles of food safety and why it matters',
      duration: '15:30',
      courseId: foodSafetyCourse._id,
      order: 1
    });

    const handlingChapter = await Chapter.create({
      name: 'Food Handling & Storage',
      description: 'Proper techniques for handling and storing different types of food',
      duration: '22:45',
      courseId: foodSafetyCourse._id,
      order: 2
    });

    const hygieneChapter = await Chapter.create({
      name: 'Personal Hygiene',
      description: 'Maintaining personal hygiene standards in a professional kitchen',
      duration: '18:20',
      courseId: foodSafetyCourse._id,
      order: 3
    });

    console.log('Created chapters');

    // Create videos for Introduction chapter
    await Video.create({
      title: 'Welcome to Food Safety Training',
      description: 'An overview of what you\'ll learn in this course',
      thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      duration: '05:30',
      chapterId: introChapter._id,
      order: 1
    });

    await Video.create({
      title: 'The Importance of Food Safety',
      description: 'Understanding why food safety is critical for restaurants',
      thumbnail: 'https://images.unsplash.com/photo-1551782450-17144efb5723?w=800&q=80',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      duration: '10:00',
      chapterId: introChapter._id,
      order: 2
    });

    // Create videos for Handling chapter
    await Video.create({
      title: 'Temperature Control',
      description: 'How to maintain proper temperatures for food safety',
      thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      duration: '12:15',
      chapterId: handlingChapter._id,
      order: 1
    });

    await Video.create({
      title: 'Cross-Contamination Prevention',
      description: 'Techniques to prevent cross-contamination in the kitchen',
      thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_10mb.mp4',
      duration: '10:30',
      chapterId: handlingChapter._id,
      order: 2
    });

    console.log('Created videos');

    // Update courses with chapters
    await Course.findByIdAndUpdate(foodSafetyCourse._id, {
      chapters: [introChapter._id, handlingChapter._id, hygieneChapter._id]
    });

    console.log('Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@restaurant.com / admin123');
    console.log('Instructor: maria@restaurant.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedDatabase();