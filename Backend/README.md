# Restaurant LMS Backend

A Node.js/Express backend API for a Learning Management System (LMS) designed for restaurant training.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Admin, Instructor, and Student roles
- **Course Management**: Create, update, publish, and delete courses
- **Chapter Management**: Organize courses into chapters
- **Video Management**: Upload and manage video content
- **File Upload**: Support for image and video uploads
- **Security**: Helmet, CORS, rate limiting, input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcryptjs
- **File Upload**: Multer

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure your environment variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/restaurant-lms
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   MAX_FILE_SIZE=100000000
   UPLOAD_PATH=./uploads
   ```

4. Start MongoDB service (if running locally)

5. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Courses
- `GET /api/courses` - Get all courses (with pagination and filtering)
- `GET /api/courses/:id` - Get single course with chapters and videos
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `PATCH /api/courses/:id/publish` - Publish/unpublish course
- `DELETE /api/courses/:id` - Delete course

### Chapters
- `GET /api/courses/:courseId/chapters` - Get chapters for a course
- `GET /api/chapters/:id` - Get single chapter
- `POST /api/courses/:courseId/chapters` - Create new chapter
- `PUT /api/chapters/:id` - Update chapter
- `DELETE /api/chapters/:id` - Delete chapter

### Videos
- `GET /api/chapters/:chapterId/videos` - Get videos for a chapter
- `GET /api/videos/:id` - Get single video
- `POST /api/chapters/:chapterId/videos` - Create new video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

### File Upload
- `POST /api/upload/image` - Upload image file
- `POST /api/upload/video` - Upload video file
- `DELETE /api/upload/:filename` - Delete uploaded file

## Data Models

### User
```javascript
{
  email: String,
  password: String (hashed),
  role: 'admin' | 'instructor' | 'student',
  name: String,
  avatar: String,
  isActive: Boolean
}
```

### Course
```javascript
{
  name: String,
  description: String,
  thumbnail: String,
  status: 'draft' | 'published',
  createdBy: ObjectId (User),
  chapters: [ObjectId (Chapter)],
  totalDuration: String,
  enrolledStudents: [ObjectId (User)]
}
```

### Chapter
```javascript
{
  name: String,
  description: String,
  duration: String,
  courseId: ObjectId (Course),
  videos: [ObjectId (Video)],
  order: Number
}
```

### Video
```javascript
{
  title: String,
  description: String,
  thumbnail: String,
  videoUrl: String,
  duration: String,
  chapterId: ObjectId (Chapter),
  order: Number,
  views: Number,
  isActive: Boolean
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Upload

Currently, files are stored locally in the `uploads` directory. For production, consider using cloud storage services like:

- AWS S3
- Google Cloud Storage
- Cloudinary
- Azure Blob Storage

## Security Features

- Password hashing with bcrypt
- JWT token expiration
- Rate limiting
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- File upload restrictions

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Project Structure

```
Backend/
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   ├── Course.js
│   ├── Chapter.js
│   └── Video.js
├── routes/
│   ├── auth.js
│   ├── courses.js
│   ├── chapters.js
│   ├── videos.js
│   └── upload.js
├── uploads/ (created automatically)
├── .env
├── package.json
├── server.js
└── README.md
```

## Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2
3. Set up MongoDB database
4. Configure cloud storage for file uploads
5. Set secure JWT secrets and database credentials

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.