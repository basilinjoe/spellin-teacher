import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { wordListService } from '../services';
import { LoadingSpinner, ErrorAlert, PracticeDialog } from '../components';
import { PageContainer, PageHeader } from '../components';

interface WordList {
    id: number;
    name: string;
    description?: string;
}

interface RouteParams {
    listId: string;
}

const PracticePage: React.FC = () => {
    const { listId } = useParams<keyof RouteParams>() as RouteParams;
    const navigate = useNavigate();
    const [wordList, setWordList] = useState<WordList | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [showPractice, setShowPractice] = useState<boolean>(true);

    useEffect(() => {
        const loadWordList = async () => {
            if (!listId) return;

            try {
                setLoading(true);
                setError('');
                const data = await wordListService.getWordList(parseInt(listId));
                setWordList(data);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to load word list');
                if (err.response?.status === 404) {
                    navigate('/word-lists');
                }
            } finally {
                setLoading(false);
            }
        };

        loadWordList();
    }, [listId, navigate]);

    if (loading && !wordList) {
        return <LoadingSpinner />;
    }

    return (
        <PageContainer>
            <PageHeader 
                title={`Practice: ${wordList?.name || ''}`}
                description={wordList?.description}
            />
            <ErrorAlert error={error} onDismiss={() => setError('')} />

            <PracticeDialog 
                open={showPractice}
                onOpenChange={setShowPractice}
                listId={parseInt(listId)}
                listName={wordList?.name}
            />
        </PageContainer>
    );
};

export default PracticePage;