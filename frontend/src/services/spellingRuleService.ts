import axiosInstance, { extractErrorMessage } from './httpClient';

export interface SpellingRule {
  id: number;
  title: string;
  description: string;
  examples: string[];
  category: string;
  created_at: string;
  updated_at: string | null;
  related_words: Array<{
    id: number;
    word: string;
    meaning?: string;
  }>;
}

interface CreateSpellingRuleData {
  title: string;
  description: string;
  examples: string[];
  category: string;
}

const spellingRuleService = {
  async getSpellingRules(category?: string) {
    try {
      const params = category ? { category } : {};
      const response = await axiosInstance.get<SpellingRule[]>('/api/v1/spelling-rules', { params });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async getSpellingRule(id: number) {
    try {
      const response = await axiosInstance.get<SpellingRule>(`/api/v1/spelling-rules/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async createSpellingRule(data: CreateSpellingRuleData) {
    try {
      const response = await axiosInstance.post<SpellingRule>('/api/v1/spelling-rules', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async updateSpellingRule(id: number, data: Partial<CreateSpellingRuleData>) {
    try {
      const response = await axiosInstance.patch<SpellingRule>(`/api/v1/spelling-rules/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async deleteSpellingRule(id: number) {
    try {
      await axiosInstance.delete(`/api/v1/spelling-rules/${id}`);
      return true;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async addWordToRule(ruleId: number, wordId: number) {
    try {
      await axiosInstance.post(`/api/v1/spelling-rules/${ruleId}/words/${wordId}`);
      return true;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async removeWordFromRule(ruleId: number, wordId: number) {
    try {
      await axiosInstance.delete(`/api/v1/spelling-rules/${ruleId}/words/${wordId}`);
      return true;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
};

export default spellingRuleService;