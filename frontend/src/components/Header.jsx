// Header.jsx
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import {
  FaUser,
  FaListUl,
  FaComments,
} from "react-icons/fa";
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
              {/* Menú desplegable */}
              <button className="menu-item" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>
                {/* SVG Icon for Public Profile */}
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#7D8590" d="M1.5 13v1a.5.5 0 0 0 .338.473 18.97 18.97 0 0 0 6.162 1.027 18.963 18.963 0 0 0 6.162-1.027A.5.5 0 0 0 14.5 14v-1a6.508 6.508 0 0 0-4.461-6.168 3.5 3.5 0 1 0-4.078 0A6.508 6.508 0 0 0 1.5 13zM5.5 4a2.5 2.5 0 1 1 2.5 2.5A2.5 2.5 0 0 1 5.5 4zm2.5 3.5a5.507 5.507 0 0 1 5.5 5.5v.639a18.08 18.08 0 0 1-11 0V13A5.507 5.507 0 0 1 8 7.5z" />
                </svg>
                Public profile
              </button>
              <button className="menu-item" onClick={() => { navigate('/account'); setIsMenuOpen(false); }}>
                {/* SVG Icon for Account */}
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#7D8590" d="M17.074 30h-2.148c-1.038 0-1.914-.811-1.994-1.846l-.125-1.635c-.687-.208-1.351-.484-1.985-.824l-1.246 1.067c-.788.677-1.98.631-2.715-.104l-1.52-1.52c-.734-.734-.78-1.927-.104-2.715l1.067-1.246c-.34-.635-.616-1.299-.824-1.985l-1.634-.125c-1.035-.079-1.846-.955-1.846-1.993v-2.148c0-1.038.811-1.914 1.846-1.994l1.635-.125c.208-.687.484-1.351.824-1.985l-1.068-1.247c-.676-.788-.631-1.98.104-2.715l1.52-1.52c.734-.734 1.927-.779 2.715-.104l1.246 1.067c.635-.34 1.299-.616 1.985-.824l.125-1.634c.08-1.034.956-1.845 1.994-1.845h2.148c1.038 0 1.914.811 1.994 1.846l.125 1.635c.687.208 1.351.484 1.985.824l1.246-1.067c.787-.676 1.98-.631 2.715.104l1.52 1.52c.734.734.78 1.927.104 2.715l-1.067 1.246c.34.635.616 1.299.824 1.985l1.634.125c1.035.079 1.846.955 1.846 1.993v2.148c0 1.038-.811 1.914-1.846 1.994l-1.635.125c-.208.687-.484 1.351-.824 1.985l1.067 1.246c.677.788.631 1.98-.104 2.715l-1.52 1.52c-.734.734-1.928.78-2.715.104l-1.246-1.067c-.635.34-1.299.616-1.985.824l-.125 1.634c-.079 1.035-.955 1.846-1.993 1.846zM11.239 23.627c.848.53 1.768.912 2.734 1.135.426.099.739.462.772.898l.18 2.341h2.149l.18-2.34c.033-.437.347-.8.772-.898.967-.223 1.887-.604 2.734-1.135.371-.232.849-.197 1.181.089l1.784 1.529 1.52-1.52-1.529-1.784c-.285-.332-.321-.811-.089-1.181.53-.848.912-1.768 1.135-2.734.099-.426.462-.739.898-.772l2.341-.18v-2.148l-2.34-.18c-.437-.033-.8-.347-.898-.772-.223-.967-.604-1.887-1.135-2.734-.232-.37-.196-.849.089-1.181l1.529-1.784-1.52-1.52-1.784 1.529c-.332.286-.81.321-1.181.089-.848-.53-1.768-.912-2.734-1.135-.426-.099-.739-.462-.772-.898l-.18-2.341h-2.148l-.18 2.34c-.033.437-.347.8-.772.898-.967.223-1.887.604-2.734 1.135-.37.232-.849.197-1.181-.089l-1.785-1.529-1.52 1.52 1.529 1.784c.285.332.321.811.089 1.181-.53.848-.912 1.768-1.135 2.734-.099.426-.462.739-.898.772l-2.341.18v2.148l2.34.18c.437.033.8.347.898.772.223.967.604 1.887 1.135 2.734.232.37.196.849-.089 1.181l-1.529 1.784 1.52 1.52 1.784-1.529c.332-.287.813-.32 1.18-.089z" />
                  <path fill="#7D8590" d="M16 23c-3.859 0-7-3.141-7-7s3.141-7 7-7 7 3.141 7 7-3.141 7-7 7zm0-12c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                </svg>
                Account
              </button>
              <button className="menu-item" onClick={() => { navigate('/appearance'); setIsMenuOpen(false); }}>
                {/* SVG Icon for Appearance */}
                <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#7D8590" d="M109.9 20.63a6.232 6.232 0 0 0 -8.588-.22l-57.463 51.843c-.012.011-.02.024-.031.035s-.023.017-.034.027l-4.721 4.722a1.749 1.749 0 0 0 0 2.475l.341.342-3.16 3.16a8 8 0 0 0 -1.424 1.967 11.382 11.382 0 0 0 -12.055 10.609c-.006.036-.011.074-.015.111a5.763 5.763 0 0 1 -4.928 5.41 1.75 1.75 0 0 0 -.844 3.14c4.844 3.619 9.4 4.915 13.338 4.915a17.14 17.14 0 0 0 11.738-4.545l.182-.167a11.354 11.354 0 0 0 3.348-8.081c0-.225-.02-.445-.032-.667a8.041 8.041 0 0 0 1.962-1.421l3.16-3.161.342.342a1.749 1.749 0 0 0 2.475 0l4.722-4.722c.011-.011.018-.025.029-.036s.023-.018.033-.029l51.844-57.46a6.236 6.236 0 0 0 -.219-8.589zm-70.1 81.311-.122.111c-.808.787-7.667 6.974-17.826 1.221a9.166 9.166 0 0 0 4.36-7.036 1.758 1.758 0 0 0 .036-.273 7.892 7.892 0 0 1 9.122-7.414c.017.005.031.014.048.019a1.717 1.717 0 0 0 .379.055 7.918 7.918 0 0 1 4 13.317zm5.239-10.131c-.093.093-.194.176-.293.26a11.459 11.459 0 0 0 -6.289-6.286c.084-.1.167-.2.261-.3l3.161-3.161 6.321 6.326zm7.214-4.057-9.479-9.479 2.247-2.247 9.479 9.479zm55.267-60.879-50.61 56.092-9.348-9.348 56.092-50.61a2.737 2.737 0 0 1 3.866 3.866z" />
                </svg>
                Appearance
              </button>
              <button className="menu-item" onClick={() => { navigate('/accessibility'); setIsMenuOpen(false); }}>
                {/* SVG Icon for Accessibility */}
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <g transform="translate(-33.022 -30.617)">
                    <path fill="#7D8590" d="M49.021 31.617c-2.673 0-4.861 2.188-4.861 4.861 0 1.606.798 3.081 1.873 3.834h-7.896c-1.7 0-3.098 1.401-3.098 3.1s1.399 3.098 3.098 3.098h4.377l.223 2.641s-1.764 8.565-1.764 8.566c-.438 1.642.55 3.355 2.191 3.795s3.327-.494 3.799-2.191l2.059-5.189 2.059 5.189c.44 1.643 2.157 2.631 3.799 2.191s2.63-2.153 2.191-3.795l-1.764-8.566.223-2.641h4.377c1.699 0 3.098-1.399 3.098-3.098s-1.397-3.1-3.098-3.1h-7.928c1.102-.771 1.904-2.228 1.904-3.834 0-2.672-2.189-4.861-4.862-4.861zm0 2c1.592 0 2.861 1.27 2.861 2.861 0 1.169-.705 2.214-1.789 2.652-.501.203-.75.767-.563 1.273l.463 1.254c.145.393.519.654.938.654h8.975c.626 0 1.098.473 1.098 1.1s-.471 1.098-1.098 1.098h-5.297c-.52 0-.952.398-.996.916l-.311 3.701c-.008.096-.002.191.018.285 0 0 1.813 8.802 1.816 8.82.162.604-.173 1.186-.777 1.348s-1.184-.173-1.346-.777c-.01-.037-3.063-7.76-3.063-7.76-.334-.842-1.525-.842-1.859 0 0 0-3.052 7.723-3.063 7.76-.162.604-.741.939-1.346.777s-.939-.743-.777-1.348c.004-.019 1.816-8.82 1.816-8.82.02-.094.025-.189.018-.285l-.311-3.701c-.044-.518-.477-.916-.996-.916h-5.297c-.627 0-1.098-.471-1.098-1.098s.472-1.1 1.098-1.1h8.975c.419 0 .793-.262.938-.654l.463-1.254c.188-.507-.062-1.07-.563-1.273-1.084-.438-1.789-1.483-1.789-2.652.001-1.591 1.271-2.861 2.862-2.861z" />
                  </g>
                </svg>
                Accessibility
              </button>
              <button className="menu-item" onClick={() => { navigate('/notifications'); setIsMenuOpen(false); }}>
                {/* SVG Icon for Notifications */}
                <svg fill="none" viewBox="0 0 24 25" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#7D8590" fillRule="evenodd" clipRule="evenodd" d="M11.957 4.312c-3.354 0-6.009 2.597-6.009 5.677v3.29c0 .199-.059.393-.17.558l-1.625 2.42-.011.016c-.187.267-.167.511-.07.687.1.183.32.353.673.353h14.526c.255 0 .501-.152.639-.397.132-.234.112-.448-.011-.61l-1.727-2.42c-.121-.17-.186-.373-.186-.581V9.99c0-1.546-.685-3.023-1.707-4.005-1.162-1.016-2.654-1.673-4.302-1.673zm-8.009 5.677c0-4.275 3.643-7.677 8.009-7.677 2.206 0 4.161.886 5.638 2.185.01.009.02.018.03.027 1.408 1.341 2.342 3.341 2.342 5.466v2.97l1.533 2.147c.677.9.605 1.986.155 2.788-.446.795-1.317 1.418-2.383 1.418H3.431c-2.162 0-3.551-2.302-2.247-4.178l1.451-2.159zm4.052 11.323c0-.552.448-1 1-1h6c.552 0 1 .448 1 1s-.448 1-1 1h-6c-.552 0-1-.448-1-1z" />
                </svg>
                Notifications
              </button>
            </div>
          </div>

          {/* Logo de la Clínica */}
          <LinkContainer to="/">
            <Navbar.Brand className="d-flex align-items-center">
              <img src={logo} alt="Seguimiento" height="40" />
              <span className="ms-2">Clínica del Cerebro</span>
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-auto" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {/* Enlaces del menú de navegación */}
              <LinkContainer to="/activities">
                <Nav.Link>
                  <FaListUl /> Actividades
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/activitiesL2">
                <Nav.Link>
                  <FaListUl /> Actividades 2
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/activitiesL3">
                <Nav.Link>
                  <FaListUl /> Actividades 3
                </Nav.Link>
              </LinkContainer>

              <LinkContainer to="/chat">
                <Nav.Link>
                  <FaComments /> Chat
                </Nav.Link>
              </LinkContainer>

              {/* Otros enlaces y menús */}
              {userInfo ? (
                <NavDropdown title={userInfo.name} id="username">
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Perfil</NavDropdown.Item>
                  </LinkContainer>
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
                  <LinkContainer to="/admin/orderlist">
                    <NavDropdown.Item>Ayuda</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/productlist">
                    <NavDropdown.Item>Configuración</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/userlist">
                    <NavDropdown.Item>Usuarios</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/activities">
                    <NavDropdown.Item>Actividades (Admin)</NavDropdown.Item>
                  </LinkContainer>
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
