import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';

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

interface MistakePatternTableProps {
  patterns: Record<string, MistakePattern[]>;
}

const MistakePatternTable: React.FC<MistakePatternTableProps> = ({ patterns }) => {
  return (
    <>
      {Object.entries(patterns).map(([type, typePatterns]) => (
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
    </>
  );
};

export default MistakePatternTable;