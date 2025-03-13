import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { practiceAPI, wordListAPI } from '../services/api';

interface MistakePattern {
  id: number;
  pattern_type: string;
  description: string;
  frequency: number;
  examples: string[];
  word?: {
    word: string;
  };
}

interface WordList {
  id: number;
  name: string;
  description?: string;
}

interface RouteParams {
  [key: string]: string | undefined;
  listId?: string;
}

const MistakePatternsPage: React.FC = () => {
  const { listId } = useParams<RouteParams>();
  const [patterns, setPatterns] = useState<MistakePattern[]>([]);
  const [wordList, setWordList] = useState<WordList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [listId]);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      const patternsPromise = practiceAPI.getMistakePatterns(listId ? parseInt(listId) : null);
      let wordListPromise;
      if (listId) {
        wordListPromise = wordListAPI.getWordList(parseInt(listId));
      }

      const [patternsData, wordListData] = await Promise.all([
        patternsPromise,
        wordListPromise
      ].filter(Boolean) as [Promise<MistakePattern[]>, Promise<WordList>?]);
      
      setPatterns(patternsData);
      if (wordListData) {
        setWordList(wordListData);
      }
    } catch (err) {
      setError((err as any).response?.data?.detail || 'Failed to load mistake patterns');
    } finally {
      setLoading(false);
    }
  };

  // Group patterns by type
  const groupedPatterns: Record<string, MistakePattern[]> = patterns.reduce((groups, pattern) => {
    const group = groups[pattern.pattern_type] || [];
    group.push(pattern);
    groups[pattern.pattern_type] = group;
    return groups;
  }, {} as Record<string, MistakePattern[]>);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-4">
            {wordList ? `Mistake Patterns - ${wordList.name}` : 'All Mistake Patterns'}
          </h1>
          {error && <Alert variant="danger">{error}</Alert>}
        </Col>
      </Row>

      {Object.entries(groupedPatterns).map(([type, typePatterns]) => (
        <Card key={type} className="mb-4">
          <Card.Header>
            <h4 className="mb-0 text-capitalize">{type} Patterns</h4>
          </Card.Header>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Word</th>
                  <th>Description</th>
                  <th>Frequency</th>
                  <th>Examples</th>
                </tr>
              </thead>
              <tbody>
                {typePatterns.map((pattern) => (
                  <tr key={pattern.id}>
                    <td>{pattern.word?.word}</td>
                    <td>{pattern.description}</td>
                    <td>
                      <Badge bg="primary">{pattern.frequency}</Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {pattern.examples.join(', ')}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ))}

      {patterns.length === 0 && (
        <Alert variant="info">
          No mistake patterns found. Practice more words to see your common mistakes here.
        </Alert>
      )}
    </Container>
  );
};

export default MistakePatternsPage;