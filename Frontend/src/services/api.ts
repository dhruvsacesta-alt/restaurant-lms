const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests with error handling
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();
  console.log('Making API request to:', endpoint, 'with token:', token ? 'present' : 'missing');

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log('API response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      console.error('API error:', error);
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role?: string) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  getCurrentUser: () => apiRequest('/auth/me'),

  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};

// Courses API
export const coursesAPI = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return apiRequest(`/courses?${query.toString()}`);
  },

  getById: (id: string) => apiRequest(`/courses/${id}`),

  create: (course: { name: string; description: string; thumbnail?: string }) =>
    apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    }),

  update: (id: string, course: Partial<{ name: string; description: string; thumbnail: string }>) =>
    apiRequest(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(course),
    }),

  publish: (id: string) =>
    apiRequest(`/courses/${id}/publish`, {
      method: 'PATCH',
    }),

  delete: (id: string) =>
    apiRequest(`/courses/${id}`, {
      method: 'DELETE',
    }),
};

// Chapters API
export const chaptersAPI = {
  getByCourseId: (courseId: string) => apiRequest(`/chapters/courses/${courseId}`),

  getById: (id: string) => apiRequest(`/chapters/${id}`),

  create: (courseId: string, chapter: { name: string; description: string }) =>
    apiRequest(`/chapters/courses/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(chapter),
    }),

  update: (id: string, chapter: Partial<{ name: string; description: string }>) =>
    apiRequest(`/chapters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(chapter),
    }),

  delete: (id: string) =>
    apiRequest(`/chapters/${id}`, {
      method: 'DELETE',
    }),
};

// Videos API
export const videosAPI = {
  getByChapterId: (chapterId: string) => apiRequest(`/videos/chapters/${chapterId}`),

  getById: (id: string) => apiRequest(`/videos/${id}`),

  create: (chapterId: string, video: {
    title: string;
    description: string;
    videoUrl: string;
    thumbnail?: string;
    duration?: string;
  }) =>
    apiRequest(`/videos/chapters/${chapterId}`, {
      method: 'POST',
      body: JSON.stringify(video),
    }),

  update: (id: string, video: Partial<{
    title: string;
    description: string;
    videoUrl: string;
    thumbnail: string;
    duration: string;
  }>) =>
    apiRequest(`/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(video),
    }),

  delete: (id: string) =>
    apiRequest(`/videos/${id}`, {
      method: 'DELETE',
    }),
};

// File Upload API
export const uploadImage = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('image', file);

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Image upload failed');
  }

  return response.json();
};

export const uploadVideo = async (file: File, onProgress?: (progress: number) => void): Promise<any> => {
  const formData = new FormData();
  formData.append('video', file);

  const token = getAuthToken();

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress event
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(Math.round(percentComplete));
        }
      });
    }

    // Load event (success)
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Error event
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    // Abort event
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // Set up the request
    xhr.open('POST', `${API_BASE_URL}/upload/video`, true);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    // Send the request
    xhr.send(formData);
  });
};

export const uploadAPI = {
  uploadImage,
  uploadVideo,
};