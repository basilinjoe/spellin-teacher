import React, { useState, useEffect, useCallback } from 'react';
import { practiceService, getAudioUrl, ExtendedPracticeResponse } from '../services';
import {
    ErrorAlert,
    AudioPlayButton,
    PracticeResultCard,
    LoadingSpinner,
} from '../components';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

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
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">{listName ? `Practice: ${listName}` : 'Practice'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">

                    <ErrorAlert error={error} onDismiss={() => setError('')} />

                    <AnimatePresence mode="wait">
                        {loading && !currentWord ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="py-8"
                            >
                                <LoadingSpinner center size="lg" />
                            </motion.div>
                        ) : currentWord ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {result ? (
                                    <div className="space-y-4">
                                        <PracticeResultCard {...result} userInput={userInput} />
                                        <div className="flex gap-2">
                                            <Button
                                                size="lg"
                                                onClick={handleNextWord}
                                                disabled={loading}
                                                className="flex-1 font-medium"
                                            >
                                                Next Word
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                onClick={() => onOpenChange(false)}
                                            >
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <Card className="border-none shadow-none bg-muted/30">
                                            <CardContent className="flex flex-col items-center justify-center pt-6 pb-6">
                                                <AudioPlayButton
                                                    onClick={playAudio}
                                                    disabled={loading || !audioUrl}
                                                    size="lg"
                                                />
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            id="speed"
                                                            checked={speed === 'slow'}
                                                            onCheckedChange={(checked) => setSpeed(checked ? 'slow' : 'normal')}
                                                        />
                                                        <Label htmlFor="speed" className="text-sm">Slow pronunciation</Label>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Type the word here and press Enter"
                                                    value={userInput}
                                                    onChange={(e) => setUserInput(e.target.value)}
                                                    autoComplete="off"
                                                    autoFocus
                                                    className="text-lg h-12"
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    className="flex-1 font-medium"
                                                    disabled={loading || !userInput.trim()}
                                                >
                                                    Submit
                                                </Button>
                                                <motion.div
                                                    whileTap={{ scale: 0.95 }}
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                >
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="lg"
                                                        onClick={handleNextWord}
                                                        disabled={loading}
                                                    >
                                                        Skip
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-8"
                            >
                                <h3 className="text-lg font-semibold mb-2">No Words to Practice</h3>
                                <p className="text-muted-foreground mb-4">
                                    There are no words available for practice in this list.
                                </p>
                                <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    Close
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};