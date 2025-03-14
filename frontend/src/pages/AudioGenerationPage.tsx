import React, { useState } from 'react';
import { ttsAPI } from '../services/api';
import { 
    ErrorAlert,
    PageContainer,
    PageHeader
} from '../components';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface GenerationProgress {
    total: number;
    processed: number;
    failed: number;
    percentage: number;
}

const AudioGenerationPage: React.FC = () => {
    const [speed, setSpeed] = useState<'normal' | 'slow'>('normal');
    const [loading, setLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState<GenerationProgress | null>(null);
    const [error, setError] = useState<string>('');

    const handleGenerateAudio = async (): Promise<void> => {
        try {
            setLoading(true);
            setError('');
            setProgress(null);
            
            const result = await ttsAPI.generateAllAudio(speed);
            
            setProgress({
                total: result.total,
                processed: result.processed,
                failed: result.failed,
                percentage: Math.round((result.processed / result.total) * 100)
            });
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to generate audio files');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader title="Generate Audio Files" />

            <Card>
                <CardContent className="pt-6">
                    <ErrorAlert error={error} />
                    
                    <form className="space-y-6">
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
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="slow">Slow</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button 
                            type="button"
                            onClick={handleGenerateAudio}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Generating...' : 'Generate Audio'}
                        </Button>
                    </form>

                    {progress && (
                        <div className="mt-6 space-y-2">
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
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default AudioGenerationPage;