import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Pencil, Trash2 } from 'lucide-react';

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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{name}</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              title="Edit list"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              title="Delete list"
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="text-muted-foreground">
            {description}
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <Button
            variant="default"
            onClick={() => navigate(`/practice/${id}`)}
          >
            Practice
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/progress/${id}`)}
          >
            Progress
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Created: {new Date(created_at).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
};

export default WordListCard;