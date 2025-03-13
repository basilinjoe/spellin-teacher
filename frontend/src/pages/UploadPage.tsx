import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { wordListAPI } from '../services/api';

interface WordList {
  id: number;
  name: string;
  description: string;
}

const UploadPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      setFile(null);
      e.target.value = '';
    } else {
      setError('');
      setFile(selectedFile || null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await wordListAPI.uploadWordList(name, description, file);
      navigate('/word-lists');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload word list');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="mt-5">
              <Card.Header>
                <h2>Upload Word List</h2>
              </Card.Header>
              <Card.Body>
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>List Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter list name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>
  
                  <Form.Group className="mb-3" controlId="formDescription">
                    <Form.Label>Description (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter list description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>
  
                  <Form.Group className="mb-4" controlId="formFile">
                    <Form.Label>CSV File</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Upload a CSV file with columns: word, meaning (optional), example (optional)
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
          </Col>
        </Row>
      </Container>
    );
};

export default UploadPage;