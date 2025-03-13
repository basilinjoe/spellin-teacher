import React, { useState } from 'react';
import { Form, Button, Card, ProgressBar } from 'react-bootstrap';
import { ttsAPI } from '../services/api';
import { 
    ErrorAlert,
    PageContainer,
    PageHeader
} from '../components';

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
                <Card.Body>
                    <ErrorAlert error={error} />
                    
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Speech Speed</Form.Label>
                            <Form.Select 
                                value={speed}
                                onChange={(e) => setSpeed(e.target.value as 'normal' | 'slow')}
                                disabled={loading}
                            >
                                <option value="normal">Normal</option>
                                <option value="slow">Slow</option>
                            </Form.Select>
                        </Form.Group>

                        <Button 
                            variant="primary" 
                            onClick={handleGenerateAudio}
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Audio'}
                        </Button>
                    </Form>

                    {progress && (
                        <div className="mt-4">
                            <ProgressBar 
                                now={progress.percentage} 
                                label={`${progress.percentage}%`}
                                className="mb-2"
                            />
                            <p className="text-muted">
                                Processed: {progress.processed} / {progress.total} words
                                {progress.failed > 0 && (
                                    <span className="text-danger">
                                        {' '}(Failed: {progress.failed})
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </PageContainer>
    );
};

export default AudioGenerationPage;