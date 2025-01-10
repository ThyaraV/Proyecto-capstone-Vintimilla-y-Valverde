// src/components/Header.js
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { FaUser, FaComments, FaBrain, FaBars, FaBell, FaTachometerAlt, FaRegChartBar } from "react-icons/fa"; // Importar FaTachometerAlt, FaRegChartBar
import logo from "../assets/logoHigeasinfondo.png";
import { LinkContainer } from "react-router-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";
import '../assets/styles/Header.css';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Maneja el cierre de sesión
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

  const navigateTo = (path, option) => {
    setSelectedOption(option);
    if (userInfo) {
      navigate(path);
    } else {
      navigate("/login");
    }
    setIsMenuOpen(false);
  };

  return (
    <header>
      {/* Navbar principal */}
      <Navbar variant="dark" expand="lg" collapseOnSelect>
        <Container>
          {/* Botón para abrir el menú lateral */}
          <button className="menu-toggle-btn" onClick={handleMenuToggle}>
            <FaBars size={24} />
          </button>

          {/* Marca y logo */}
          <Navbar.Brand className="d-flex align-items-center" onClick={() => navigateTo('/')}>
            <img src={logo} alt="Seguimiento" height="70" />
          </Navbar.Brand>

          {/* Menú de navegación principal */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-auto" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {/* Enlace a Actividades */}
              <Nav.Link onClick={() => navigateTo('/api/treatments/activities', 'actividades')}>
                <FaBrain /> Actividades
              </Nav.Link>

              {/* Enlace a MoCA */}
              <Nav.Link onClick={() => navigateTo('/mocaPanel', 'moca')}>
                <FaBrain /> MoCA
              </Nav.Link>

              {/* Enlace al chat */}
              <Nav.Link onClick={() => navigateTo('/chat', 'chat')}>
                <FaComments /> Chat
              </Nav.Link>

              {/* Enlace de usuario y opciones de administración */}
              {userInfo ? (
                <NavDropdown title={userInfo.name} id="username">
                  <NavDropdown.Item onClick={logoutHandler}>Cerrar Sesión</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <FaUser /> Iniciar Sesión
                  </Nav.Link>
                </LinkContainer>
              )}

              {/* Opciones del administrador */}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown title="Admin" id="adminmenu">
                  <NavDropdown.Item onClick={() => navigateTo('/admin/orderlist', 'orderlist')}>Ayuda</NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigateTo('/admin/productlist', 'productlist')}>Configuración</NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigateTo('/admin/userlist', 'userlist')}>Usuarios</NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigateTo('/admin/activities', 'adminActivities')}>Actividades (Admin)</NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Menú lateral */}
      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={handleMenuToggle}>×</button>
        <div className="menu-title">Menu</div>
        <nav className="sidebar-menu">
          <button className={selectedOption === 'profile' ? 'active' : ''} onClick={() => navigateTo('/profile', 'profile')}>
            <FaUser /> Perfil Público
          </button>
          <button className={selectedOption === 'config' ? 'active' : ''} onClick={() => navigateTo('/admin/configuration', 'config')}>
            <FaRegChartBar /> Configuración
          </button>
          <button className={selectedOption === 'reports' ? 'active' : ''} onClick={() => navigateTo('/reports', 'reports')}>
            <FaRegChartBar /> Reportes
          </button>
          <button className={selectedOption === 'activities' ? 'active' : ''} onClick={() => navigateTo('/activities', 'activities')}>
            <FaBrain /> Actividades
          </button>
          <button className={selectedOption === 'dashboard' ? 'active' : ''} onClick={() => navigateTo('/dashboard', 'dashboard')}>
            <FaTachometerAlt /> Dashboard
          </button>
          <button className={selectedOption === 'notifications' ? 'active' : ''} onClick={() => navigateTo('/notifications', 'notifications')}>
            <FaBell /> Notificaciones
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
