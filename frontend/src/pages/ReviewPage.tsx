import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { reviewAPI } from '../services/api';

interface Word {
  id: number;
  word: string;
  definition: string;
  audio_url: string;
  word_list_id: number;
  srs_level: number;
  next_review: string | null;
}

interface MistakePattern {
  pattern_type: string;
  description: string;
  examples: string[];
}

interface PracticeResult {
  word_id: number;
  word: string;
  correct: boolean;
  correct_spelling: string;
  meaning?: string;
  example?: string;
  mistake_patterns: MistakePattern[];
}

const ReviewPage: React.FC = () => {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [stats, setStats] = useState<{ total_due: number } | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.addEventListener('error', () => {
      setError('Failed to play audio. Please try again.');
    });
    setAudioElement(audio);

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const loadReviewWords = async (): Promise<void> => {
    try {
      const words = await reviewAPI.getReviewWords();
      if (words.length > 0) {
        setCurrentWord(words[0]);
        setAudioUrl(words[0].audio_url);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load review words');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (): Promise<void> => {
    try {
      const data = await reviewAPI.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    loadReviewWords();
    loadStats();
  }, []);

  useEffect(() => {
    if (audioUrl && audioElement) {
      audioElement.src = audioUrl;
      audioElement.load();
    }
  }, [audioUrl, audioElement]);

  const playAudio = useCallback((): void => {
    if (audioElement) {
      audioElement.play().catch(err => {
        console.error('Audio playback failed:', err);
        setError('Failed to play audio. Please try again.');
      });
    }
  }, [audioElement]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!currentWord || !userInput.trim()) return;

    try {
      const response = await reviewAPI.submitReview(currentWord.id, userInput.trim());
      setResult({
        word_id: response.word_id,
        word: response.word,
        correct: response.correct,
        correct_spelling: response.correct_spelling,
        meaning: response.meaning,
        example: response.example,
        mistake_patterns: response.mistake_patterns,
      });
      
      // Load next review word
      await loadReviewWords();
      setUserInput('');
      await loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit review');
    }
  };

  return (
    <div className="review-page">
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div>Loading...</div>
      ) : currentWord ? (
        <Form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Button onClick={playAudio}>Play Audio</Button>
          </div>
          <Form.Group>
            <Form.Control
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the word you hear"
              autoComplete="off"
            />
          </Form.Group>
          <Button type="submit" className="mt-3">Submit</Button>
          {result && (
            <Alert variant={result.correct ? "success" : "danger"} className="mt-3">
              {result.correct ? "Correct!" : "Incorrect"}
              {result.mistake_patterns && (
                <div>Mistake pattern: {result.mistake_patterns.map(pattern => (
                  <div key={pattern.pattern_type}>
                    <strong>{pattern.pattern_type}:</strong> {pattern.description}
                    {pattern.examples.length > 0 && (
                      <>
                        <br />
                        <strong>Examples:</strong> {pattern.examples.join(", ")}
                      </>
                    )}
                  </div>
                ))}</div>
              )}
            </Alert>
          )}
          {stats && (
            <div className="mt-3">
              Words due for review: {stats.total_due}
            </div>
          )}
        </Form>
      ) : (
        <div>No words to review!</div>
      )}
    </div>
  );
};

export default ReviewPage;