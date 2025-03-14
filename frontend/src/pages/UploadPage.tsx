import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wordListAPI } from '../services/api';
import { 
    ErrorAlert, 
    WordListForm,
    PageContainer,
    PageHeader 
} from '../components';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            <PageHeader title="Upload Word List" />

            <Card>
                <CardContent className="pt-6">
                    <ErrorAlert error={error} />
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <WordListForm
                            name={form.name}
                            description={form.description}
                            onNameChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            onDescriptionChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                        
                        <div className="space-y-2">
                            <Label htmlFor="file">CSV File</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".csv"
                                onChange={(e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    setForm(prev => ({ ...prev, file: file || null }));
                                }}
                                disabled={loading}
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                The CSV file should have columns: word,meaning,example
                            </p>
                        </div>

                        <Card className="mb-4">
                            <CardHeader>
                                <h5 className="text-lg font-semibold">CSV Format Example</h5>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-sm bg-muted/50 p-4 rounded-md">
                                    word,meaning,example{'\n'}
                                    accommodate,to provide lodging or room for,The hotel can accommodate up to 500 guests{'\n'}
                                    rhythm,a strong regular repeated pattern,She danced to the rhythm of the music
                                </pre>
                            </CardContent>
                        </Card>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Uploading...' : 'Upload Word List'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default UploadPage;