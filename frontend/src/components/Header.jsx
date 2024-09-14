import { useNavigate } from 'react-router-dom';
import { Badge, Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaListUl, FaAward } from 'react-icons/fa';
import logo from "../assets/logo.png";
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/usersApiSlice.js';
import { logout } from '../slices/authSlice.js';

const Header = () => {
    const { userInfo } = useSelector((state) => state.auth);
        
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [logoutApiCall] = useLogoutMutation();

    const logoutHandler = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            navigate('/login');
        } catch (err) {
            console.log(err);
        }
    }

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
                            <LinkContainer to='/activities'>
                                <Nav.Link><FaListUl /> Actividades</Nav.Link>
                            </LinkContainer>

                            {userInfo ? (                 
                                <NavDropdown title={userInfo.name} id='username'>
                                    <LinkContainer to='/profile'>
                                        <NavDropdown.Item>Perfil</NavDropdown.Item>
                                    </LinkContainer>
                                    <NavDropdown.Item onClick={logoutHandler}>Cerrar Sesión</NavDropdown.Item>
                                </NavDropdown>
                            ) : (
                                <LinkContainer to='/login'>
                                    <Nav.Link><FaUser /> Iniciar Sesión</Nav.Link>
                                </LinkContainer>
                            )}

                            {userInfo && userInfo.isAdmin && (
                                <NavDropdown title="Admin" id='adminmenu'>
                                    <LinkContainer to='/admin/orderlist'>
                                        <NavDropdown.Item>Ayuda</NavDropdown.Item>
                                    </LinkContainer>    
                                    <LinkContainer to='/admin/productlist'>
                                        <NavDropdown.Item>Configuración</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to='/admin/userlist'>
                                        <NavDropdown.Item>Usuarios</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to='/admin/activities'>
                                        <NavDropdown.Item>Actividades (Admin)</NavDropdown.Item>
                                    </LinkContainer>
                                </NavDropdown>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    )
}

export default Header;
