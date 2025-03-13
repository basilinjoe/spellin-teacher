import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface WordListProps {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  onEdit: () => void;
  onDelete: () => void;
}

const WordListCard: React.FC<WordListProps> = ({
  id,
  name,
  description,
  created_at,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <Card className="h-100 word-list-card">
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-start">
          <span>{name}</span>
          <div className="ms-2">
            <Button
              variant="link"
              className="p-0 me-2 text-primary"
              onClick={onEdit}
              title="Edit list"
            >
              <i className="fas fa-edit"></i>
            </Button>
            <Button
              variant="link"
              className="p-0 text-danger"
              onClick={onDelete}
              title="Delete list"
            >
              <i className="fas fa-trash-alt"></i>
            </Button>
          </div>
        </Card.Title>
        {description && (
          <Card.Text className="text-muted">
            {description}
          </Card.Text>
        )}
        <div className="d-flex gap-2 mt-3">
          <Button
            variant="primary"
            onClick={() => navigate(`/practice/${id}`)}
          >
            Practice
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => navigate(`/progress/${id}`)}
          >
            Progress
          </Button>
        </div>
      </Card.Body>
      <Card.Footer className="text-muted">
        <small>
          Created: {new Date(created_at).toLocaleDateString()}
        </small>
      </Card.Footer>
    </Card>
  );
};

export default WordListCard;