import axiosInstance, { extractErrorMessage, getAudioUrl } from './httpClient';
import { TTSResponse } from './types';

export const ttsService = {
  generateAllAudio: async (speed: 'slow' | 'normal' = 'normal'): Promise<TTSResponse> => {
    try {
      const response = await axiosInstance.post<TTSResponse>('/api/v1/tts/generate-all', { speed });
      return response.data;
    } catch (error) {
      console.error('Error generating audio:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  generateWordListAudio: async (wordListId: number, speed: 'slow' | 'normal' = 'normal'): Promise<TTSResponse> => {
    try {
      const response = await axiosInstance.post<TTSResponse>(`/api/v1/tts/word-list/${wordListId}/generate`, { speed });
      return response.data;
    } catch (error) {
      console.error('Error generating word list audio:', error);
      throw new Error(extractErrorMessage(error));
    }
  },

  getAudioUrl
};

export default ttsService;