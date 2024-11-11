import React, { useState } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { useGetUsersQuery, useDeleteUserMutation, useEnableUserMutation } from '../../slices/usersApiSlice';
import CustomButton from '../../components/CustomButton.jsx';

const UserListScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: users = [], isLoading, error, refetch } = useGetUsersQuery();
  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();
  const [enableUser] = useEnableUserMutation();

  // Maneja la deshabilitación de usuarios
  const deleteHandler = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas deshabilitar este usuario?')) {
      try {
        await deleteUser(id);
        toast.success('Usuario deshabilitado correctamente');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Ha ocurrido un error');
      }
    }
  };

  // Maneja la habilitación de usuarios
  const enableUserHandler = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas habilitar este usuario?')) {
      try {
        await enableUser(id);
        toast.success('Usuario habilitado correctamente');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Ha ocurrido un error');
      }
    }
  };

  // Filtra los usuarios según el término de búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <h1>Usuarios</h1>
      <input
        type="text"
        placeholder="Buscar usuarios..."
        value={searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: '20px', padding: '10px', width: '300px', borderRadius: '5px' }}
      />
      
      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error.message || 'Ha ocurrido un error'}</Message>
      ) : (
        <>
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
                    <td>
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </td>
                    <td>
                      {user.isAdmin ? (
                        <FaCheck style={{ color: 'green' }} />
                      ) : (
                        <FaTimes style={{ color: 'red' }} />
                      )}
                    </td>
                    <td className="text-center">
                      {user.isActive ? (
                        <CustomButton
                          onClick={() => deleteHandler(user._id)}
                          text='Deshabilitar'
                          icon={<FaTrash />}
                          className='action-button delete-button'
                        />
                      ) : (
                        <CustomButton
                          onClick={() => enableUserHandler(user._id)}
                          text='Habilitar'
                          icon={<FaCheck />}
                          className='action-button enable-button'
                        />
                      )}
                      <LinkContainer to={`/admin/user/${user._id}/edit`}>
                        <CustomButton
                          onClick={() => {}}
                          text='Editar'
                          icon={<FaEdit />}
                          className='action-button edit-button'
                        />
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
