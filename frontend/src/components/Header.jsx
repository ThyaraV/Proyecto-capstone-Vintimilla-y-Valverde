import {Navbar, Nav, Container} from 'react-bootstrap'
import {FaUser} from 'react-icons/fa';
import logo from '../assets/logo2.png'
const Header = () => {
  return (
    <header>
        <Navbar variant="dark" expand="lg" collapseOnSelect>
            <Container>
                <Navbar.Brand href="/">
                <img src={logo} alt='Seguimiento'></img>
                Clínica del cerebro
                </Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar-nav'></Navbar.Toggle>
                <Navbar.Collapse id='basic-navbar-nav'>
                <Nav className='ms-auto'>
                    <Nav.Link href="/login">
                        <FaUser/>Iniciar Sesión
                    </Nav.Link>
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </header>
  )
}

export default Header