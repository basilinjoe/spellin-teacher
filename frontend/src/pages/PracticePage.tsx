import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { practiceAPI, wordListAPI } from '../services/api';
import { 
    LoadingSpinner, 
    ErrorAlert, 
    AudioPlayButton, 
    PracticeResultCard,
    PageContainer,
    PageHeader 
} from '../components';

interface WordList {
    id: number;
    name: string;
    description?: string;
}

interface Word {
    id: number;
    word: string;
    definition: string;
    audio_url: string;
}

interface PracticeResult {
    correct: boolean;
    mistake_pattern?: string;
    word: string;
    meaning?: string;
    example?: string;
}

interface RouteParams {
    listId: string;
}

const PracticePage: React.FC = () => {
    const { listId } = useParams<keyof RouteParams>() as RouteParams;
    const navigate = useNavigate();
    const [wordList, setWordList] = useState<WordList | null>(null);
    const [currentWord, setCurrentWord] = useState<Word | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [userInput, setUserInput] = useState<string>('');
    const [result, setResult] = useState<PracticeResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [speed, setSpeed] = useState<'normal' | 'slow'>('normal');

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

    const loadData = async (): Promise<void> => {
        try {
            setLoading(true);
            setError('');

            const [wordListData, wordData] = await Promise.all([
                wordListAPI.getWordList(parseInt(listId)),
                practiceAPI.getWordForPractice(parseInt(listId), speed)
            ]);

            setWordList(wordListData);
            setCurrentWord(wordData);
            setAudioUrl(wordData.audio_url);
            setResult(null);
            setUserInput('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load practice data');
            if (err.response?.status === 404) {
                navigate('/word-lists');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [listId, speed]);

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
            const response = await practiceAPI.submitPractice(currentWord.id, userInput.trim());
            setResult({
                correct: response.correct,
                mistake_pattern: response.mistake_patterns?.[0]?.description,
                word: response.word || currentWord.word,
                meaning: response.meaning,
                example: response.example
            });

            setUserInput('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to submit answer');
        }
    };

    const handleNextWord = (): void => {
        setResult(null);
        loadData();
    };

    if (loading && !currentWord) {
        return <LoadingSpinner />;
    }

    return (
        <PageContainer>
            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <PageHeader 
                            title={`Practice: ${wordList?.name}`}
                            className="mb-0"
                        />
                        <Form.Check
                            type="switch"
                            id="speed-switch"
                            label="Slow Mode"
                            checked={speed === 'slow'}
                            onChange={(e) => setSpeed(e.target.checked ? 'slow' : 'normal')}
                            className="mb-0"
                        />
                    </div>
                </Card.Header>
                <Card.Body>
                    <ErrorAlert error={error} onDismiss={() => setError('')} />

                    {result ? (
                        <div>
                            <PracticeResultCard {...result} userInput={userInput} />
                            <div className="d-grid gap-2">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleNextWord}
                                    disabled={loading}
                                >
                                    Next Word (Press Enter or Space)
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => navigate(`/progress/${listId}`)}
                                >
                                    View Progress
                                </Button>
                            </div>
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
        </PageContainer>
    );
};

export default PracticePage;