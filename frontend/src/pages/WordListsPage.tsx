import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Form, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { wordListAPI } from '../services/api';
import SRSStatusCard from '../components/SRSStatusCard';

interface WordList {
  id: number;
  name: string;
  description: string;
  created_at: string;
  user_id: number;
}

interface EditForm {
  name: string;
  description: string;
}

const WordListsPage: React.FC = () => {
  const navigate = useNavigate();
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
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h1>My Word Lists</h1>
            <p className="text-muted">Practice your spelling with your word lists</p>
          </Col>
          <Col xs="auto">
            <Link to="/upload" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              Upload New List
            </Link>
          </Col>
        </Row>
  
        {/* Add SRS Status Card */}
        <SRSStatusCard />
  
        {error && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}
  
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : wordLists.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <i className="fas fa-list fa-3x mb-3 text-muted"></i>
              <h3>No Word Lists Yet</h3>
              <p className="text-muted">
                Upload your first word list to start practicing
              </p>
              <Link to="/upload" className="btn btn-primary">
                Upload Word List
              </Link>
            </Card.Body>
          </Card>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {wordLists.map((list) => (
              <Col key={list.id}>
                <Card className="h-100 word-list-card">
                  <Card.Body>
                    <Card.Title className="d-flex justify-content-between align-items-start">
                      <span>{list.name}</span>
                      <div className="ms-2">
                        <Button
                          variant="link"
                          className="p-0 me-2 text-primary"
                          onClick={() => handleEdit(list)}
                          title="Edit list"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="link"
                          className="p-0 text-danger"
                          onClick={() => handleDelete(list)}
                          title="Delete list"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </Button>
                      </div>
                    </Card.Title>
                    {list.description && (
                      <Card.Text className="text-muted">
                        {list.description}
                      </Card.Text>
                    )}
                    <div className="d-flex gap-2 mt-3">
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/practice/${list.id}`)}
                      >
                        Practice
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => navigate(`/progress/${list.id}`)}
                      >
                        Progress
                      </Button>
                    </div>
                  </Card.Body>
                  <Card.Footer className="text-muted">
                    <small>
                      Created: {new Date(list.created_at).toLocaleDateString()}
                    </small>
                  </Card.Footer>
                </Card>
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
              <Form.Group className="mb-3">
                <Form.Label>List Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </Form.Group>
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
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Word List</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete "{selectedList?.name}"? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
}

export default WordListsPage;