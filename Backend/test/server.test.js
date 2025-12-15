const mongoose = require('mongoose');

// Simple test to check if the server can start
describe('Server Startup', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-lms-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('should connect to MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });
});