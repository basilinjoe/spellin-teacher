import React, { useContext } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const SideNav: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();

  if (!currentUser) return null;

  return (
    <Nav className="flex-column sidebar bg-light p-3">
      <Nav.Link 
        as={Link} 
        to="/word-lists"
        className={location.pathname === '/word-lists' ? 'active' : ''}
      >
        <i className="fas fa-list me-2"></i>
        Word Lists
      </Nav.Link>
      <Nav.Link 
        as={Link} 
        to="/upload"
        className={location.pathname === '/upload' ? 'active' : ''}
      >
        <i className="fas fa-upload me-2"></i>
        Upload List
      </Nav.Link>
      <Nav.Link 
        as={Link} 
        to="/review"
        className={location.pathname === '/review' ? 'active' : ''}
      >
        <i className="fas fa-graduation-cap me-2"></i>
        Review
      </Nav.Link>
      <Nav.Link 
        as={Link} 
        to="/mistake-patterns"
        className={location.pathname === '/mistake-patterns' ? 'active' : ''}
      >
        <i className="fas fa-exclamation-triangle me-2"></i>
        Mistake Patterns
      </Nav.Link>
      <Nav.Link 
        as={Link} 
        to="/audio-generation"
        className={location.pathname === '/audio-generation' ? 'active' : ''}
      >
        <i className="fas fa-volume-up me-2"></i>
        Generate Audio
      </Nav.Link>
    </Nav>
  );
};

export default SideNav;