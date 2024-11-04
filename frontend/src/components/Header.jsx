import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { FaUser, FaListUl, FaComments } from "react-icons/fa";
import logo from "../assets/logo.png";
import { LinkContainer } from "react-router-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../slices/usersApiSlice.js";
import { logout } from "../slices/authSlice.js";
import '../assets/styles/Header.css';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Verificar autenticación antes de navegar
  const navigateTo = (path) => {
    if (userInfo) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <header>
      <Navbar variant="dark" expand="lg" collapseOnSelect>
        <Container className="d-flex align-items-center">
          {/* Menú personalizado al extremo izquierdo */}
          <div className={`menu-container ${isMenuOpen ? 'open' : ''}`}>
            <button className="btn" onClick={handleMenuToggle}>
              <span className="icon">
                <svg viewBox="0 0 175 80" width="25" height="25">
                  <rect width="80" height="15" fill="#f0f0f0" rx="10"></rect>
                  <rect y="30" width="80" height="15" fill="#f0f0f0" rx="10"></rect>
                  <rect y="60" width="80" height="15" fill="#f0f0f0" rx="10"></rect>
                </svg>
              </span>
              <span className="text">MENU</span>
            </button>
            <div className="menu-content">
              <button className="menu-item" onClick={() => { navigateTo('/profile'); setIsMenuOpen(false); }}>
                Public profile
              </button>
              <button className="menu-item" onClick={() => { navigateTo('/admin/configuration'); setIsMenuOpen(false); }}>
                Configuration
              </button>
              <button className="menu-item" onClick={() => { navigateTo('/appearance'); setIsMenuOpen(false); }}>
                Appearance
              </button>
              <button className="menu-item" onClick={() => { navigateTo('/accessibility'); setIsMenuOpen(false); }}>
                Accessibility
              </button>
              <button className="menu-item" onClick={() => { navigateTo('/notifications'); setIsMenuOpen(false); }}>
                Notifications
              </button>
            </div>
          </div>

          {/* Logo de la Clínica */}
          <Navbar.Brand className="d-flex align-items-center" onClick={() => navigateTo('/')}>
            <img src={logo} alt="Seguimiento" height="40" />
            <span className="ms-2">Clínica del Cerebro</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-auto" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {/* Enlaces del menú de navegación */}
              <Nav.Link onClick={() => navigateTo('/activities')}>
                <FaListUl /> Actividades
              </Nav.Link>
              <Nav.Link onClick={() => navigateTo('/activitiesL2')}>
                <FaListUl /> Actividades 2
              </Nav.Link>
              <Nav.Link onClick={() => navigateTo('/activitiesL3')}>
                <FaListUl /> Actividades 3
              </Nav.Link>

              <Nav.Link onClick={() => navigateTo('/chat')}>
                <FaComments /> Chat
              </Nav.Link>

              {/* Otros enlaces y menús */}
              {userInfo ? (
                <NavDropdown title={userInfo.name} id="username">
                  <NavDropdown.Item onClick={logoutHandler}>
                    Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <FaUser /> Iniciar Sesión
                  </Nav.Link>
                </LinkContainer>
              )}

              {userInfo && userInfo.isAdmin && (
                <NavDropdown title="Admin" id="adminmenu">
                  <NavDropdown.Item onClick={() => navigateTo('/admin/orderlist')}>
                    Ayuda
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigateTo('/admin/productlist')}>
                    Configuración
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigateTo('/admin/userlist')}>
                    Usuarios
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigateTo('/admin/activities')}>
                    Actividades (Admin)
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
