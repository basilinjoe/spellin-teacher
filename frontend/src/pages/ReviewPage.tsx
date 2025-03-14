import React, { useState, useEffect, useCallback } from 'react';
import { reviewAPI, getAudioUrl } from '../services/api';
import { 
    LoadingSpinner, 
    ErrorAlert, 
    AudioPlayButton, 
    PracticeResultCard,
    PageContainer,
    PageHeader,
    StatsCard 
} from '../components';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Word {
    id: number;
    word: string;
    audio_url: string;
    srs_level: number;
    meaning?: string;
    example?: string;
}

interface PracticeResult {
    word_id: number;
    word: string;
    correct: boolean;
    correct_spelling: string;
    meaning?: string;
    example?: string;
    mistake_patterns?: Array<{
        description: string;
    }>;
    similar_words?: string[];
}

const ReviewPage: React.FC = () => {
    const [currentWord, setCurrentWord] = useState<Word | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [userInput, setUserInput] = useState<string>('');
    const [result, setResult] = useState<PracticeResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio();
        const handleError = () => {
            setError('Failed to play audio. Please try again.');
        };
        audio.addEventListener('error', handleError);
        setAudioElement(audio);

        return () => {
            audio.pause();
            audio.removeEventListener('error', handleError);
            audio.src = '';
            setAudioElement(null);
        };
    }, []);

    const loadReviewWords = async (): Promise<void> => {
        try {
            setLoading(true);
            setError('');
            const word = await reviewAPI.getNextReviewWord();
            if (!word) {
                setCurrentWord(null);
                setAudioUrl(null);
                return;
            }
            setCurrentWord(word);
            // Apply the getAudioUrl function to ensure the URL is complete
            setAudioUrl(word.audio_url ? getAudioUrl(word.audio_url) : null);
            setResult(null);
            setUserInput('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load review words');
            setCurrentWord(null);
            setAudioUrl(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviewWords();
    }, []);

    useEffect(() => {
        if (!audioElement) return;
        
        if (audioUrl) {
            audioElement.src = audioUrl;
            audioElement.load();
        } else {
            audioElement.pause();
            audioElement.src = '';
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
            setLoading(true);
            const response = await reviewAPI.submitReview(currentWord.id, userInput.trim());
            setResult(response);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !currentWord) {
        return <LoadingSpinner />;
    }

    return (
        <PageContainer>
            {currentWord ? (
                <Card>
                    <CardContent className="pt-6">
                        <ErrorAlert error={error} onDismiss={() => setError('')} />

                        {result ? (
                            <div className="space-y-4">
                                <PracticeResultCard {...result} userInput={userInput} />
                                <Button
                                    size="lg"
                                    className="w-full"
                                    onClick={loadReviewWords}
                                >
                                    Next Word
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <AudioPlayButton
                                    onClick={playAudio}
                                    disabled={loading || !audioUrl}
                                />

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Input
                                            type="text"
                                            placeholder="Type the word here and press Enter"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            autoComplete="off"
                                            autoFocus
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full"
                                        disabled={loading || !userInput.trim()}
                                    >
                                        Submit
                                    </Button>
                                </form>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-4">No Words to Review</h3>
                    <p className="text-muted-foreground mb-4">
                        Great job! You've completed all your reviews for now.
                        Check back later for more words to review.
                    </p>
                </div>
            )}
        </PageContainer>
    );
};

export default ReviewPage;