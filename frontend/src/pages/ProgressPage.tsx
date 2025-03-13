import React, { useState, useEffect } from 'react';
import { Container, Row, Col, ButtonGroup, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { practiceAPI, wordListAPI } from '../services/api';
import { LoadingSpinner, ErrorAlert, StatsCard, WordTable, PageHeader, PageContainer } from '../components';

interface APIWord {
    id: number;
    word: string;
    definition: string;
    audio_url: string;
    word_list_id: number;
    srs_level: number;
    next_review: string | null;
}

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
            const [wordListData, wordsData, statsData] = await Promise.all([
                wordListAPI.getWordList(numericListId),
                wordListAPI.getWordsInList(numericListId),
                practiceAPI.getPracticeStats(numericListId)
            ]);

            setWordList(wordListData);
            const extendedWords = wordsData.map(w => ({
                ...w,
                familiar: w.srs_level >= 3,
                practice_count: statsData.total_attempts || 0,
                correct_count: statsData.correct_attempts || 0,
                last_practiced: null
            }));
            setWords(extendedWords);
            
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

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!wordList || !stats) {
        return (
            <PageContainer>
                <ErrorAlert error="Word list not found or error loading data." />
            </PageContainer>
        );
    }

    const actions = (
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
    );

    return (
        <PageContainer error={error}>
            <PageHeader
                title={wordList.name}
                description={wordList.description}
                actions={actions}
            />

            <Row xs={1} md={2} lg={4} className="g-4 mb-4">
                <Col>
                    <StatsCard 
                        value={stats.total_words}
                        label="Total Words"
                    />
                </Col>
                <Col>
                    <StatsCard 
                        value={stats.practiced_words}
                        label="Words Practiced"
                    />
                </Col>
                <Col>
                    <StatsCard 
                        value={stats.familiar_words}
                        label="Familiar Words"
                    />
                </Col>
                <Col>
                    <StatsCard 
                        value={`${(stats.accuracy * 100).toFixed(1)}%`}
                        label="Accuracy"
                    />
                </Col>
            </Row>

            <WordTable words={words} />
        </PageContainer>
    );
};

export default ProgressPage;