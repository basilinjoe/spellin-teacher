import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { wordListAPI } from '../services/api';

const WordListsPage = () => {
  const [wordLists, setWordLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchWordLists();
  }, []);

  const fetchWordLists = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await wordListAPI.getWordLists();
      setWordLists(data);
    } catch (err) {
      setError('Failed to load word lists. Please try again later.');
      console.error('Error fetching word lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (list) => {
    setSelectedList(list);
    setEditForm({ name: list.name, description: list.description || '' });
    setShowEditModal(true);
  };

  const handleDelete = (list) => {
    setSelectedList(list);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await wordListAPI.updateWordList(
        selectedList.id,
        editForm.name,
        editForm.description
      );
      await fetchWordLists();
      setShowEditModal(false);
    } catch (err) {
      setError('Failed to update word list. Please try again.');
      console.error('Error updating word list:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await wordListAPI.deleteWordList(selectedList.id);
      await fetchWordLists();
      setShowDeleteModal(false);
    } catch (err) {
      setError('Failed to delete word list. Please try again.');
      console.error('Error deleting word list:', err);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

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

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {wordLists.length === 0 ? (
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
                      as={Link}
                      to={`/practice/${list.id}`}
                      variant="primary"
                    >
                      Practice
                    </Button>
                    <Button
                      as={Link}
                      to={`/progress/${list.id}`}
                      variant="outline-secondary"
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
};

export default WordListsPage;