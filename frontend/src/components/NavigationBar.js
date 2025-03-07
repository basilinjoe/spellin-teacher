import React, { useContext } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const NavigationBar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="fas fa-spell-check me-2"></i>
          Spelling Teacher
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser && (
              <>
                <Nav.Link as={Link} to="/word-lists">
                  <i className="fas fa-list me-1"></i>
                  Word Lists
                </Nav.Link>
                <Nav.Link as={Link} to="/upload">
                  <i className="fas fa-upload me-1"></i>
                  Upload List
                </Nav.Link>
                <Nav.Link as={Link} to="/review">
                  <i className="fas fa-graduation-cap me-1"></i>
                  Review
                </Nav.Link>
                <Nav.Link as={Link} to="/mistake-patterns">
                  <i className="fas fa-exclamation-triangle me-1"></i>
                  Mistake Patterns
                </Nav.Link>
                <Nav.Link as={Link} to="/audio-generation">
                  <i className="fas fa-volume-up me-1"></i>
                  Generate Audio
                </Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {currentUser ? (
              <>
                <Nav.Item className="d-flex align-items-center me-3">
                  <i className="fas fa-user me-2"></i>
                  {currentUser.email}
                </Nav.Item>
                <Nav.Link onClick={handleLogout}>
                  Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;