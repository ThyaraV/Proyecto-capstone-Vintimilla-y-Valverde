import {Navbar, Nav, Container} from 'react-bootstrap'
import {FaUser} from 'react-icons/fa';

const Header = () => {
  return (
    <header>
        <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
            <Container>
                <Navbar.Brand href="/">Clínica HIGEA</Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar.nav'></Navbar.Toggle>
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