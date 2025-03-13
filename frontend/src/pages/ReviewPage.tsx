import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { reviewAPI } from '../services/api';
import { 
    LoadingSpinner, 
    ErrorAlert, 
    AudioPlayButton, 
    PracticeResultCard,
    PageContainer,
    PageHeader,
    StatsCard 
} from '../components';

interface Word {
    id: number;
    word: string;
    definition: string;
    audio_url: string;
    word_list_id: number;
    srs_level: number;
    next_review: string | null;
}

interface PracticeResult {
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
                mistake_patterns: response.mistake_patterns || [],
            });
            
            await loadReviewWords();
            setUserInput('');
            await loadStats();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to submit answer');
        }
    };

    if (loading && !currentWord) {
        return <LoadingSpinner />;
    }

    return (
        <PageContainer>
            <Row className="mb-4">
                <Col>
                    <StatsCard 
                        value={stats?.total_due || 0} 
                        label="Words Due for Review" 
                    />
                </Col>
            </Row>

            {!currentWord && !loading ? (
                <Card className="text-center p-5">
                    <Card.Body>
                        <i className="fas fa-check-circle fa-3x mb-3 text-success"></i>
                        <h3>All Caught Up!</h3>
                        <p className="text-muted">
                            You have no words due for review at the moment.
                            Check back later or practice some word lists.
                        </p>
                    </Card.Body>
                </Card>
            ) : (
                <Card>
                    <Card.Header>
                        <PageHeader 
                            title="Review Session"
                            className="mb-0"
                        />
                    </Card.Header>
                    <Card.Body>
                        <ErrorAlert error={error} onDismiss={() => setError('')} />

                        {result ? (
                            <div>
                                <PracticeResultCard 
                                    {...result}
                                    userInput={userInput}
                                />

                                {!currentWord ? (
                                    <div className="d-grid">
                                        <Button variant="primary" size="lg" onClick={loadReviewWords}>
                                            Continue Review
                                        </Button>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div>
                                <AudioPlayButton
                                    onClick={playAudio}
                                    disabled={loading || !audioUrl}
                                />

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Control
                                            type="text"
                                            placeholder="Type the word here and press Enter"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            autoComplete="off"
                                            autoFocus
                                        />
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            type="submit"
                                            disabled={loading || !userInput.trim()}
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            )}
        </PageContainer>
    );
};

export default ReviewPage;