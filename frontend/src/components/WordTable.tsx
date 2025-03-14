import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Search, ChevronLeft, ChevronRight } from "lucide-react";

export interface Word {
  id: number;
  word: string;
  meaning?: string;
  example?: string;
  times_practiced: number;
  correct_count: number;
  srs_level: number;
  next_review: string | null;
}

interface WordTableProps {
  words: Word[];
}

type SortConfig = {
  key: keyof Word;
  direction: 'asc' | 'desc';
};

const ITEMS_PER_PAGE = 10;

const WordTable: React.FC<WordTableProps> = ({ words }) => {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'word', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getSRSLevelVariant = (level: number, isDue: boolean): "default" | "destructive" | "secondary" => {
    if (isDue) return "destructive";
    if (level === 0) return "destructive";
    if (level >= 4) return "default";
    return "secondary";
  };

  const handleSort = (key: keyof Word) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  const sortedAndFilteredWords = useMemo(() => {
    let filteredWords = words;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredWords = words.filter(word => 
        word.word.toLowerCase().includes(searchLower) ||
        word.meaning?.toLowerCase().includes(searchLower) ||
        word.example?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    return [...filteredWords].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const comparison = (aValue < bValue ? -1 : aValue > bValue ? 1 : 0);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [words, search, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedAndFilteredWords.length / ITEMS_PER_PAGE);
  const paginatedWords = sortedAndFilteredWords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const SortableHeader: React.FC<{ label: string; sortKey: keyof Word }> = ({ label, sortKey }) => (
    <div 
      className="flex items-center gap-1 cursor-pointer hover:text-primary"
      onClick={() => handleSort(sortKey)}
    >
      {label}
      <ArrowUpDown className={cn(
        "h-4 w-4 transition-colors",
        sortConfig.key === sortKey && "text-primary"
      )} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search words, meanings, or examples..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {sortedAndFilteredWords.length} {sortedAndFilteredWords.length === 1 ? 'word' : 'words'}
        </div>
      </div>
      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">
                <SortableHeader label="Word" sortKey="word" />
              </TableHead>
              <TableHead className="min-w-[200px]">
                <SortableHeader label="Meaning" sortKey="meaning" />
              </TableHead>
              <TableHead className="min-w-[200px]">Example</TableHead>
              <TableHead className="text-right min-w-[100px]">
                <SortableHeader label="Times Practiced" sortKey="times_practiced" />
              </TableHead>
              <TableHead className="text-right min-w-[100px]">
                <SortableHeader label="Accuracy" sortKey="correct_count" />
              </TableHead>
              <TableHead className="min-w-[100px]">
                <SortableHeader label="SRS Level" sortKey="srs_level" />
              </TableHead>
              <TableHead className="min-w-[150px]">
                <SortableHeader label="Next Review" sortKey="next_review" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedWords.map((word) => {
              const now = new Date();
              const reviewDate = word.next_review ? new Date(word.next_review) : null;
              const isDue = Boolean(reviewDate && reviewDate <= now);
              const accuracy = word.times_practiced > 0
                ? Math.round((word.correct_count / word.times_practiced) * 100)
                : 0;

              return (
                <TableRow 
                  key={word.id} 
                  className={cn(
                    isDue && "bg-muted/50",
                    "transition-colors hover:bg-muted/30"
                  )}
                >
                  <TableCell className="font-medium">{word.word}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{word.meaning || '-'}</TableCell>
                  <TableCell className="max-w-[300px] truncate italic text-muted-foreground">
                    {word.example || '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">{word.times_practiced}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      'font-medium',
                      accuracy >= 80 ? 'text-green-600 dark:text-green-400' : 
                      accuracy >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-red-600 dark:text-red-400'
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordTable;