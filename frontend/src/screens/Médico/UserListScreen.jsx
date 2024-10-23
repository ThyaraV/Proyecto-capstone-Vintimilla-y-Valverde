import React, { useState } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { useGetUsersQuery, useDeleteUserMutation } from '../../slices/usersApiSlice';

const UserListScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: users = [], isLoading, error, refetch } = useGetUsersQuery();
  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas deshabilitar este usuario?')) {
      try {
        await deleteUser(id); // Cambiará el estado de isActive a false
        toast.success('Usuario deshabilitado correctamente');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || (typeof err.error === 'object' ? JSON.stringify(err.error) : err.error));
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrado de usuarios
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para habilitar un usuario
  const enableUserHandler = async (id) => {
    toast.success('Usuario habilitado correctamente');
    refetch();
  };

  return (
    <>
      <h1>Usuarios</h1>
      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error.message || 'Ha ocurrido un error'}</Message>
      ) : (
        <>
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={handleSearch}
            style={{ marginBottom: '20px', padding: '5px', width: '300px' }}
          />
          <Table striped hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>NOMBRE</th>
                <th>EMAIL</th>
                <th>ADMIN</th>
                <th>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.name}</td>
                    <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                    <td>
                      {user.isAdmin ? (
                        <FaCheck style={{ color: 'green' }} />
                      ) : (
                        <FaTimes style={{ color: 'red' }} />
                      )}
                    </td>
                    <td>
                      {user.isActive ? (
                        <Button
                          variant='danger'
                          className='btn-sm'
                          onClick={() => deleteHandler(user._id)}
                        >
                          Deshabilitar
                        </Button>
                      ) : (
                        <Button
                          variant='success'
                          className='btn-sm'
                          onClick={() => enableUserHandler(user._id)}
                        >
                          Habilitar
                        </Button>
                      )}
                      <LinkContainer to={`/admin/user/${user._id}/edit`}>
                        <Button variant='light' className='btn-sm mx-2'>
                          <FaEdit />
                        </Button>
                      </LinkContainer>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No se encontraron usuarios.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
};

export default UserListScreen;
