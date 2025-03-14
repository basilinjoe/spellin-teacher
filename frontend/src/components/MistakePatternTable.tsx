import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
  return (
    <div className="space-y-6">
      {Object.entries(patterns).map(([type, typePatterns]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="capitalize">{type} Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Word</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Examples</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typePatterns.map((pattern) => (
                  <TableRow key={pattern.id}>
                    <TableCell>{pattern.word?.word}</TableCell>
                    <TableCell>{pattern.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{pattern.frequency}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {pattern.examples.join(', ')}
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