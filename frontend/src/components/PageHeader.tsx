import React from 'react';
import { Row, Col } from 'react-bootstrap';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className = ''
}) => {
  return (
    <Row className={`mb-4 ${className}`}>
      <Col>
        <h1>{title}</h1>
        {description && (
          <p className="text-muted">{description}</p>
        )}
      </Col>
      {actions && (
        <Col xs="auto">
          {actions}
        </Col>
      )}
    </Row>
  );
};

export default PageHeader;