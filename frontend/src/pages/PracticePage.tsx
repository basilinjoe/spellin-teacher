import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { practiceAPI, wordListAPI, getAudioUrl } from '../services/api';
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

interface MistakePattern {
    pattern_type: string;
    description: string;
    examples: string[];
}

interface PracticeResult {
    correct: boolean;
    mistake_pattern?: MistakePattern;
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
            // Add debugging to verify currentWord.word_id exists
            console.log('Current word before submission:', currentWord);
            
            if (currentWord.word_id === undefined) {
                setError('Word ID is missing. Please reload the page and try again.');
                return;
            }
            
            const response = await practiceAPI.submitPractice(currentWord.word_id, userInput.trim());
            setResult({
                correct: response.correct,
                mistake_pattern: response.mistake_patterns?.[0],
                word: response.word || currentWord.word,
                meaning: response.meaning,
                example: response.example
            });

            setUserInput('');
        } catch (err: any) {
            console.error('Practice submission error:', err);
            // Convert error object to string if needed
            let errorMessage = err.message || 'Failed to submit answer';
            if (typeof err === 'object') {
                errorMessage = err.message || JSON.stringify(err);
            }
            setError(errorMessage);
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

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={loading || !userInput.trim()}
                                >
                                    Submit
                                </Button>
                            </form>
                        </div>
                    )}
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default PracticePage;