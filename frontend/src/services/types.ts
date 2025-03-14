export interface WordList {
  id: number;
  name: string;
  description: string;
  created_at: string;
  user_id: number;
}

export interface Word {
  word_id: number;
  word: string;
  definition: string;
  audio_url: string;
  word_list_id: number;
  srs_level: number;
  next_review: string | null;
}

export interface PracticeResponse {
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

export interface PracticeStats {
  total_words: number;
  familiar_words: number;
  practiced_words: number;
  accuracy: number;
}

export interface SRSStats {
  level_counts: Record<number, number>;
  total_words: number;
  total_due: number;
}

export interface TTSResponse {
  total: number;
  processed: number;
  failed: number;
}

export interface MistakePatternResponse {
  pattern_type: string;
  description: string;
  examples: string[];
  count: number;
  word?: {
    id: number;
    word: string;
  };
}

export interface ReviewWord {
  id: number;
  word: string;
  meaning: string;
  example: string | null;
  audio_url: string;
  srs_level: number;
}

export interface ExtendedPracticeResponse {
  word_id: number;
  word: string;
  correct: boolean;
  correct_spelling: string;
  meaning: string;
  example: string;
  mistake_patterns: Array<{
    pattern_type: string;
    description: string;
    examples: string[];
    count: number;
    word: {
      id: number;
      word: string;
    };
  }>;
}