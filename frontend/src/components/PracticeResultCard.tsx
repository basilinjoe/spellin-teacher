import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MistakePattern {
  pattern_type: string;
  description: string;
  examples: string[];
}

interface PracticeResultProps {
  correct: boolean;
  userInput: string;
  word: string;
  meaning?: string;
  example?: string;
  mistake_pattern?: MistakePattern;
  similar_words?: string[];
}

const PracticeResultCard: React.FC<PracticeResultProps> = ({
  correct,
  userInput,
  word,
  meaning,
  example,
  mistake_pattern,
  similar_words,
}) => {
  const getHighlightedWord = (attempt: string, correct: string): string => {
    return attempt === correct ? attempt : `<span class="text-destructive">${attempt}</span>`;
  };

  return (
    <div className="space-y-4">
      <Alert variant={correct ? "default" : "destructive"}>
        <div className="flex items-center gap-2">
          {correct ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <AlertTitle className="text-lg font-semibold">
            {correct ? 'Correct!' : 'Incorrect!'}
          </AlertTitle>
        </div>
      </Alert>

      {!correct && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Your attempt:</p>
              <div
                className="text-xl"
                dangerouslySetInnerHTML={{
                  __html: getHighlightedWord(userInput, word)
                }}
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Correct spelling:</p>
              <p className="text-xl font-medium">{word}</p>
            </div>

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

            {mistake_pattern && (
              <div>
                <p className="text-sm font-medium mb-2">Mistake Pattern:</p>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{mistake_pattern.description}</p>
                    <Badge variant="secondary">{mistake_pattern.pattern_type}</Badge>
                  </div>
                  {mistake_pattern.examples.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Similar mistakes: {mistake_pattern.examples.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {similar_words && similar_words.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Similar Words:</p>
                <div className="flex flex-wrap gap-2">
                  {similar_words.map((word, index) => (
                    <Badge key={index} variant="outline">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PracticeResultCard;