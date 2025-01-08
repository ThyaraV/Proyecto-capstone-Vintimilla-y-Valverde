// src/screens/Reports/UserListScreen.jsx

import React, { useState } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import {
  Table,
  Button,
  ButtonGroup,
  InputGroup,
  FormControl,
  Modal,
  Tooltip,
  OverlayTrigger,
  Container,
  Row,
  Col,
} from 'react-bootstrap';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useEnableUserMutation,
} from '../../slices/usersApiSlice';

const UserListScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: users = [], isLoading, error, refetch } = useGetUsersQuery();
  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();
  const [enableUser] = useEnableUserMutation();

  // Estado para manejar el modal de confirmación
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});

  // Maneja la apertura del modal con el contenido adecuado
  const handleShowModal = (action, user) => {
    setModalContent({ action, user });
    setShowModal(true);
  };

  // Maneja el cierre del modal
  const handleCloseModal = () => {
    setShowModal(false);
    setModalContent({});
  };

  // Maneja la deshabilitación de usuarios
  const deleteHandler = async () => {
    const { user } = modalContent;
    try {
      await deleteUser(user._id);
      toast.success('Usuario deshabilitado correctamente');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Ha ocurrido un error');
    }
    handleCloseModal();
  };

  // Maneja la habilitación de usuarios
  const enableUserHandler = async () => {
    const { user } = modalContent;
    try {
      await enableUser(user._id);
      toast.success('Usuario habilitado correctamente');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Ha ocurrido un error');
    }
    handleCloseModal();
  };

  // Filtra los usuarios según el término de búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Renderiza el contenido del modal según la acción
  const renderModalBody = () => {
    const { action, user } = modalContent;
    if (!action || !user) return null;

    return (
      <>
        <p>
          {action === 'disable'
            ? '¿Estás seguro de que deseas deshabilitar este usuario?'
            : '¿Estás seguro de que deseas habilitar este usuario?'}
        </p>
        <p>
          <strong>{user.name}</strong> ({user.email})
        </p>
      </>
    );
  };

  // Tooltip para los botones
  const renderTooltip = (props, text) => (
    <Tooltip id="button-tooltip" {...props}>
      {text}
    </Tooltip>
  );

  return (
    <Container fluid style={{ padding: '2rem' }}>
      <Row className="mb-4">
        <Col>
          <h1>Usuarios</h1>
        </Col>
      </Row>

      {/* Campo de Búsqueda Mejorado */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text id="search-icon">
              <FaSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Buscar usuarios..."
              aria-label="Buscar usuarios"
              aria-describedby="search-icon"
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
        </Col>
      </Row>

      {loadingDelete && (
        <Row className="mb-4">
          <Col>
            <Loader />
          </Col>
        </Row>
      )}

      {isLoading ? (
        <Row>
          <Col>
            <Loader />
          </Col>
        </Row>
      ) : error ? (
        <Row>
          <Col>
            <Message variant="danger">{error.message || 'Ha ocurrido un error'}</Message>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col>
            <Table striped bordered hover responsive className="table-sm text-center">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th>ID</th>
                  <th>NOMBRE</th>
                  <th>EMAIL</th>
                  <th>ADMIN</th>
                  <th>ACTIVO</th>
                  <th>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user._id}</td>
                      <td>{user.name}</td>
                      <td>
                        <a href={`mailto:${user.email}`} style={{ textDecoration: 'none', color: '#0d6efd' }}>
                          {user.email}
                        </a>
                      </td>
                      <td>
                        {user.isAdmin ? (
                          <FaCheck style={{ color: 'green', fontSize: '1.2rem' }} />
                        ) : (
                          <FaTimes style={{ color: 'red', fontSize: '1.2rem' }} />
                        )}
                      </td>
                      <td>
                        {user.isActive ? (
                          <FaCheck style={{ color: 'green', fontSize: '1.2rem' }} />
                        ) : (
                          <FaTimes style={{ color: 'red', fontSize: '1.2rem' }} />
                        )}
                      </td>
                      <td>
                        <ButtonGroup>
                          {/* Botón de Editar */}
                          <OverlayTrigger
                            placement="top"
                            delay={{ show: 250, hide: 400 }}
                            overlay={(props) => renderTooltip(props, 'Editar Usuario')}
                          >
                            <LinkContainer to={`/admin/user/${user._id}/edit`}>
                              <Button variant="primary" size="sm" className="me-2">
                                <FaEdit /> Editar
                              </Button>
                            </LinkContainer>
                          </OverlayTrigger>

                          {/* Botón de Habilitar/Deshabilitar */}
                          <OverlayTrigger
                            placement="top"
                            delay={{ show: 250, hide: 400 }}
                            overlay={(props) =>
                              renderTooltip(
                                props,
                                user.isActive ? 'Deshabilitar Usuario' : 'Habilitar Usuario'
                              )
                            }
                          >
                            <Button
                              variant={user.isActive ? 'danger' : 'success'}
                              size="sm"
                              onClick={() =>
                                handleShowModal(user.isActive ? 'disable' : 'enable', user)
                              }
                            >
                              {user.isActive ? <FaTrash /> : <FaCheck />} {user.isActive ? 'Deshabilitar' : 'Habilitar'}
                            </Button>
                          </OverlayTrigger>
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <Message variant="info">No se encontraron usuarios.</Message>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      )}

      {/* Modal de Confirmación */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalContent.action === 'disable' ? 'Deshabilitar Usuario' : 'Habilitar Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderModalBody()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          {modalContent.action === 'disable' ? (
            <Button variant="danger" onClick={deleteHandler}>
              Deshabilitar
            </Button>
          ) : (
            <Button variant="success" onClick={enableUserHandler}>
              Habilitar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserListScreen;
