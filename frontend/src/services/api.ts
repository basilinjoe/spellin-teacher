import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios';

/// <reference types="vite/client" />

// Interfaces
interface WordList {
  id: number;
  name: string;
  description: string;
  created_at: string;
  user_id: number;
}

interface Word {
  id: number;
  word: string;
  definition: string;
  audio_url: string;
  word_list_id: number;
  srs_level: number;
  next_review: string | null;
}

interface PracticeResponse {
  word_id: number;
  word: string;
  correct: boolean;
  correct_spelling: string;
  meaning?: string;
  example?: string;
  mistake_patterns: Array<{
    pattern_type: string;
    description: string;
    examples: string[];
  }>;
}

interface PracticeStats {
  total_words: number;
  familiar_words: number;
  practiced_words: number;
  accuracy: number;
}

interface SRSStats {
  level_counts: Record<number, number>;
  total_words: number;
  total_due: number;
}

interface TTSResponse {
  total: number;
  processed: number;
  failed: number;
}

// Create axios instance with base URL and default config
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  
  // For auth endpoints, set content type to form data
  if (config.url === '/auth/login' || config.url === '/auth/register') {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    // Convert data to form data format
    if (config.data) {
      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(config.data)) {
        formData.append(key, String(value));
      }
      config.data = formData;
    }
  } 
  
  // Add authorization header if token exists
  if (token) {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }
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
  getWordLists: async (): Promise<WordList[]> => {
    const response = await axiosInstance.get<WordList[]>('/api/v1/word-lists');
    return response.data;
  },

  getWordList: async (id: number): Promise<WordList> => {
    const response = await axiosInstance.get<WordList>(`/api/v1/word-lists/${id}`);
    return response.data;
  },

  getWordsInList: async (id: number): Promise<Word[]> => {
    const response = await axiosInstance.get<Word[]>(`/api/v1/word-lists/${id}/words`);
    return response.data;
  },

  uploadWordList: async (name: string, description: string, file: File): Promise<WordList> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || '');
    formData.append('file', file);

    const response = await axiosInstance.post<WordList>('/api/v1/word-lists/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateWordList: async (id: number, name: string, description: string): Promise<WordList> => {
    const response = await axiosInstance.put<WordList>(`/api/v1/word-lists/${id}`, {
      name,
      description
    });
    return response.data;
  },

  deleteWordList: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/v1/word-lists/${id}`);
  },

  getSimilarWords: async (wordId: number): Promise<Word[]> => {
    const response = await axiosInstance.get<Word[]>(`/api/v1/word-lists/words/${wordId}/similar`);
    return response.data;
  },
};

// Practice API methods
export const practiceAPI = {
  getWordForPractice: async (wordListId: number, speed: 'slow' | 'normal' = 'normal'): Promise<Word> => {
    const response = await axiosInstance.post<Word>('/api/v1/practice/get-word', {
      word_list_id: wordListId,
      speed: speed
    });
    return response.data;
  },

  submitPractice: async (wordId: number, userSpelling: string): Promise<PracticeResponse> => {
    const response = await axiosInstance.post<PracticeResponse>('/api/v1/practice/submit', {
      word_id: wordId,
      user_spelling: userSpelling,
    });
    return response.data;
  },

  getPracticeStats: async (wordListId: number): Promise<PracticeStats> => {
    const response = await axiosInstance.get<PracticeStats>(`/api/v1/practice/${wordListId}/stats`);
    return response.data;
  },

  getMistakePatterns: async (wordListId?: number | null): Promise<Array<{ pattern: string; count: number }>> => {
    const url = '/api/v1/practice/mistake-patterns' + (wordListId ? `?word_list_id=${wordListId}` : '');
    const response = await axiosInstance.get(url);
    return response.data;
  },
};

// Review API methods
export const reviewAPI = {
  getNextReviewWord: async (): Promise<Word | null> => {
    const response = await axiosInstance.get<Word[]>('/api/v1/srs/review?limit=1');
    return response.data[0] || null;
  },

  submitReview: async (wordId: number, userSpelling: string): Promise<PracticeResponse> => {
    const response = await axiosInstance.post<PracticeResponse>(`/api/v1/srs/review/${wordId}/submit`, {
      user_spelling: userSpelling,
    });
    return response.data;
  },

  getStats: async (): Promise<SRSStats> => {
    const response = await axiosInstance.get<SRSStats>('/api/v1/srs/stats');
    return response.data;
  }
};


// TTS API methods
export const ttsAPI = {
  generateAllAudio: async (speed: 'slow' | 'normal' = 'normal'): Promise<TTSResponse> => {
    const response = await axiosInstance.post<TTSResponse>('/api/v1/tts/generate-all', { speed });
    return response.data;
  }
};