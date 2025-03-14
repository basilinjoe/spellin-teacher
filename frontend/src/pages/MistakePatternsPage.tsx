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
    pattern_type: string;
    description: string;
    examples: string[];
    count: number;
    word?: {
        id: number;
        word: string;
    };
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
        // Group patterns by type
        const groupedPatterns = patterns.reduce((acc, p) => {
            const type = p.pattern_type || 'other';
            if (!acc[type]) {
                acc[type] = [];
            }
            
            acc[type].push({
                id: acc[type].length, // Use array index as ID within each group
                word: p.word,
                description: p.description,
                frequency: p.count,
                examples: p.examples
            });
            
            return acc;
        }, {} as { [key: string]: MistakePattern[] });

        // Sort types by total frequency
        const sortedGroups = Object.entries(groupedPatterns)
            .sort(([, patternsA], [, patternsB]) => {
                const totalA = patternsA.reduce((sum, p) => sum + p.frequency, 0);
                const totalB = patternsB.reduce((sum, p) => sum + p.frequency, 0);
                return totalB - totalA;
            });

        return Object.fromEntries(sortedGroups);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <PageContainer>
            <PageHeader 
                title={wordList ? `${wordList.name} - Mistake Patterns` : 'All Mistake Patterns'}
                description={wordList?.description || 'Analysis of common spelling mistake patterns'}
            />

            {error ? (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : patterns.length === 0 ? (
                <Alert>
                    <AlertDescription>
                        No mistake patterns found. Keep practicing to see your common spelling mistakes!
                    </AlertDescription>
                </Alert>
            ) : (
                <MistakePatternTable patterns={transformPatterns(patterns)} />
            )}
        </PageContainer>
    );
};

export default MistakePatternsPage;