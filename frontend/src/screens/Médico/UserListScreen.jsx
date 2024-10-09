import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from '../../slices/usersApiSlice';

const UserListScreen = () => {
  const { data: users, isLoading, error, refetch } = useGetUsersQuery();

  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await deleteUser(id);
        toast.success('Usuario eliminado');
        refetch();
      } catch (err) {
        toast.error(
          err?.data?.message ||
            (typeof err.error === 'object'
              ? JSON.stringify(err.error)
              : err.error)
        );
      }
    }
  };

  return (
    <>
      <h1>Usuarios</h1>
      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error.message || 'Ha ocurrido un error'}
        </Message>
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
              {users.map((user) => (
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
                  <td>
                    <LinkContainer to={`/admin/user/${user._id}/edit`}>
                      <Button variant='light' className='btn-sm mx-2'>
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      onClick={() => deleteHandler(user._id)}
                    >
                      <FaTrash style={{ color: 'white' }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
};

export default UserListScreen;
