import React from 'react';
import { Card } from 'react-bootstrap';

interface StatsCardProps {
  value: string | number;
  label: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ value, label, className = '' }) => {
  return (
    <Card className={`stats-card h-100 ${className}`}>
      <Card.Body>
        <h2>{value}</h2>
        <p className="text-muted mb-0">{label}</p>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;