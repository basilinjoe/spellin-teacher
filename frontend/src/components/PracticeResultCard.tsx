import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ExtendedPracticeResponse } from '@/services';
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Check, X, AlertCircle, BookOpen, BrainCircuit } from "lucide-react";

export interface PracticeResultProps extends ExtendedPracticeResponse {
  userInput: string;
}

interface LLMAnalysis {
  analysis: string;
  suggestions: string[];
  rule: string | null;
}

interface MistakePattern {
  pattern_type: string;
  description: string;
  examples: string[];
  count: number;
  llm_analysis?: LLMAnalysis;
}

const PracticeResultCard: React.FC<PracticeResultProps> = ({
  correct,
  userInput,
  word,
  meaning,
  example,
  mistake_patterns,
}) => {
  const getHighlightedWord = (attempt: string, correct: string): string => {
    return attempt === correct ? attempt : `<span class="text-destructive">${attempt}</span>`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card>
        <ScrollArea className="h-[300px]">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              {correct ? (
                <div className="rounded-full bg-green-500/10 p-3">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
              ) : (
                <div className="rounded-full bg-destructive/10 p-3">
                  <X className="h-6 w-6 text-destructive" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!correct && (
              <div className="rounded-lg border bg-muted/40 px-4 py-3 text-center">
                <p className="text-sm text-muted-foreground mb-1">Your attempt:</p>
                <div
                  className="text-xl"
                  dangerouslySetInnerHTML={{
                    __html: getHighlightedWord(userInput, word)
                  }}
                />
              </div>
            )}

            <div className="rounded-lg border bg-card px-4 py-3 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {correct ? 'Word:' : 'Correct spelling:'}
              </p>
              <p className="text-xl font-medium">{word}</p>
            </div>

            {(meaning || example) && (
              <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-4">
                {meaning && (
                  <div>
                    <p className="text-sm font-medium mb-1">Meaning:</p>
                    <p className="text-muted-foreground">{meaning}</p>
                  </div>
                )}

                {example && (
                  <div>
                    <p className="text-sm font-medium mb-1">Example:</p>
                    <p className="text-muted-foreground italic">{example}</p>
                  </div>
                )}
              </div>
            )}

            {mistake_patterns && mistake_patterns.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Mistake Patterns:</p>

                <div className="p-4 space-y-3">
                  {mistake_patterns.map((pattern, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      key={index}
                      className="rounded-lg border bg-background p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm">{pattern.description}</p>
                        <Badge variant="secondary" className="shrink-0">{pattern.pattern_type}</Badge>
                      </div>
                      {pattern.examples && pattern.examples.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Similar mistakes: {pattern.examples.join(', ')}
                        </p>
                      )}

                      {pattern.llm_analysis && (
                        <div className="mt-4 space-y-3 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4 text-blue-500" />
                            <p className="text-sm font-medium">AI Analysis</p>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{pattern.llm_analysis.analysis}</p>
                          
                          {pattern.llm_analysis.suggestions.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Practice Suggestions:</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground pl-2">
                                {pattern.llm_analysis.suggestions.map((suggestion, idx) => (
                                  <li key={idx}>{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {pattern.llm_analysis.rule && (
                            <div className="flex items-start gap-2 bg-muted/50 p-2 rounded">
                              <BookOpen className="h-4 w-4 text-green-500 mt-0.5" />
                              <p className="text-sm">{pattern.llm_analysis.rule}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </motion.div>
  );
};

export default PracticeResultCard;