import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { practiceAPI, wordListAPI } from '../services/api';
import { 
    LoadingSpinner,
    PageContainer,
    PageHeader,
    MistakePatternTable
} from '../components';
import { Alert } from 'react-bootstrap';

interface MistakePattern {
    id: number;
    pattern_type: string;
    description: string;
    frequency: number;
    examples: string[];
    word?: {
        word: string;
    };
}

interface WordList {
    id: number;
    name: string;
    description?: string;
}

type RouteParams = {
    [key: string]: string | undefined;
    listId?: string;
};

const MistakePatternsPage: React.FC = () => {
    const { listId } = useParams<RouteParams>();
    const [patterns, setPatterns] = useState<MistakePattern[]>([]);
    const [wordList, setWordList] = useState<WordList | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadData();
    }, [listId]);

    const loadData = async (): Promise<void> => {
        try {
            setLoading(true);
            setError('');

            const patternsPromise = practiceAPI.getMistakePatterns(listId ? parseInt(listId) : null);
            let wordListPromise;
            if (listId) {
                wordListPromise = wordListAPI.getWordList(parseInt(listId));
            }

            const [patternsData, wordListData] = await Promise.all([
                patternsPromise,
                wordListPromise
            ].filter(Boolean) as [Promise<MistakePattern[]>, Promise<WordList>?]);

            setPatterns(patternsData);
            if (wordListData) {
                setWordList(wordListData);
            }
        } catch (err) {
            setError((err as any).response?.data?.detail || 'Failed to load mistake patterns');
        } finally {
            setLoading(false);
        }
    };

    // Group patterns by type
    const groupedPatterns: Record<string, MistakePattern[]> = patterns.reduce((groups, pattern) => {
        const group = groups[pattern.pattern_type] || [];
        group.push(pattern);
        groups[pattern.pattern_type] = group;
        return groups;
    }, {} as Record<string, MistakePattern[]>);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <PageContainer error={error}>
            <PageHeader
                title={wordList ? `Mistake Patterns - ${wordList.name}` : 'All Mistake Patterns'}
            />

            {patterns.length === 0 ? (
                <Alert variant="info">
                    No mistake patterns found. Practice more words to see your common mistakes here.
                </Alert>
            ) : (
                <MistakePatternTable patterns={groupedPatterns} />
            )}
        </PageContainer>
    );
};

export default MistakePatternsPage;