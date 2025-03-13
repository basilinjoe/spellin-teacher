import React from 'react';
import { Card } from 'react-bootstrap';

interface WelcomeFeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const WelcomeFeatureCard: React.FC<WelcomeFeatureCardProps> = ({
  icon,
  title,
  description
}) => {
  return (
    <Card className="h-100 text-center p-4">
      <Card.Body>
        <i className={`${icon} fa-3x mb-3 text-primary`}></i>
        <h3>{title}</h3>
        <p>{description}</p>
      </Card.Body>
    </Card>
  );
};

export default WelcomeFeatureCard;