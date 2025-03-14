import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Word {
  id: number;
  word: string;
  meaning?: string;
  example?: string;
  times_practiced: number;
  correct_count: number;
  srs_level: number;
  next_review?: string | null;
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

  const getSRSLevelVariant = (level: number, isDue: boolean): string => {
    if (isDue) return 'destructive';
    if (level === 0) return 'destructive';
    if (level === 5) return 'default';
    return 'secondary';
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Word</TableHead>
            <TableHead>Meaning</TableHead>
            <TableHead>Example</TableHead>
            <TableHead className="text-right">Times Practiced</TableHead>
            <TableHead className="text-right">Correct</TableHead>
            <TableHead>SRS Level</TableHead>
            <TableHead>Next Review</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {words.map((word) => {
            const now = new Date();
            const reviewDate = word.next_review ? new Date(word.next_review) : null;
            const isDue = reviewDate && reviewDate <= now;
            const accuracy = word.times_practiced > 0
              ? Math.round((word.correct_count / word.times_practiced) * 100)
              : 0;

            return (
              <TableRow key={word.id}>
                <TableCell className="font-medium">{word.word}</TableCell>
                <TableCell>{word.meaning || '-'}</TableCell>
                <TableCell>{word.example || '-'}</TableCell>
                <TableCell className="text-right">{word.times_practiced}</TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    accuracy >= 80 ? 'text-green-600' : 
                    accuracy >= 60 ? 'text-yellow-600' : 
                    'text-red-600'
                  )}>
                    {accuracy}%
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={getSRSLevelVariant(word.srs_level, isDue)}>
                    Level {word.srs_level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    'text-sm',
                    isDue ? 'text-destructive font-medium' : 'text-muted-foreground'
                  )}>
                    {formatDate(word.next_review)}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default WordTable;