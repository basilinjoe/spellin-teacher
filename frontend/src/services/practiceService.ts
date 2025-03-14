import axiosInstance, { extractErrorMessage } from './httpClient';
import { Word, PracticeResponse, PracticeStats, MistakePatternResponse } from './types';

export const practiceService = {
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

export default practiceService;