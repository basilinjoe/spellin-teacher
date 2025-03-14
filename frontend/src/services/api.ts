import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestHeaders, AxiosError } from 'axios';

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
  word_id: number;
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

interface MistakePatternResponse {
  pattern_type: string;
  description: string;
  examples: string[];
  count: number;
  word?: {
    id: number;
    word: string;
  };
}

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with base URL and default config
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Utility to get the full URL for audio files
export const getAudioUrl = (relativeUrl: string): string => {
  if (!relativeUrl) return '';
  
  // If it's already an absolute URL (starts with http:// or https://)
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  // If it's a relative URL
  if (relativeUrl.startsWith('/')) {
    return `${API_BASE_URL}${relativeUrl}`;
  }
  
  // If it doesn't start with /, add one
  return `${API_BASE_URL}/${relativeUrl}`;
};

// Helper function to extract error message from Axios errors
const extractErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data as any;
    
    if (responseData) {
      if (typeof responseData === 'string') return responseData;
      if (responseData.detail) return responseData.detail;
      if (responseData.message) return responseData.message;
      if (Array.isArray(responseData)) return responseData.join(', ');
      return JSON.stringify(responseData);
    }
    return axiosError.message;
  }
  // Handle case when error is an object but not an Axios error
  if (error && typeof error === 'object') {
    if (error.message) return error.message;
    return JSON.stringify(error);
  }
  return error?.toString() || 'An unknown error occurred';
};

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
    try {
      const response = await axiosInstance.get<WordList[]>('/api/v1/word-lists');
      return response.data;
    } catch (error) {
      console.error('Error fetching word lists:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  getWordList: async (id: number): Promise<WordList> => {
    try {
      const response = await axiosInstance.get<WordList>(`/api/v1/word-lists/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching word list ${id}:`, error);
      throw new Error(extractErrorMessage(error));
    }
  },

  getWordsInList: async (id: number): Promise<Word[]> => {
    try {
      const response = await axiosInstance.get<Word[]>(`/api/v1/word-lists/${id}/words`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching words for list ${id}:`, error);
      throw new Error(extractErrorMessage(error));
    }
  },

  uploadWordList: async (name: string, description: string, file: File): Promise<WordList> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || '');
    formData.append('file', file);

    try {
      const response = await axiosInstance.post<WordList>('/api/v1/word-lists/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading word list:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  updateWordList: async (id: number, name: string, description: string): Promise<WordList> => {
    try {
      const response = await axiosInstance.put<WordList>(`/api/v1/word-lists/${id}`, {
        name,
        description
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating word list ${id}:`, error);
      throw new Error(extractErrorMessage(error));
    }
  },

  deleteWordList: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/v1/word-lists/${id}`);
    } catch (error) {
      console.error(`Error deleting word list ${id}:`, error);
      throw new Error(extractErrorMessage(error));
    }
  },

  getSimilarWords: async (wordId: number): Promise<Word[]> => {
    try {
      const response = await axiosInstance.get<Word[]>(`/api/v1/word-lists/words/${wordId}/similar`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching similar words for word ${wordId}:`, error);
      throw new Error(extractErrorMessage(error));
    }
  },
};

// Practice API methods
export const practiceAPI = {
  getWordForPractice: async (wordListId: number, speed: 'slow' | 'normal' = 'normal'): Promise<Word> => {
    try {
      const response = await axiosInstance.post<Word>('/api/v1/practice/get-word', {
        word_list_id: wordListId,
        speed: speed
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting practice word for list ${wordListId}:`, error);
      throw new Error(extractErrorMessage(error));
    }
  },

  submitPractice: async (wordId: number, attempt: string): Promise<{
    correct: boolean;
    mistake_pattern?: {
      pattern_type: string;
      description: string;
      examples: string[];
    };
    word: string;
    meaning?: string;
    example?: string;
    similar_words?: string[];
  }> => {
    try {
      const response = await axiosInstance.post('/api/v1/practice/submit', {
        word_id: wordId,
        attempt
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting practice:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  getPracticeStats: async (wordListId: number): Promise<PracticeStats> => {
    try {
      const response = await axiosInstance.get<PracticeStats>(`/api/v1/practice/${wordListId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error getting practice stats for list ${wordListId}:`, error);
      throw new Error(extractErrorMessage(error));
    }
  },

  getMistakePatterns: async (wordListId?: number | null): Promise<MistakePatternResponse[]> => {
    try {
      const url = '/api/v1/practice/mistake-patterns' + (wordListId ? `?word_list_id=${wordListId}` : '');
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error getting mistake patterns:', error);
      throw new Error(extractErrorMessage(error));
    }
  },
};

// Review API methods
export const reviewAPI = {
  getNextReviewWord: async (): Promise<Word | null> => {
    try {
      const response = await axiosInstance.get<Word[]>('/api/v1/srs/review?limit=1');
      return response.data[0] || null;
    } catch (error) {
      console.error('Error getting next review word:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  submitReview: async (wordId: number, userSpelling: string): Promise<PracticeResponse> => {
    try {
      const response = await axiosInstance.post<PracticeResponse>(`/api/v1/srs/review/${wordId}/submit`, {
        user_spelling: userSpelling,
      });
      return response.data;
    } catch (error) {
      console.error(`Error submitting review for word ${wordId}:`, error);
      throw new Error(extractErrorMessage(error));
    }
  },

  getStats: async (): Promise<SRSStats> => {
    try {
      const response = await axiosInstance.get<SRSStats>('/api/v1/srs/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting SRS stats:', error);
      throw new Error(extractErrorMessage(error));
    }
  }
};

// TTS API methods
export const ttsAPI = {
  generateAllAudio: async (speed: 'slow' | 'normal' = 'normal'): Promise<TTSResponse> => {
    try {
      const response = await axiosInstance.post<TTSResponse>('/api/v1/tts/generate-all', { speed });
      return response.data;
    } catch (error) {
      console.error('Error generating audio:', error);
      throw new Error(extractErrorMessage(error));
    }
  }
};