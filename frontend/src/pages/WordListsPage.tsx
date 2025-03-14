import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wordListService, practiceService } from '../services';
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon } from "lucide-react";

interface WordList {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

interface WordListStats {
    total_words: number;
    practiced_words: number;
    accuracy: number;
}

interface EditForm {
    name: string;
    description: string;
}

const WordListsPage: React.FC = () => {
    const [wordLists, setWordLists] = useState<WordList[]>([]);
    const [wordListStats, setWordListStats] = useState<Record<number, WordListStats>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [selectedList, setSelectedList] = useState<WordList | null>(null);
    const [editForm, setEditForm] = useState<EditForm>({ name: '', description: '' });
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'created' | 'progress'>('name');

    useEffect(() => {
        fetchWordLists();
    }, []);

    const fetchWordLists = async (): Promise<void> => {
        try {
            setLoading(true);
            const lists = await wordListService.getWordLists();
            setWordLists(lists);

            // Fetch stats for each word list
            const statsPromises = lists.map(list => 
                practiceService.getPracticeStats(list.id)
                    .then(stats => ({ listId: list.id, stats }))
                    .catch(() => ({ listId: list.id, stats: null }))
            );
            
            const statsResults = await Promise.all(statsPromises);
            const statsMap: Record<number, WordListStats> = {};
            statsResults.forEach(result => {
                if (result.stats) {
                    statsMap[result.listId] = result.stats;
                }
            });
            
            setWordListStats(statsMap);
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
            await wordListService.updateWordList(selectedList.id, editForm.name, editForm.description);
            setShowEditModal(false);
            fetchWordLists();
        } catch (err: any) {
            console.error('Failed to update word list:', err);
        }
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!selectedList) return;

        try {
            await wordListService.deleteWordList(selectedList.id);
            setShowDeleteModal(false);
            fetchWordLists();
        } catch (err: any) {
            console.error('Failed to delete word list:', err);
        }
    };

    const getSortedAndFilteredLists = () => {
        let filtered = wordLists.filter(list =>
            list.name.toLowerCase().includes(search.toLowerCase()) ||
            list.description.toLowerCase().includes(search.toLowerCase())
        );

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'created':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'progress':
                    const aStats = wordListStats[a.id];
                    const bStats = wordListStats[b.id];
                    const aProgress = aStats ? aStats.practiced_words / aStats.total_words : 0;
                    const bProgress = bStats ? bStats.practiced_words / bStats.total_words : 0;
                    return bProgress - aProgress;
                default:
                    return 0;
            }
        });
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

            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search word lists..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={sortBy} onValueChange={(value: 'name' | 'created' | 'progress') => setSortBy(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="created">Sort by Created Date</SelectItem>
                        <SelectItem value="progress">Sort by Progress</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {getSortedAndFilteredLists().length === 0 ? (
                <div className="text-center py-12">
                    <i className="fas fa-list text-4xl mb-4 text-muted-foreground"></i>
                    <h3 className="text-xl font-semibold mb-2">No Word Lists Found</h3>
                    <p className="text-muted-foreground mb-4">
                        {search ? 'Try different search terms' : 'Upload your first word list to start practicing'}
                    </p>
                    {!search && (
                        <Button asChild>
                            <Link to="/upload">Upload Word List</Link>
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getSortedAndFilteredLists().map((list) => (
                        <WordListCard
                            key={list.id}
                            {...list}
                            stats={wordListStats[list.id]}
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