import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { practiceAPI, wordListAPI } from '../services/api';

const PracticePage = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [wordList, setWordList] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [audioElement, setAudioElement] = useState(null);
  const [similarWords, setSimilarWords] = useState([]);
  const [speed, setSpeed] = useState('normal');

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.addEventListener('error', () => {
      setError('Failed to play audio. Please try again.');
    });
    setAudioElement(audio);
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Auto-play audio when URL changes
  useEffect(() => {
    if (audioUrl && audioElement) {
      audioElement.src = audioUrl;
      audioElement.play().catch(error => {
        console.error('Error auto-playing audio:', error);
        setError('Failed to auto-play audio. Click the speaker icon or press Space to try again.');
      });
    }
  }, [audioUrl, audioElement]);

  // Get next word for practice
  const getNextWord = useCallback(async () => {
    try {
      setLoading(true);
      setResult(null);
      setUserInput('');
      setSimilarWords([]);
      
      const data = await practiceAPI.getWordForPractice(listId, speed);
      setCurrentWord(data);
      setAudioUrl(primport.meta.env.REACT_APP_API_URL.slice(0,-1) + data.audio_url);
    } catch (err) {
      setError('Failed to get next word. Please try again later.');
      console.error('Error getting next word:', err);
    } finally {
      setLoading(false);
    }
  }, [listId, speed]);

  // Keyboard shortcuts handler
  const handleKeyPress = useCallback((e) => {
    // Space bar or Enter to move to next word when showing results
    if (result && (e.code === 'Space' || e.code === 'Enter')) {
      e.preventDefault();
      getNextWord();
      return;
    }

    // Don't trigger shortcuts if we're showing results
    if (result) return;

    // Space bar to play audio
    if (e.code === 'Space' && !e.target.matches('input, textarea')) {
      e.preventDefault(); // Prevent page scroll
      if (audioElement) {
        audioElement.currentTime = 0; // Reset to start
        audioElement.play().catch(console.error);
      }
    }
    
    // Enter to submit when input has content (handled by form submit)
  }, [audioElement, result, getNextWord]);

  // Add keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Load word list details
  useEffect(() => {
    const loadWordList = async () => {
      try {
        const data = await wordListAPI.getWordList(listId);
        setWordList(data);
        await getNextWord();
      } catch (err) {
        setError('Failed to load word list. Please try again later.');
        console.error('Error loading word list:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadWordList();
  }, [listId]);

  // Submit user's spelling attempt
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInput.trim()) {
      return;
    }
    
    try {
      setLoading(true);
      const [practiceResult, similarWordsResult] = await Promise.all([
        practiceAPI.submitPractice(currentWord.word_id, userInput.trim()),
        wordListAPI.getSimilarWords(currentWord.word_id)
      ]);
      setResult(practiceResult);
      setSimilarWords(similarWordsResult.similar_words);
    } catch (err) {
      setError('Failed to submit practice attempt. Please try again.');
      console.error('Error submitting practice:', err);
    } finally {
      setLoading(false);
    }
  };

  // Play audio pronunciation
  const playAudio = () => {
    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
        setError('Failed to play audio. Please try again.');
      });
    }
  };

  // Helper function to highlight mistakes
  const getHighlightedWord = (attempt, correct) => {
    const attemptChars = attempt.toLowerCase().split('');
    const correctChars = correct.toLowerCase().split('');
    let html = '';
    
    // Find the longer word length
    const maxLength = Math.max(attemptChars.length, correctChars.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (i >= attemptChars.length) {
        // Missing characters
        html += `<span class="text-danger text-decoration-underline">${correctChars[i]}</span>`;
      } else if (i >= correctChars.length) {
        // Extra characters
        html += `<span class="text-danger text-decoration-line-through">${attemptChars[i]}</span>`;
      } else if (attemptChars[i] !== correctChars[i]) {
        // Incorrect character
        html += `<span class="text-danger">${attemptChars[i]}</span>`;
      } else {
        // Correct character
        html += attemptChars[i];
      }
    }
    
    return html;
  };

  if (loading && !wordList) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="mb-0">Practice: {wordList?.name}</h2>
                <Form.Check
                  type="switch"
                  id="speed-switch"
                  label="Slow Mode"
                  checked={speed === 'slow'}
                  onChange={(e) => setSpeed(e.target.checked ? 'slow' : 'normal')}
                  className="mb-0"
                />
              </div>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="float-end"
                    onClick={() => setError('')}
                  >
                    Dismiss
                  </Button>
                </Alert>
              )}

              {result ? (
                // Show practice result
                <div className="text-center">
                  <Alert variant={result.correct ? 'success' : 'danger'}>
                    {result.correct ? 'Correct!' : 'Incorrect!'}
                  </Alert>
                  
                  <h3 className="mb-4">
                    {result.correct ? (
                      result.word
                    ) : (
                      <>
                        <div className="mb-2">Your attempt:</div>
                        <div 
                          className="spelling-attempt"
                          dangerouslySetInnerHTML={{ 
                            __html: getHighlightedWord(userInput, result.word) 
                          }} 
                        />
                        <div className="mt-2 text-muted">
                          Correct spelling: {result.word}
                        </div>
                      </>
                    )}
                  </h3>
                  
                  {result.meaning && (
                    <p className="mb-3">
                      <strong>Meaning:</strong> {result.meaning}
                    </p>
                  )}
                  
                  {result.example && (
                    <p className="mb-4">
                      <strong>Example:</strong> {result.example}
                    </p>
                  )}

                  {similarWords.length > 0 && (
                    <div className="mb-4">
                      <h4>Similar Words:</h4>
                      <div className="d-flex flex-wrap justify-content-center gap-2">
                        {similarWords.map((word, index) => (
                          <Badge 
                            key={index} 
                            bg="info" 
                            className="p-2"
                            style={{ fontSize: '1rem' }}
                          >
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={getNextWord}
                      disabled={loading}
                    >
                      Next Word (Press Enter or Space)
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate(`/progress/${listId}`)}
                    >
                      View Progress
                    </Button>
                  </div>
                </div>
              ) : (
                // Show practice interface
                <div>
                  <div className="text-center mb-4">
                    <Button
                      variant="primary"
                      size="lg"
                      className="practice-audio-button"
                      onClick={playAudio}
                      disabled={loading || !audioUrl}
                      title="Click or press Space to play audio"
                    >
                      <i className="fas fa-volume-up fa-3x"></i>
                    </Button>
                    <p className="mt-3">
                      Click or press <kbd>Space</kbd> to hear the word
                    </p>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Control
                        type="text"
                        placeholder="Type the word here and press Enter"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}

                        autoComplete="off"
                        autoFocus
                      />
                    </Form.Group>

                    <div className="d-grid">
                      <Button
                        variant="primary"
                        size="lg"
                        type="submit"
                        disabled={loading || !userInput.trim()}
                      >
                        Submit
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PracticePage;