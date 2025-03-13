import React from 'react';
import { Table, Badge } from 'react-bootstrap';

interface Word {
  id: number;
  word: string;
  meaning?: string;
  familiar: boolean;
  srs_level: number;
  next_review: string | null;
  practice_count: number;
  correct_count: number;
  last_practiced: string | null;
}

interface WordTableProps {
  words: Word[];
}

const WordTable: React.FC<WordTableProps> = ({ words }) => {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getSRSLevelBadge = (level: number, nextReview: string | null) => {
    const now = new Date();
    const reviewDate = nextReview ? new Date(nextReview) : null;
    const isDue = reviewDate && reviewDate <= now;

    let variant = 'primary';
    if (level === 0) variant = 'danger';
    else if (level === 5) variant = 'success';
    else if (level === 4) variant = 'info';
    else if (level === 3) variant = 'teal';
    else if (level === 2) variant = 'warning';
    else if (level === 1) variant = 'orange';

    return (
      <div>
        <Badge bg={variant} className="me-2">
          Level {level}
        </Badge>
        {isDue && (
          <Badge bg="danger" className="ms-1">
            Due
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Table responsive hover className="mb-0">
      <thead>
        <tr>
          <th>Word</th>
          <th>Status</th>
          <th>SRS Level</th>
          <th className="text-center">Practice Count</th>
          <th className="text-center">Accuracy</th>
          <th>Last Practiced</th>
          <th>Next Review</th>
        </tr>
      </thead>
      <tbody>
        {words.map((word) => (
          <tr key={word.id}>
            <td>
              <strong>{word.word}</strong>
              {word.meaning && (
                <small className="d-block text-muted">
                  {word.meaning}
                </small>
              )}
            </td>
            <td>
              <Badge bg={word.familiar ? 'success' : 'warning'}>
                {word.familiar ? 'Familiar' : 'Learning'}
              </Badge>
            </td>
            <td>
              {getSRSLevelBadge(word.srs_level, word.next_review)}
            </td>
            <td className="text-center">{word.practice_count || 0}</td>
            <td className="text-center">
              {word.practice_count > 0
                ? ((word.correct_count / word.practice_count) * 100).toFixed(1) + '%'
                : '-'}
            </td>
            <td>
              {formatDate(word.last_practiced)}
            </td>
            <td>
              {formatDate(word.next_review)}
            </td>
          </tr>
        ))}
        {words.length === 0 && (
          <tr>
            <td colSpan={7} className="text-center py-4">
              No words found in this list
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default WordTable;