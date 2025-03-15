import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Progress } from './ui/progress';
import { Pencil, Trash2, BookOpen, ChartBar, Volume2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GenerateAudioDialog } from './GenerateAudioDialog';
import { PracticeDialog } from './PracticeDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from 'framer-motion';

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
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showPracticeDialog, setShowPracticeDialog] = useState(false);

  return (
    <Card className="group h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="leading-tight line-clamp-2">{name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowGenerateDialog(true)} className="gap-2">
                <Volume2 className="h-4 w-4" />
                Generate Audio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit List
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive gap-2">
                <Trash2 className="h-4 w-4" />
                Delete List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        {description && (
          <p className="text-muted-foreground text-sm line-clamp-2">
            {description}
          </p>
        )}

        {stats && (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="text-muted-foreground">
                  {stats.practiced_words} / {stats.total_words} words
                </span>
              </div>
              <div className="relative h-2">
                <Progress 
                  value={progressPercentage} 
                  className="h-2"
                />
              </div>
            </div>
            
            <div className="text-sm flex justify-between items-center">
              <span>Accuracy</span>
              <span className={cn(
                'font-medium',
                stats.accuracy >= 0.8 ? 'text-green-600 dark:text-green-400' : 
                stats.accuracy >= 0.6 ? 'text-yellow-600 dark:text-yellow-400' : 
                'text-red-600 dark:text-red-400'
              )}>
                {Math.round(stats.accuracy * 100)}%
              </span>
            </div>
          </motion.div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            variant="default"
            className="flex-1 gap-2"
            onClick={() => setShowPracticeDialog(true)}
          >
            <BookOpen className="h-4 w-4" />
            Practice
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => navigate(`/progress/${id}`)}
          >
            <ChartBar className="h-4 w-4" />
            Progress
          </Button>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Created {new Date(created_at).toLocaleDateString()}
        </p>
      </CardFooter>

      <GenerateAudioDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        wordListId={id}
      />

      <PracticeDialog
        open={showPracticeDialog}
        onOpenChange={setShowPracticeDialog}
        listId={id}
        listName={name}
      />
    </Card>
  );
};

export default WordListCard;