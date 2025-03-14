import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, BarChart2 } from 'lucide-react';

interface Word {
  id: number;
  word: string;
}

interface MistakePattern {
  id: number;
  word?: Word;
  description: string;
  examples: string[];
  frequency: number;
}

interface MistakePatterns {
  [key: string]: MistakePattern[];
}

interface MistakePatternTableProps {
  patterns: MistakePatterns;
}

const MistakePatternTable: React.FC<MistakePatternTableProps> = ({ patterns }) => {
  // Sort patterns by frequency
  const sortedPatterns: MistakePatterns = Object.fromEntries(
    Object.entries(patterns).map(([type, typePatterns]) => [
      type,
      [...typePatterns].sort((a, b) => b.frequency - a.frequency)
    ])
  );

  // Calculate total mistakes for percentages
  const totalMistakes = Object.values(patterns)
    .flat()
    .reduce((sum, pattern) => sum + pattern.frequency, 0);

  // Group patterns by type and calculate type frequencies
  const typeFrequencies = Object.entries(patterns).reduce((acc, [type, patterns]) => {
    acc[type] = patterns.reduce((sum, p) => sum + p.frequency, 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Pattern Overview
          </CardTitle>
          <CardDescription>
            Distribution of different types of spelling mistakes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(typeFrequencies).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {((count / totalMistakes) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pattern Details */}
      {Object.entries(sortedPatterns).map(([type, typePatterns]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              <span className="capitalize">{type} Patterns</span>
              <Badge variant="secondary" className="ml-2">
                {typePatterns.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Word</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Frequency</TableHead>
                  <TableHead>Examples</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typePatterns.map((pattern) => (
                  <TableRow key={pattern.id}>
                    <TableCell className="font-medium">
                      {pattern.word?.word || '-'}
                    </TableCell>
                    <TableCell>{pattern.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Badge variant="secondary">
                          {pattern.frequency}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ({((pattern.frequency / totalMistakes) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="text-sm text-muted-foreground truncate">
                        {pattern.examples.join(', ')}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MistakePatternTable;