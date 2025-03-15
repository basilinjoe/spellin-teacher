import React, { useState, useEffect } from 'react';
import { wordListService, practiceService } from '../services';
import { 
    LoadingSpinner, 
    PageContainer,
    PageHeader,
    WordListCard,
    WordListForm,
    ConfirmationModal,
    UploadWordListDialog,
    ReviewDialog 
} from '../components';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon, Plus, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
    const [selectedList, setSelectedList] = useState<WordList | null>(null);
    const [editForm, setEditForm] = useState<EditForm>({ name: '', description: '' });
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'created' | 'progress'>('name');
    const [showReviewDialog, setShowReviewDialog] = useState<boolean>(false);

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

    const handleUploadClick = (): void => {
        setShowUploadModal(true);
    };

    const getSortedAndFilteredLists = () => {
        let filtered = wordLists.filter(list => 
            list.name.toLowerCase().includes(search.toLowerCase()) ||
            list.description.toLowerCase().includes(search.toLowerCase())
        );

        switch (sortBy) {
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'created':
                filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case 'progress':
                filtered.sort((a, b) => {
                    const statsA = wordListStats[a.id];
                    const statsB = wordListStats[b.id];
                    if (!statsA && !statsB) return 0;
                    if (!statsA) return 1;
                    if (!statsB) return -1;
                    return (statsB.practiced_words / statsB.total_words) - (statsA.practiced_words / statsA.total_words);
                });
                break;
        }

        return filtered;
    };

    return (
        <PageContainer>
            <div className="space-y-8">
                <PageHeader 
                    title="Word Lists"
                    description="Create and manage your vocabulary lists"
                    actions={
                        <div className="flex gap-2">
                            <Button variant="outline"
                                onClick={() => setShowReviewDialog(true)}
                                className="gap-2">
                                Review Words
                            </Button>
                            <Button variant="outline"
                                onClick={handleUploadClick}
                                className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create List
                            </Button>
                        </div>
                    }
                />

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search word lists..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={sortBy} onValueChange={(value: 'name' | 'created' | 'progress') => setSortBy(value)}>
                        <SelectTrigger className="w-[180px] shrink-0">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Sort by Name</SelectItem>
                            <SelectItem value="created">Sort by Created Date</SelectItem>
                            <SelectItem value="progress">Sort by Progress</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-center py-12"
                        >
                            <LoadingSpinner />
                        </motion.div>
                    ) : getSortedAndFilteredLists().length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-12 space-y-4"
                        >
                            <div className="rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold">No Word Lists Found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                {search ? 'Try different search terms or clear the search' : 'Upload your first word list to start practicing'}
                            </p>
                            {!search && (
                                <Button onClick={handleUploadClick} className="gap-2">
                                    <Upload className="h-4 w-4" />
                                    Upload Word List
                                </Button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {getSortedAndFilteredLists().map((list) => (
                                <motion.div
                                    key={list.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <WordListCard
                                        {...list}
                                        stats={wordListStats[list.id]}
                                        onEdit={() => handleEdit(list)}
                                        onDelete={() => handleDelete(list)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <UploadWordListDialog 
                open={showUploadModal}
                onOpenChange={setShowUploadModal}
                onUploadSuccess={fetchWordLists}
            />

            {/* Edit Word List Dialog */}
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

            <ReviewDialog
                open={showReviewDialog}
                onOpenChange={setShowReviewDialog}
            />

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