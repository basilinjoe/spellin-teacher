import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, ButtonGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { practiceAPI, wordListAPI } from '../services/api';

interface APIWord {
    id: number;
    word: string;
    definition: string;
    audio_url: string;
    word_list_id: number;
    srs_level: number;
    next_review: string | null;
}

// Extends the API Word type with practice-related fields from the backend
interface Word extends APIWord {
    meaning?: string;
    familiar: boolean;
    practice_count: number;
    correct_count: number;
    last_practiced: string | null;
}

interface WordList {
    id: number;
    name: string;
    description?: string;
}

interface Stats {
    total_words: number;
    practiced_words: number;
    familiar_words: number;
    accuracy: number;
}

const ProgressPage: React.FC = () => {
    const { listId } = useParams<{ listId: string }>();
    const [wordList, setWordList] = useState<WordList | null>(null);
    const [words, setWords] = useState<Word[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!listId) return;
        loadData();
    }, [listId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            const numericListId = parseInt(listId!, 10);
            // Load word list details, words, and stats in parallel
            const [wordListData, wordsData, statsData] = await Promise.all([
                wordListAPI.getWordList(numericListId),
                wordListAPI.getWordsInList(numericListId),
                practiceAPI.getPracticeStats(numericListId)
            ]);

            setWordList(wordListData);
            // Transform API words into our extended Word interface
            const extendedWords = wordsData.map(w => ({
                ...w,
                familiar: w.srs_level >= 3,  // Consider words with SRS level 3+ as familiar
                practice_count: statsData.total_attempts || 0,
                correct_count: statsData.correct_attempts || 0,
                last_practiced: null // This will be updated when we get per-word stats
            }));
            setWords(extendedWords);

            // Map API stats to our Stats interface
            setStats({
                total_words: statsData.total_attempts || 0,
                practiced_words: statsData.total_attempts || 0,
                familiar_words: extendedWords.filter(w => w.familiar).length,
                accuracy: statsData.accuracy || 0
            });
        } catch (err) {
            setError('Failed to load progress data. Please try again later.');
            console.error('Error loading progress data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getSRSLevelBadge = (level: number, nextReview: string | null) => {
        const now = new Date();
        const reviewDate = nextReview ? new Date(nextReview) : null;
        const isDue = reviewDate && reviewDate <= now;

        let variant = 'primary';
        if (level === 0) variant = 'danger';
        else if (level === 5) variant = 'success';
        else if (level === 4) variant = 'info';
        else if (level === 3) variant = 'teal';
        else if (level === 2) variant = 'warning';
        else if (level === 1) variant = 'orange';

        return (
            <div>
                <Badge bg={variant} className="me-2">
                    Level {level}
                </Badge>
                {isDue && (
                    <Badge bg="danger" className="ms-1">
                        Due
                    </Badge>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    if (!wordList || !stats) {
        return (
            <Container className="py-4">
                <Alert variant="danger">
                    Word list not found or error loading data.
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            <Row className="mb-4">
                <Col>
                    <h1>{wordList.name}</h1>
                    {wordList.description && (
                        <p className="text-muted">{wordList.description}</p>
                    )}
                </Col>
                <Col xs="auto">
                    <ButtonGroup>
                        <Button
                            href={`/practice/${listId}`}
                            variant="primary"
                        >
                            Practice Now
                        </Button>
                        <Button
                            href={`/mistake-patterns/${listId}`}
                            variant="outline-primary"
                        >
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            View Mistakes
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            <Row xs={1} md={2} lg={4} className="g-4 mb-4">
                <Col>
                    <Card className="stats-card h-100">
                        <Card.Body>
                            <h2>{stats.total_words}</h2>
                            <p className="text-muted mb-0">Total Words</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="stats-card h-100">
                        <Card.Body>
                            <h2>{stats.practiced_words}</h2>
                            <p className="text-muted mb-0">Words Practiced</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="stats-card h-100">
                        <Card.Body>
                            <h2>{stats.familiar_words}</h2>
                            <p className="text-muted mb-0">Familiar Words</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="stats-card h-100">
                        <Card.Body>
                            <h2>{(stats.accuracy * 100).toFixed(1)}%</h2>
                            <p className="text-muted mb-0">Accuracy</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card>
                <Card.Header>
                    <h3 className="mb-0">Word Progress</h3>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead>
                            <tr>
                                <th>Word</th>
                                <th>Status</th>
                                <th>SRS Level</th>
                                <th className="text-center">Practice Count</th>
                                <th className="text-center">Accuracy</th>
                                <th>Last Practiced</th>
                                <th>Next Review</th>
                            </tr>
                        </thead>
                        <tbody>
                            {words.map((word) => (
                                <tr key={word.id}>
                                    <td>
                                        <strong>{word.word}</strong>
                                        {word.meaning && (
                                            <small className="d-block text-muted">
                                                {word.meaning}
                                            </small>
                                        )}
                                    </td>
                                    <td>
                                        <Badge bg={word.familiar ? 'success' : 'warning'}>
                                            {word.familiar ? 'Familiar' : 'Learning'}
                                        </Badge>
                                    </td>
                                    <td>
                                        {getSRSLevelBadge(word.srs_level, word.next_review)}
                                    </td>
                                    <td className="text-center">{word.practice_count || 0}</td>
                                    <td className="text-center">
                                        {word.practice_count > 0
                                            ? ((word.correct_count / word.practice_count) * 100).toFixed(1) + '%'
                                            : '-'}
                                    </td>
                                    <td>
                                        {formatDate(word.last_practiced)}
                                    </td>
                                    <td>
                                        {formatDate(word.next_review)}
                                    </td>
                                </tr>
                            ))}
                            {words.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">
                                        No words found in this list
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProgressPage;