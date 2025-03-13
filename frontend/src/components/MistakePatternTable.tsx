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

interface MistakePattern {
  id: number;
  pattern_type: string;
  description: string;
  frequency: number;
  examples: string[][];
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
    </>
  );
};

export default MistakePatternTable;