import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Progress } from './ui/progress';
import { Pencil, Trash2, BookOpen, ChartBar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WordListProps {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  stats?: {
    total_words: number;
    practiced_words: number;
    accuracy: number;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const WordListCard: React.FC<WordListProps> = ({
  id,
  name,
  description,
  created_at,
  stats,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const progressPercentage = stats ? (stats.practiced_words / stats.total_words) * 100 : 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-start gap-4">
          <span className="line-clamp-2">{name}</span>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              title="Edit list"
              className="hover:text-primary"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              title="Delete list"
              className="hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {description}
          </p>
        )}

        {stats && (
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="text-muted-foreground">
                  {stats.practiced_words} / {stats.total_words} words
                </span>
              </div>
              <Progress value={progressPercentage} />
            </div>
            
            <div className="text-sm">
              <span className={cn(
                'font-medium',
                stats.accuracy >= 80 ? 'text-green-600 dark:text-green-400' : 
                stats.accuracy >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                'text-red-600 dark:text-red-400'
              )}>
                {Math.round(stats.accuracy * 100)}% accuracy
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => navigate(`/practice/${id}`)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Practice
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/progress/${id}`)}
          >
            <ChartBar className="h-4 w-4 mr-2" />
            Progress
          </Button>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Created {new Date(created_at).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
};

export default WordListCard;