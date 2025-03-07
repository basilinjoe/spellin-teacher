import React, { useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const HomePage = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center mb-5">
        <Col md={8}>
          <h1 className="display-4 mb-4">Welcome to Spelling Teacher</h1>
          <p className="lead">
            Improve your spelling through interactive practice with audio pronunciation
          </p>
          {!currentUser && (
            <div className="mt-4">
              <Link to="/register" className="btn btn-primary btn-lg me-3">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline-primary btn-lg">
                Login
              </Link>
            </div>
          )}
        </Col>
      </Row>

      <Row xs={1} md={2} lg={4} className="g-4 mb-5">
        <Col>
          <Card className="h-100 text-center p-4">
            <Card.Body>
              <i className="fas fa-upload fa-3x mb-3 text-primary"></i>
              <h3>Upload Lists</h3>
              <p>
                Create custom word lists by uploading CSV files with words, meanings,
                and example sentences.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 text-center p-4">
            <Card.Body>
              <i className="fas fa-volume-up fa-3x mb-3 text-primary"></i>
              <h3>Audio Practice</h3>
              <p>
                Listen to word pronunciations and practice spelling them correctly.
                Perfect your spelling through audio-based learning.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 text-center p-4">
            <Card.Body>
              <i className="fas fa-graduation-cap fa-3x mb-3 text-primary"></i>
              <h3>Smart Review</h3>
              <p>
                Our spaced repetition system helps you review words at optimal intervals
                to maximize learning efficiency and retention.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 text-center p-4">
            <Card.Body>
              <i className="fas fa-chart-line fa-3x mb-3 text-primary"></i>
              <h3>Track Progress</h3>
              <p>
                Monitor your improvement with detailed statistics and progress tracking
                for each word and list.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {currentUser && (
        <div className="text-center mt-5">
          <Link to="/word-lists" className="btn btn-primary btn-lg me-3">
            Go to Word Lists
          </Link>
          <Link to="/review" className="btn btn-outline-primary btn-lg">
            Start Review
          </Link>
        </div>
      )}

      <footer className="text-center mt-5 pt-5 text-muted">
        <p>
          Start improving your spelling today with our interactive audio-based
          learning system powered by spaced repetition technology.
        </p>
      </footer>
    </Container>
  );
};

export default HomePage;