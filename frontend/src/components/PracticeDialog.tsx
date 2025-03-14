import React, { useState, useEffect, useCallback } from 'react';
import { practiceService, getAudioUrl, ExtendedPracticeResponse } from '../services';
import {
    ErrorAlert,
    AudioPlayButton,
    PracticeResultCard,
} from '../components';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PracticeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    listId: number;
    listName?: string;
}

interface Word {
    word_id: number;
    word: string;
    definition: string;
    audio_url: string;
}

export const PracticeDialog: React.FC<PracticeDialogProps> = ({ 
    open, 
    onOpenChange, 
    listId,
    listName 
}) => {
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
        try {
            setLoading(true);
            setError('');

            const wordData = await practiceService.getWordForPractice(listId, speed);
            setCurrentWord(wordData);
            setAudioUrl(wordData.audio_url ? getAudioUrl(wordData.audio_url) : null);
            setResult(null);
            setUserInput('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load practice data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open, listId, speed]);

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

    // Auto-play audio when a new word is loaded
    useEffect(() => {
        if (currentWord && audioUrl && !result && open) {
            const timeoutId = setTimeout(() => {
                playAudio();
            }, 500); // Small delay to ensure audio is loaded
            
            return () => clearTimeout(timeoutId);
        }
    }, [currentWord, audioUrl, result, playAudio, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Practice: {listName}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="speed"
                            checked={speed === 'slow'}
                            onCheckedChange={(checked) => setSpeed(checked ? 'slow' : 'normal')}
                        />
                        <Label htmlFor="speed">Slow pronunciation</Label>
                    </div>

                    <ErrorAlert error={error} onDismiss={() => setError('')} />

                    {loading && !currentWord ? (
                        <div className="py-8 text-center">Loading...</div>
                    ) : currentWord ? (
                        <div className="space-y-6">
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
                                            onClick={() => onOpenChange(false)}
                                        >
                                            Close
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
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-lg font-semibold mb-2">No Words to Practice</h3>
                            <p className="text-muted-foreground mb-4">
                                There are no words available for practice in this list.
                            </p>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};