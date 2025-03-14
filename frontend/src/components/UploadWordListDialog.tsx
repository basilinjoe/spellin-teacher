import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { WordListForm } from './';
import { ErrorAlert } from './';
import { wordListService } from '../services';

interface UploadWordListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUploadSuccess: () => void;
}

export const UploadWordListDialog = ({ open, onOpenChange, onUploadSuccess }: UploadWordListDialogProps) => {
    const [formState, setFormState] = React.useState({
        name: '',
        description: '',
        file: null as File | null,
        isLoading: false,
        error: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.file || !formState.name) return;

        setFormState(prev => ({ ...prev, isLoading: true, error: '' }));
        try {
            await wordListService.uploadWordList(formState.name, formState.description, formState.file);
            onOpenChange(false);
            onUploadSuccess();
            setFormState({ name: '', description: '', file: null, isLoading: false, error: '' });
        } catch (err: any) {
            setFormState(prev => ({
                ...prev,
                error: err.response?.data?.detail || 'Failed to upload word list',
                isLoading: false
            }));
        }
    };

    const updateField = (field: string, value: any) =>
        setFormState(prev => ({ ...prev, [field]: value }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogContent >
                    <DialogHeader>
                        <DialogTitle>Upload Word List</DialogTitle>
                    </DialogHeader>

                    <ErrorAlert error={formState.error} />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4 flex flex-col">
                            <WordListForm
                                name={formState.name}
                                description={formState.description}
                                onNameChange={e => updateField('name', e.target.value)}
                                onDescriptionChange={e => updateField('description', e.target.value)}
                            />

                            <div className="space-y-2">
                                <Label htmlFor="file">CSV File</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".csv"
                                    onChange={e => updateField('file', e.target.files?.[0] || null)}
                                    disabled={formState.isLoading}
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    The CSV file should have columns: word,meaning,example
                                </p>
                            </div>

                            <DialogFooter>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        disabled={formState.isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={formState.isLoading}
                                    >
                                        {formState.isLoading ? 'Uploading...' : 'Upload Word List'}
                                    </Button>
                                </div>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};