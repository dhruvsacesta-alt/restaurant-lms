# Restaurant LMS - Full Stack Application

A complete Learning Management System for restaurant training, built with React (frontend) and Node.js/Express/MongoDB (backend).

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Authentication**: JWT-based login system
- **Course Management**: Create, edit, publish, and delete courses
- **Chapter & Video Organization**: Hierarchical content structure
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live data synchronization

### Backend (Node.js + Express + MongoDB)
- **RESTful API**: Complete CRUD operations for all entities
- **Authentication & Authorization**: JWT tokens with role-based access
- **File Upload**: Support for images and videos
- **Data Validation**: Input sanitization and validation
- **Security**: Helmet, CORS, rate limiting
- **Database**: MongoDB with Mongoose ODM

## 🏗️ Architecture

```
Restaurant LMS/
├── Frontend/          # React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── services/      # API service layer
│   │   └── ...
│   └── package.json
│
└── Backend/           # Node.js API server
    ├── models/        # MongoDB schemas
    ├── routes/        # API endpoints
    ├── middleware/    # Auth middleware
    ├── seed.js        # Database seeder
    └── server.js
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Setup

```bash
# Backend setup
cd Backend
npm install
# Set up MongoDB (see Backend/SETUP.md)
npm run seed  # Populate with sample data

# Frontend setup
cd ../Frontend
npm install
```

### 2. Environment Configuration

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secret-key
PORT=5000
```

#### Frontend
The frontend is configured to connect to `http://localhost:5000/api` by default.

### 3. Start Development Servers

```bash
# Terminal 1: Backend
cd Backend
npm run dev

# Terminal 2: Frontend
cd Frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Login**: Use seeded credentials (see below)

## 👤 Demo Accounts

After running `npm run seed`, you can login with:

- **Admin**: `admin@restaurant.com` / `admin123`
- **Instructor**: `maria@restaurant.com` / `password123`

## 📚 API Documentation

### Authentication
```javascript
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
POST /api/auth/logout
```

### Courses
```javascript
GET /api/courses
GET /api/courses/:id
POST /api/courses
PUT /api/courses/:id
DELETE /api/courses/:id
PATCH /api/courses/:id/publish
```

### Chapters
```javascript
GET /api/courses/:courseId/chapters
GET /api/chapters/:id
POST /api/courses/:courseId/chapters
PUT /api/chapters/:id
DELETE /api/chapters/:id
```

### Videos
```javascript
GET /api/chapters/:chapterId/videos
GET /api/videos/:id
POST /api/chapters/:chapterId/videos
PUT /api/videos/:id
DELETE /api/videos/:id
```

### File Upload
```javascript
POST /api/upload/image
POST /api/upload/video
```

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm run dev      # Start development server
npm run seed     # Seed database with sample data
npm test         # Run tests
```

#### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Project Structure Details

#### Frontend Components
- `LoginPage` - Authentication interface
- `Dashboard` - Course management
- `CourseDetailsPage` - Chapter and video management
- `Navigation` - App navigation with user menu
- Modal components for CRUD operations

#### Backend Architecture
- **Models**: User, Course, Chapter, Video schemas
- **Routes**: Organized by resource with proper middleware
- **Middleware**: Authentication, authorization, validation
- **Services**: File upload handling

## 🚀 Deployment

### Backend Deployment
```bash
# Build and deploy to your preferred platform
npm run build
# Deploy to Heroku, Railway, AWS, etc.
```

### Frontend Deployment
```bash
npm run build
# Deploy to Netlify, Vercel, AWS S3, etc.
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=strong-production-secret
FRONTEND_URL=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the SETUP.md files in each directory
2. Verify your environment configuration
3. Check MongoDB connection
4. Review console logs for error messages

## 🎯 Future Enhancements

- [ ] User enrollment and progress tracking
- [ ] Video streaming with progress saving
- [ ] Quiz/assessment system
- [ ] Email notifications
- [ ] Admin dashboard with analytics
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced file management (AWS S3, Cloudinary)