import axiosInstance, { extractErrorMessage } from './httpClient';
import { ReviewWord, PracticeResponse, SRSStats } from './types';

export const reviewService = {
    getNextReviewWord: async (): Promise<ReviewWord | null> => {
    try {
      const response = await axiosInstance.get<ReviewWord[]>('/api/v1/srs/review?limit=1');
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

export default reviewService;