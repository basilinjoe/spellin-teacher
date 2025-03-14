import React, { useState, useEffect, useCallback } from 'react';
import { reviewService, getAudioUrl, ReviewWord } from '../services';
import {
    ErrorAlert,
    AudioPlayButton,
    PracticeResultCard,
} from '../components';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PracticeResultProps } from '@/components/PracticeResultCard';
import { motion } from "framer-motion";

interface ReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ReviewDialog: React.FC<ReviewDialogProps> = ({ open, onOpenChange }) => {
    const [currentWord, setCurrentWord] = useState<ReviewWord | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [userInput, setUserInput] = useState<string>('');
    const [result, setResult] = useState<PracticeResultProps | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Audio element ref with lazy initialization
    const [audioElement] = useState(() => new Audio());

    // Set up audio error handler
    useEffect(() => {
        const handleError = () => {
            setError('Failed to play audio. Please try again.');
        };
        
        audioElement.addEventListener('error', handleError);
        
        return () => {
            audioElement.pause();
            audioElement.removeEventListener('error', handleError);
            audioElement.src = '';
        };
    }, []);

    // Update audio source when audioUrl changes
    useEffect(() => {
        if (audioUrl) {
            audioElement.src = audioUrl;
            audioElement.load();
        } else {
            audioElement.pause();
            audioElement.src = '';
        }
    }, [audioUrl]);

    const playAudio = useCallback(() => {
        if (!audioUrl) return;
        
        audioElement.play().catch(err => {
            console.error('Audio playback failed:', err);
            setError('Failed to play audio. Please try again.');
        });
    }, [audioUrl]);

    const fetchNextWord = useCallback(async () => {
        try {
            setIsLoading(true);
            setError('');
            const word = await reviewService.getNextReviewWord();

            if (word) {
                setCurrentWord(word);
                setAudioUrl(word.audio_url ? getAudioUrl(word.audio_url) : null);
            } else {
                setCurrentWord(null);
                setAudioUrl(null);
            }
            setResult(null);
            setUserInput('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load review words');
            setCurrentWord(null);
            setAudioUrl(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load the first word when dialog opens
    useEffect(() => {
        if (open) {
            fetchNextWord();
        }
    }, [open, fetchNextWord]);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!currentWord || !userInput.trim()) return;

        try {
            setIsSubmitting(true);
            setError('');
            const response = await reviewService.submitReview(Number(currentWord.id), userInput.trim());
            setResult({ ...response, userInput } as PracticeResultProps);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
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
                    <DialogTitle>Review Words</DialogTitle>
                </DialogHeader>

                {error && <ErrorAlert error={error} onDismiss={() => setError('')} />}
                
                {isLoading && !currentWord ? (
                    <div className="py-8 text-center">Loading...</div>
                ) : currentWord ? (
                    <div className="space-y-6">
                        {result ? (
                            <div className="space-y-4">
                                <PracticeResultCard {...result} userInput={userInput} />
                                <Button
                                    size="lg"
                                    className="w-full"
                                    onClick={fetchNextWord}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Loading...' : 'Next Word'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <AudioPlayButton
                                    onClick={playAudio}
                                    disabled={!audioUrl}
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
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="flex-1"
                                            disabled={isSubmitting || !userInput.trim()}
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
                                                onClick={fetchNextWord}
                                                disabled={isSubmitting}
                                            >
                                                Skip
                                            </Button>
                                        </motion.div>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <h3 className="text-lg font-semibold mb-2">No Words to Review</h3>
                        <p className="text-muted-foreground mb-4">
                            Great job! You've completed all your reviews for now.
                            Check back later for more words to review.
                        </p>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};