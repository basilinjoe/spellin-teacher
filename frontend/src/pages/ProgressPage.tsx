import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { wordListService, practiceService } from '../services';
import { LoadingSpinner, ErrorAlert, StatsCard, WordTable, PageHeader, PageContainer } from '../components';
import { Button } from "@/components/ui/button";
import { Word as TableWord } from '../components/WordTable';
import { Card } from "@/components/ui/card";

interface WordListResponse {
    id: number;
    name: string;
    description?: string;
    created_at: string;
}

interface WordResponse {
    id: number;
    word: string;
    meaning?: string;
    example?: string;
    srs_level: number;
    next_review: string | null;
    familiar: boolean;
    practice_count: number;
    correct_count: number;
    incorrect_count: number;
    last_practiced?: string;
}

interface PracticeStatsResponse {
    total_words: number;
    practiced_words: number;
    familiar_words: number;
    accuracy: number;
}

const ProgressPage: React.FC = () => {
    const { listId } = useParams<{ listId: string }>();
    const [wordList, setWordList] = useState<WordListResponse | null>(null);
    const [words, setWords] = useState<TableWord[]>([]);
    const [stats, setStats] = useState<PracticeStatsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!listId) return;
        
        const loadData = async () => {
            try {
                setLoading(true);
                setError('');
                
                const [listData, wordsData, statsData] = await Promise.all([
                    wordListService.getWordList(parseInt(listId)),
                    wordListService.getWordsInList(parseInt(listId)),
                    practiceService.getPracticeStats(parseInt(listId))
                ]);
                
                setWordList(listData);

                // Transform API response to match WordTable's Word interface
                const transformedWords: TableWord[] = wordsData.map((w: WordResponse) => ({
                    id: w.id,
                    word: w.word,
                    meaning: w.meaning || undefined,
                    example: w.example || undefined,
                    times_practiced: w.practice_count || 0,
                    correct_count: w.correct_count || 0,
                    srs_level: w.srs_level || 0,
                    next_review: w.next_review || null
                }));
                setWords(transformedWords);

                setStats({
                    total_words: statsData.total_words || 0,
                    practiced_words: statsData.practiced_words || 0,
                    familiar_words: statsData.familiar_words || 0,
                    accuracy: statsData.accuracy || 0
                });
            } catch (err: any) {
                const errorMessage = err.response?.data?.detail || 
                    err.message || 
                    'An unexpected error occurred while loading progress data';
                setError(errorMessage);
                console.error('Progress page error:', err);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [listId]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!wordList || !stats) {
        return <ErrorAlert error={error || 'Failed to load word list'} />;
    }

    const actions = (
        <Button variant="outline" asChild>
            <a href={`/api/word-lists/${listId}/export`} download>
                Export CSV
            </a>
        </Button>
    );

    return (
        <PageContainer className="space-y-8">
            <PageHeader
                title={wordList.name}
                description={wordList.description}
                actions={actions}
            />

            <Card className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard 
                        value={stats.total_words}
                        label="Total Words"
                        className="bg-background/50"
                    />
                    <StatsCard 
                        value={stats.practiced_words}
                        label="Words Practiced"
                        className="bg-background/50"
                    />
                    <StatsCard 
                        value={stats.familiar_words}
                        label="Familiar Words"
                        className="bg-background/50"
                    />
                    <StatsCard 
                        value={`${(stats.accuracy * 100).toFixed(1)}%`}
                        label="Accuracy"
                        className="bg-background/50"
                    />
                </div>
            </Card>

            <Card className="p-6">
                <WordTable words={words} />
            </Card>
        </PageContainer>
    );
};

export default ProgressPage;