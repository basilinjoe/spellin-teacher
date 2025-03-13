import React from 'react';
import { Alert, Badge } from 'react-bootstrap';

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
  mistake_pattern?: string;
  similar_words?: Array<{ word: string }>;
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
    return attempt === correct ? attempt : `<span class="text-danger">${attempt}</span>`;
  };

  return (
    <div className="text-center">
      <Alert variant={correct ? 'success' : 'danger'}>
        {correct ? 'Correct!' : 'Incorrect!'}
      </Alert>

      <h3 className="mb-4">
        {correct ? (
          word
        ) : (
          <>
            <div className="mb-2">Your attempt:</div>
            <div
              className="spelling-attempt"
              dangerouslySetInnerHTML={{
                __html: getHighlightedWord(userInput, word)
              }}
            />
            <div className="mt-2 text-muted">
              Correct spelling: {word}
            </div>
          </>
        )}
      </h3>

      {meaning && (
        <p className="mb-3">
          <strong>Meaning:</strong> {meaning}
        </p>
      )}

      {example && (
        <p className="mb-4">
          <strong>Example:</strong> {example}
        </p>
      )}

      {mistake_pattern && (
        <p className="mb-3">
          <strong>Mistake Pattern:</strong> {mistake_pattern}
        </p>
      )}

      {similar_words && similar_words.length > 0 && (
        <div className="mb-4">
          <h4>Similar Words:</h4>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {similar_words.map((word, index) => (
              <Badge
                key={index}
                bg="info"
                className="p-2"
                style={{ fontSize: '1rem' }}
              >
                {word.word}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeResultCard;