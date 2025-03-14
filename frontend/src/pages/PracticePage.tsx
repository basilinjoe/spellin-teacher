import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { practiceService, wordListService, getAudioUrl, ExtendedPracticeResponse } from '../services';
import { 
    LoadingSpinner, 
    ErrorAlert, 
    AudioPlayButton, 
    PracticeResultCard,
    PageContainer,
    PageHeader 
} from '../components';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface WordList {
    id: number;
    name: string;
    description?: string;
}

interface Word {
    word_id: number;  // Changed from id to word_id to match the API response
    word: string;
    definition: string;
    audio_url: string;
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
    const [result, setResult] = useState<ExtendedPracticeResponse | null>(null);
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
        if (!listId) return;

        try {
            setLoading(true);
            setError('');

            const [wordListData, wordData] = await Promise.all([
                wordListService.getWordList(parseInt(listId)),
                practiceService.getWordForPractice(parseInt(listId), speed)
            ]);

            setWordList(wordListData);
            setCurrentWord(wordData);
            // Apply the getAudioUrl function to ensure the URL is complete
            setAudioUrl(wordData.audio_url ? getAudioUrl(wordData.audio_url) : null);
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
            setLoading(true);
            const response = await practiceService.submitPractice(currentWord.word_id, userInput.trim());
            setResult(response);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to submit practice');
        } finally {
            setLoading(false);
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
            <PageHeader 
                title={`Practice: ${wordList?.name || ''}`}
                description={wordList?.description}
            />

            <Card>
                <CardHeader className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="speed"
                            checked={speed === 'slow'}
                            onCheckedChange={(checked) => setSpeed(checked ? 'slow' : 'normal')}
                        />
                        <Label htmlFor="speed">Slow pronunciation</Label>
                    </div>
                </CardHeader>
                <CardContent>
                    <ErrorAlert error={error} onDismiss={() => setError('')} />

                    {result ? (
                        <div className="space-y-4">
                            <PracticeResultCard {...result} userInput={userInput} />
                            <div className="grid gap-2">
                                <Button
                                    size="lg"
                                    onClick={handleNextWord}
                                    disabled={loading}
                                >
                                    Next Word (Press Enter or Space)
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/progress/${listId}`)}
                                >
                                    View Progress
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <AudioPlayButton
                                onClick={playAudio}
                                disabled={loading || !audioUrl}
                            />

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="text"
                                        placeholder="Type the word here and press Enter"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        autoComplete="off"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="flex-1"
                                        disabled={loading || !userInput.trim()}
                                    >
                                        Submit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        onClick={handleNextWord}
                                        disabled={loading}
                                    >
                                        Skip
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default PracticePage;