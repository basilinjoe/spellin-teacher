import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { reviewAPI } from '../services/api';

const SRSStatusCard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await reviewAPI.getStats();
        setStats(data);
      } catch (err) {
        console.error('Error loading SRS stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <Card className="loading-pulse mb-4">
        <Card.Body>
          <div className="placeholder-glow">
            <span className="placeholder col-6"></span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={8}>
            <h5 className="mb-3">Learning Progress</h5>
            <ProgressBar className="mb-2">
              {[0, 1, 2, 3, 4, 5].map(level => (
                <ProgressBar
                  key={level}
                  variant={level === 5 ? 'success' : 'primary'}
                  now={(stats.level_counts[level] || 0) / (stats.total_words || 1) * 100}
                  label={`${stats.level_counts[level] || 0}`}
                />
              ))}
            </ProgressBar>
            <small className="text-muted">
              Words by SRS level (0-5)
            </small>
          </Col>
          <Col md={4} className="text-center text-md-end mt-3 mt-md-0">
            <div className="mb-2">
              <strong className="h4">{stats.total_due}</strong> words
              <br />
              due for review
            </div>
            <Link to="/review" className="btn btn-primary">
              Start Review
            </Link>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default SRSStatusCard;