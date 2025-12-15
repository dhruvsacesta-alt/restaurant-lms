const API_BASE_URL = 'https://restaurant-lms.onrender.com/api';

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
  getByCourseId: (courseId: string) => apiRequest(`/courses/${courseId}/chapters`),

  getById: (id: string) => apiRequest(`/chapters/${id}`),

  create: (courseId: string, chapter: { name: string; description: string }) =>
    apiRequest(`/courses/${courseId}/chapters`, {
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
  getByChapterId: (chapterId: string) => apiRequest(`/chapters/${chapterId}/videos`),

  getById: (id: string) => apiRequest(`/videos/${id}`),

  create: (chapterId: string, video: {
    title: string;
    description: string;
    videoUrl: string;
    thumbnail?: string;
    duration?: string;
  }) =>
    apiRequest(`/chapters/${chapterId}/videos`, {
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
export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    });
  },

  uploadVideo: (file: File) => {
    const formData = new FormData();
    formData.append('video', file);

    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/upload/video`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    });
  },
};