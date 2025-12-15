import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { CourseDetailsPage } from "./components/CourseDetailsPage";
import { Navigation } from "./components/Navigation";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { coursesAPI } from "./services/api";

export type Video = {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  chapterId: string;
  duration?: string;
  order?: number;
};

export type Chapter = {
  _id: string;
  name: string;
  description: string;
  duration: string;
  courseId: string;
  videos: Video[];
  order?: number;
};

export type Course = {
  _id: string;
  name: string;
  description: string;
  thumbnail: string;
  status: "draft" | "published";
  chapters: Chapter[];
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  totalDuration?: string;
};

function AppRoutes() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load courses when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCourses();
    }
  }, [isAuthenticated]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.getAll();
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (courseData: Omit<Course, '_id' | 'chapters' | 'status'>) => {
    try {
      const response = await coursesAPI.create(courseData);
      setCourses(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Error creating course:', err);
      throw err;
    }
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    try {
      const response = await coursesAPI.update(updatedCourse._id, {
        name: updatedCourse.name,
        description: updatedCourse.description,
        thumbnail: updatedCourse.thumbnail,
      });
      setCourses(prev => prev.map(c => c._id === updatedCourse._id ? response.data : c));
    } catch (err) {
      console.error('Error updating course:', err);
      throw err;
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await coursesAPI.delete(courseId);
      setCourses(prev => prev.filter(c => c._id !== courseId));
    } catch (err) {
      console.error('Error deleting course:', err);
      throw err;
    }
  };

  const handlePublishCourse = async (courseId: string) => {
    try {
      const response = await coursesAPI.publish(courseId);
      setCourses(prev => prev.map(c => c._id === courseId ? response.data : c));
    } catch (err) {
      console.error('Error publishing course:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/drafts" replace />} />
        <Route
          path="/drafts"
          element={
            <Dashboard
              courses={courses.filter(c => c.status === 'draft')}
              onAddCourse={handleAddCourse}
              onUpdateCourse={handleUpdateCourse}
              onDeleteCourse={handleDeleteCourse}
              onPublishCourse={handlePublishCourse}
              onViewCourse={(courseId) => navigate(`/course/${courseId}`)}
              onRefresh={loadCourses}
              loading={loading}
              error={error}
              title="Draft Courses"
            />
          }
        />
        <Route
          path="/published"
          element={
            <Dashboard
              courses={courses.filter(c => c.status === 'published')}
              onAddCourse={handleAddCourse}
              onUpdateCourse={handleUpdateCourse}
              onDeleteCourse={handleDeleteCourse}
              onPublishCourse={handlePublishCourse}
              onViewCourse={(courseId) => navigate(`/course/${courseId}`)}
              onRefresh={loadCourses}
              loading={loading}
              error={error}
              title="Published Courses"
            />
          }
        />
        <Route
          path="/course/:courseId"
          element={<CourseDetailsPage />}
        />
      </Routes>
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}