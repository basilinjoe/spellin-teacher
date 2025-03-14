import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ErrorAlert } from '.';
import { ttsService } from '../services';

interface GenerateAudioDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    wordListId: number;
    onSuccess?: () => void;
}

interface GenerationProgress {
    total: number;
    processed: number;
    failed: number;
    percentage: number;
}

export const GenerateAudioDialog = ({ open, onOpenChange, wordListId, onSuccess }: GenerateAudioDialogProps) => {
    const [speed, setSpeed] = useState<'normal' | 'slow'>('normal');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<GenerationProgress | null>(null);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await ttsService.generateWordListAudio(wordListId, speed);
            setProgress({
                ...response,
                percentage: (response.processed / response.total) * 100
            });
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to generate audio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Audio</DialogTitle>
                    </DialogHeader>

                    <ErrorAlert error={error} />
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Select
                                value={speed}
                                onValueChange={(value) => setSpeed(value as 'normal' | 'slow')}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select speed" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Normal Speed</SelectItem>
                                    <SelectItem value="slow">Slow Speed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {progress && (
                            <div className="space-y-2">
                                <Progress value={progress.percentage} />
                                <p className="text-sm text-muted-foreground">
                                    Processed: {progress.processed} / {progress.total} words
                                    {progress.failed > 0 && (
                                        <span className="text-destructive ml-2">
                                            Failed: {progress.failed}
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}

                        <DialogFooter>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={loading}
                                >
                                    Close
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={loading}
                                >
                                    {loading ? 'Generating...' : 'Generate Audio'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};