import {Navbar, Nav, Container} from 'react-bootstrap'
import {FaUser} from 'react-icons/fa';
import logo from '../assets/logo2.png'
import {LinkContainer} from 'react-router-bootstrap';


const Header = () => {
  return (
    <header>
        <Navbar variant="dark" expand="lg" collapseOnSelect>
            <Container>
                <LinkContainer to="/">
                    <Navbar.Brand>
                        <img src={logo} alt='Seguimiento'></img>
                        Clínica del Cerebro
                    </Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls='basic-navbar-nav'></Navbar.Toggle>
                <Navbar.Collapse id='basic-navbar-nav'>
                <Nav className='ms-auto'>
                <LinkContainer to="/login">
                    <Nav.Link >
                        <FaUser/>Iniciar Sesión
                    </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/registrarse">
                    <Nav.Link >
                        <FaUser/>Registrarse
                    </Nav.Link>
                </LinkContainer>     
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </header>
  )
}

export default Header