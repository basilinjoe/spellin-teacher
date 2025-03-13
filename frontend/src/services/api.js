import axios from 'axios';

// Create axios instance with base URL and default config
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // For auth endpoints, set content type to form data
  if (config.url === '/auth/login' || config.url === '/auth/register') {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    // Convert data to form data format
    if (config.data) {
      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(config.data)) {
        formData.append(key, value);
      }
      config.data = formData;
    }
  } 
  
  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle unauthorized responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Word List API methods
export const wordListAPI = {
  getWordLists: async () => {
    const response = await axiosInstance.get('/api/v1/word-lists');
    return response.data;
  },

  getWordList: async (id) => {
    const response = await axiosInstance.get(`/api/v1/word-lists/${id}`);
    return response.data;
  },

  getWordsInList: async (id) => {
    const response = await axiosInstance.get(`/api/v1/word-lists/${id}/words`);
    return response.data;
  },

  uploadWordList: async (name, description, file) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || '');
    formData.append('file', file);

    const response = await axiosInstance.post('/api/v1/word-lists/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateWordList: async (id, name, description) => {
    const response = await axiosInstance.put(`/api/v1/word-lists/${id}`, {
      name,
      description
    });
    return response.data;
  },

  deleteWordList: async (id) => {
    await axiosInstance.delete(`/api/v1/word-lists/${id}`);
  },

  getSimilarWords: async (wordId) => {
    const response = await axiosInstance.get(`/api/v1/word-lists/words/${wordId}/similar`);
    return response.data;
  },
};

// Practice API methods
export const practiceAPI = {
  getWordForPractice: async (wordListId, speed = 'normal') => {
    const response = await axiosInstance.post('/api/v1/practice/get-word', {
      word_list_id: wordListId,
      speed: speed
    });
    return response.data;
  },

  submitPractice: async (wordId, userSpelling) => {
    const response = await axiosInstance.post('/api/v1/practice/submit', {
      word_id: wordId,
      user_spelling: userSpelling,
    });
    return response.data;
  },

  getPracticeStats: async (wordListId) => {
    const response = await axiosInstance.get(`/api/v1/practice/${wordListId}/stats`);
    return response.data;
  },

  getMistakePatterns: async (wordListId = null) => {
    const url = '/api/v1/practice/mistake-patterns' + (wordListId ? `?word_list_id=${wordListId}` : '');
    const response = await axiosInstance.get(url);
    return response.data;
  },
};

// Review API methods
export const reviewAPI = {
  getReviewWords: async () => {
    const response = await axiosInstance.get('/api/v1/srs/review');
    return response.data;
  },

  submitReview: async (wordId, userSpelling) => {
    const response = await axiosInstance.post(`/api/v1/srs/review/${wordId}/submit`, {
      user_spelling: userSpelling,
    });
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get('/api/v1/srs/stats');
    return response.data;
  }
};

// TTS API methods
export const ttsAPI = {
  generateAllAudio: async (speed = 'normal') => {
    const response = await axiosInstance.post('/api/v1/tts/generate-all', { speed });
    return response.data;
  }
};