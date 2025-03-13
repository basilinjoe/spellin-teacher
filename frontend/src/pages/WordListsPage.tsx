import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { wordListAPI } from '../services/api';
import { 
    LoadingSpinner, 
    PageContainer,
    PageHeader,
    WordListCard,
    WordListForm,
    ConfirmationModal,
    ErrorAlert,
    SRSStatusCard 
} from '../components';

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
    const [error, setError] = useState<string>('');
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
            setError('');
            const data = await wordListAPI.getWordLists();
            setWordLists(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load word lists');
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
            await fetchWordLists();
            setShowEditModal(false);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to update word list');
        }
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!selectedList) return;

        try {
            await wordListAPI.deleteWordList(selectedList.id);
            await fetchWordLists();
            setShowDeleteModal(false);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to delete word list');
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Word Lists"
                actions={
                    <Link to="/upload" className="btn btn-primary">
                        <i className="fas fa-upload me-2"></i>
                        Upload List
                    </Link>
                }
            />

            <SRSStatusCard />

            {loading ? (
                <LoadingSpinner />
            ) : wordLists.length === 0 ? (
                <div className="text-center p-5">
                    <i className="fas fa-list fa-3x mb-3 text-muted"></i>
                    <h3>No Word Lists Yet</h3>
                    <p className="text-muted">
                        Upload your first word list to start practicing
                    </p>
                    <Link to="/upload" className="btn btn-primary">
                        Upload Word List
                    </Link>
                </div>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {wordLists.map((list) => (
                        <Col key={list.id}>
                            <WordListCard
                                {...list}
                                onEdit={() => handleEdit(list)}
                                onDelete={() => handleDelete(list)}
                            />
                        </Col>
                    ))}
                </Row>
            )}

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Word List</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Body>
                        <WordListForm
                            name={editForm.name}
                            description={editForm.description}
                            onNameChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            onDescriptionChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Word List"
                message={`Are you sure you want to delete "${selectedList?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                confirmVariant="danger"
            />
        </PageContainer>
    );
};

export default WordListsPage;