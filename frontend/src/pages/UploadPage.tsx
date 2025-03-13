import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { wordListAPI } from '../services/api';
import { 
    ErrorAlert, 
    WordListForm,
    PageContainer,
    PageHeader 
} from '../components';

interface UploadForm {
    name: string;
    description: string;
    file: File | null;
}

const UploadPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [form, setForm] = useState<UploadForm>({
        name: '',
        description: '',
        file: null
    });

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!form.file || !form.name) return;

        try {
            setLoading(true);
            setError('');

            await wordListAPI.uploadList(form.name, form.description, form.file);
            navigate('/word-lists');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to upload word list');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader 
                title="Upload Word List"
                description="Upload a CSV file containing words, meanings, and example sentences."
            />

            <Card>
                <Card.Body>
                    <ErrorAlert error={error} />
                    
                    <Form onSubmit={handleSubmit}>
                        <WordListForm
                            name={form.name}
                            description={form.description}
                            onNameChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            onDescriptionChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                            disabled={loading}
                        />

                        <Form.Group className="mb-4">
                            <Form.Label>CSV File</Form.Label>
                            <Form.Control
                                type="file"
                                accept=".csv"
                                onChange={(e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    setForm(prev => ({ ...prev, file: file || null }));
                                }}
                                disabled={loading}
                                required
                            />
                            <Form.Text className="text-muted">
                                The CSV file should have columns: word,meaning,example
                            </Form.Text>
                        </Form.Group>

                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">CSV Format Example</h5>
                            </Card.Header>
                            <Card.Body>
                                <pre className="mb-0">
                                    word,meaning,example{'\n'}
                                    accommodate,to provide lodging or room for,The hotel can accommodate up to 500 guests{'\n'}
                                    rhythm,a strong regular repeated pattern,She danced to the rhythm of the music
                                </pre>
                            </Card.Body>
                        </Card>

                        <div className="d-grid">
                            <Button
                                variant="primary"
                                type="submit"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? 'Uploading...' : 'Upload Word List'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </PageContainer>
    );
};

export default UploadPage;