import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { practiceAPI, wordListAPI } from '../services/api';

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
    next_word?: Word;
    similar_words?: Word[];
    word?: string;
    meaning?: string;
    example?: string;
}

const getHighlightedWord = (attempt: string, correct: string | undefined): string => {
    if (!correct) return attempt;
    // Simple highlighting - you might want to enhance this
    return attempt === correct ? attempt : `<span class="text-danger">${attempt}</span>`;
};

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
                word: response.word,
                meaning: response.meaning,
                example: response.example,
                similar_words: []
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

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header>
                            <div className="d-flex justify-content-between align-items-center">
                                <h2 className="mb-0">Practice: {wordList?.name}</h2>
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
                            {error && (
                                <Alert variant="danger" className="mb-4">
                                    {error}
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="float-end"
                                        onClick={() => setError('')}
                                    >
                                        Dismiss
                                    </Button>
                                </Alert>
                            )}

                            {result ? (
                                // Show practice result
                                <div className="text-center">
                                    <Alert variant={result.correct ? 'success' : 'danger'}>
                                        {result.correct ? 'Correct!' : 'Incorrect!'}
                                    </Alert>

                                    <h3 className="mb-4">
                                        {result.correct ? (
                                            result.word
                                        ) : (
                                            <>
                                                <div className="mb-2">Your attempt:</div>
                                                <div
                                                    className="spelling-attempt"
                                                    dangerouslySetInnerHTML={{
                                                        __html: getHighlightedWord(userInput, result.word)
                                                    }}
                                                />
                                                <div className="mt-2 text-muted">
                                                    Correct spelling: {result.word}
                                                </div>
                                            </>
                                        )}
                                    </h3>

                                    {result.meaning && (
                                        <p className="mb-3">
                                            <strong>Meaning:</strong> {result.meaning}
                                        </p>
                                    )}

                                    {result.example && (
                                        <p className="mb-4">
                                            <strong>Example:</strong> {result.example}
                                        </p>
                                    )}

                                    {result.mistake_pattern && (
                                        <p className="mb-3">
                                            <strong>Mistake Pattern:</strong> {result.mistake_pattern}
                                        </p>
                                    )}

                                    {result.similar_words && result.similar_words.length > 0 && (
                                        <div className="mb-4">
                                            <h4>Similar Words:</h4>
                                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                                {result.similar_words.map((word, index) => (
                                                    <Badge
                                                        key={index}
                                                        bg="info"
                                                        className="p-2"
                                                        style={{ fontSize: '1rem' }}
                                                    >
                                                        {word.word}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

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
                                // Show practice interface
                                <div>
                                    <div className="text-center mb-4">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="practice-audio-button"
                                            onClick={playAudio}
                                            disabled={loading || !audioUrl}
                                            title="Click or press Space to play audio"
                                        >
                                            <i className="fas fa-volume-up fa-3x"></i>
                                        </Button>
                                        <p className="mt-3">
                                            Click or press <kbd>Space</kbd> to hear the word
                                        </p>
                                    </div>

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
                </Col>
            </Row>
        </Container>
    );
};


export default PracticePage;