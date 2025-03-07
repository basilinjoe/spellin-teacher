import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { reviewAPI } from '../services/api';

const ReviewPage = () => {
  const navigate = useNavigate();
  const [reviewWords, setReviewWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [audioElement, setAudioElement] = useState(null);
  const [stats, setStats] = useState(null);

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

  // Load review words and stats
  const loadReviewData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [reviewData, statsData] = await Promise.all([
        reviewAPI.getReviewWords(),
        reviewAPI.getStats()
      ]);
      
      setReviewWords(reviewData);
      setStats(statsData);
      
      if (reviewData.length > 0 && !currentWord) {
        const word = reviewData[0];
        setCurrentWord(word);
        setAudioUrl(process.env.REACT_APP_API_URL.slice(0,-1) + word.audio_url);
      }
    } catch (err) {
      setError('Failed to load review data. Please try again later.');
      console.error('Error loading review data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWord]);

  useEffect(() => {
    loadReviewData();
  }, [loadReviewData]);

  // Auto-play audio when URL changes
  useEffect(() => {
    if (audioUrl && audioElement) {
      audioElement.src = audioUrl;
      audioElement.play().catch(error => {
        console.error('Error auto-playing audio:', error);
        setError('Failed to auto-play audio. Click the speaker icon to try again.');
      });
    }
  }, [audioUrl, audioElement]);

  // Submit review attempt
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    try {
      setLoading(true);
      const result = await reviewAPI.submitReview(currentWord.word_id, userInput.trim());
      setResult(result);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  };

  // Move to next word
  const handleNext = async () => {
    const nextWord = reviewWords[reviewWords.indexOf(currentWord) + 1];
    if (nextWord) {
      setCurrentWord(nextWord);
      setAudioUrl(process.env.REACT_APP_API_URL.slice(0,-1) + nextWord.audio_url);
      setUserInput('');
      setResult(null);
    } else {
      // Refresh the review list if we're at the end
      await loadReviewData();
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

  if (loading && !stats) {
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
      {/* Stats Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Review Progress</h5>
              <Row xs={1} md={4} className="g-4">
                <Col>
                  <div className="text-center">
                    <h3>{stats?.total_words || 0}</h3>
                    <p className="text-muted mb-0">Total Words</p>
                  </div>
                </Col>
                <Col>
                  <div className="text-center">
                    <h3>{stats?.total_due || 0}</h3>
                    <p className="text-muted mb-0">Due for Review</p>
                  </div>
                </Col>
                <Col>
                  <div>
                    <p className="mb-1">SRS Levels</p>
                    <ProgressBar>
                      {[0, 1, 2, 3, 4, 5].map(level => (
                        <ProgressBar
                          key={level}
                          variant={level === 5 ? 'success' : 'primary'}
                          now={(stats?.level_counts[level] || 0) / (stats?.total_words || 1) * 100}
                        />
                      ))}
                    </ProgressBar>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Review Section */}
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h2 className="mb-0">Review Words</h2>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {reviewWords.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                  <h3>All Caught Up!</h3>
                  <p className="text-muted">No words due for review right now.</p>
                </div>
              ) : currentWord && (
                <>
                  {result ? (
                    // Show review result
                    <div className="text-center">
                      <Alert variant={result.correct ? 'success' : 'danger'}>
                        {result.correct ? 'Correct!' : 'Incorrect!'}
                      </Alert>
                      
                      <h3 className="mb-4">
                        {result.word}
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
                      
                      <div className="d-grid gap-2">
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={handleNext}
                          disabled={loading}
                        >
                          {reviewWords.indexOf(currentWord) < reviewWords.length - 1 
                            ? 'Next Word'
                            : 'Finish Review'
                          }
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Show review interface
                    <div>
                      <div className="text-center mb-4">
                        <Button
                          variant="primary"
                          size="lg"
                          className="practice-audio-button"
                          onClick={playAudio}
                          disabled={loading || !audioUrl}
                        >
                          <i className="fas fa-volume-up fa-3x"></i>
                        </Button>
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
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReviewPage;