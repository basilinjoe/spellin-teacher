import React, { useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { WelcomeFeatureCard } from '../components';

const HomePage: React.FC = () => {
  const auth = useContext(AuthContext);
  const currentUser = auth?.currentUser;

  const features = [
    {
      icon: 'fas fa-upload',
      title: 'Upload Lists',
      description: 'Create custom word lists by uploading CSV files with words, meanings, and example sentences.'
    },
    {
      icon: 'fas fa-volume-up',
      title: 'Audio Practice',
      description: 'Listen to word pronunciations and practice spelling them correctly. Perfect your spelling through audio-based learning.'
    },
    {
      icon: 'fas fa-graduation-cap',
      title: 'Smart Review',
      description: 'Our spaced repetition system helps you review words at optimal intervals to maximize learning efficiency and retention.'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Track Progress',
      description: 'Monitor your improvement with detailed statistics and progress tracking for each word and list.'
    }
  ];

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
        {features.map((feature, index) => (
          <Col key={index}>
            <WelcomeFeatureCard {...feature} />
          </Col>
        ))}
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