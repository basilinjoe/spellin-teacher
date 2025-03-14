import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wordListAPI } from '../services/api';
import { 
    LoadingSpinner, 
    PageContainer,
    PageHeader,
    WordListCard,
    WordListForm,
    ConfirmationModal,
    SRSStatusCard 
} from '../components';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WordList {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

interface EditForm {
    name: string;
    description: string;
}

const WordListsPage: React.FC = () => {
    const [wordLists, setWordLists] = useState<WordList[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [selectedList, setSelectedList] = useState<WordList | null>(null);
    const [editForm, setEditForm] = useState<EditForm>({ name: '', description: '' });

    useEffect(() => {
        fetchWordLists();
    }, []);

    const fetchWordLists = async (): Promise<void> => {
        try {
            setLoading(true);
            const data = await wordListAPI.getWordLists();
            setWordLists(data);
        } catch (err: any) {
            console.error('Failed to load word lists:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (list: WordList): void => {
        setSelectedList(list);
        setEditForm({ name: list.name, description: list.description });
        setShowEditModal(true);
    };

    const handleDelete = (list: WordList): void => {
        setSelectedList(list);
        setShowDeleteModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!selectedList) return;

        try {
            await wordListAPI.updateWordList(selectedList.id, editForm.name, editForm.description);
            setShowEditModal(false);
            fetchWordLists();
        } catch (err: any) {
            console.error('Failed to update word list:', err);
        }
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!selectedList) return;

        try {
            await wordListAPI.deleteWordList(selectedList.id);
            setShowDeleteModal(false);
            fetchWordLists();
        } catch (err: any) {
            console.error('Failed to delete word list:', err);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <PageContainer>
            <PageHeader 
                title="Word Lists"
                actions={
                    <Button asChild>
                        <Link to="/upload">Upload List</Link>
                    </Button>
                }
            />

            <SRSStatusCard />

            {wordLists.length === 0 ? (
                <div className="text-center py-12">
                    <i className="fas fa-list text-4xl mb-4 text-muted-foreground"></i>
                    <h3 className="text-xl font-semibold mb-2">No Word Lists Yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Upload your first word list to start practicing
                    </p>
                    <Button asChild>
                        <Link to="/upload">Upload Word List</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wordLists.map((list) => (
                        <WordListCard
                            key={list.id}
                            {...list}
                            onEdit={() => handleEdit(list)}
                            onDelete={() => handleDelete(list)}
                        />
                    ))}
                </div>
            )}

            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Word List</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <WordListForm
                            name={editForm.name}
                            description={editForm.description}
                            onNameChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            onDescriptionChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmationModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Word List"
                message={`Are you sure you want to delete "${selectedList?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                confirmVariant="destructive"
            />
        </PageContainer>
    );
};

export default WordListsPage;