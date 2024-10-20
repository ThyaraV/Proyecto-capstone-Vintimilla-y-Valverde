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
        if (window.confirm('Are you sure you want to disable this user?')) {
            try {
                await deleteUser(id); // Cambiará el estado de isActive a false
                toast.success('User disabled successfully');
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
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Función para habilitar un usuario
    const enableUserHandler = async (id) => {
        // Aquí se debe implementar la lógica para volver a habilitar al usuario
        // Esto podría ser un llamado a la API que cambie isActive a true
        // Por ejemplo:
        // await enableUser(id);
        toast.success('User enabled successfully');
        refetch();
    };

    return (
        <>
            <h1>Users</h1>
            {loadingDelete && <Loader />}
            {isLoading ? <Loader /> : error ? (
                <Message variant='danger'>{error.message || "An error occurred"}</Message>
            ) : (
                <>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{ marginBottom: '20px', padding: '5px', width: '300px' }}
                    />
                    <Table striped hover responsive className='table-sm'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>NAME</th>
                                <th>EMAIL</th>
                                <th>ADMIN</th>
                                <th>ACTION</th>
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
                                                <Button variant='danger' className='btn-sm' onClick={() => deleteHandler(user._id)}>
                                                    Disable
                                                </Button>
                                            ) : (
                                                <Button variant='success' className='btn-sm' onClick={() => enableUserHandler(user._id)}>
                                                    Enable
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
                                    <td colSpan="5">No users found.</td>
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
