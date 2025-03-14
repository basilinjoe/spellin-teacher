import React from 'react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { ExtendedPracticeResponse } from '@/services';

export interface PracticeResultProps extends ExtendedPracticeResponse {
  userInput: string;// Updated to match the API response
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

            {mistake_patterns && mistake_patterns.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Mistake Patterns:</p>
                {mistake_patterns.map((pattern, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-3 space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{pattern.description}</p>
                      <Badge variant="secondary">{pattern.pattern_type}</Badge>
                    </div>
                    {pattern.examples && pattern.examples.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Similar mistakes: {pattern.examples.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PracticeResultCard;