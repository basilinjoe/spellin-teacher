import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { practiceAPI, wordListAPI } from '../services/api';
import { 
    LoadingSpinner,
    PageContainer,
    PageHeader,
    MistakePatternTable
} from '../components';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MistakePattern {
    id: number;
    word?: {
        id: number;
        word: string;
    };
    description: string;
    frequency: number;
    examples: string[];
}

interface WordList {
    id: number;
    name: string;
    description?: string;
}

interface MistakePatternResponse {
    pattern: string;
    count: number;
}

type RouteParams = {
    [key: string]: string | undefined;
    listId?: string;
};

const MistakePatternsPage: React.FC = () => {
    const { listId } = useParams<RouteParams>();
    const [patterns, setPatterns] = useState<MistakePatternResponse[]>([]);
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

            if (listId) {
                const [listData, patternsData] = await Promise.all([
                    wordListAPI.getWordList(parseInt(listId)),
                    practiceAPI.getMistakePatterns(parseInt(listId))
                ]);
                setWordList(listData);
                setPatterns(patternsData);
            } else {
                const patternsData = await practiceAPI.getMistakePatterns();
                setPatterns(patternsData);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load mistake patterns');
        } finally {
            setLoading(false);
        }
    };

    const transformPatterns = (patterns: MistakePatternResponse[]): { [key: string]: MistakePattern[] } => {
        return {
            'mistake': patterns.map((p, index) => ({
                id: index,
                description: p.pattern,
                frequency: p.count,
                examples: []
            }))
        };
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <PageContainer>
            <PageHeader 
                title={wordList ? `${wordList.name} - Mistake Patterns` : 'All Mistake Patterns'}
                description={wordList?.description}
            />

            {error ? (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : (
                <MistakePatternTable patterns={transformPatterns(patterns)} />
            )}
        </PageContainer>
    );
};

export default MistakePatternsPage;