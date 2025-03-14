import axiosInstance, { extractErrorMessage } from './httpClient';
import { WordList, Word } from './types';

export const wordListService = {
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

export default wordListService;