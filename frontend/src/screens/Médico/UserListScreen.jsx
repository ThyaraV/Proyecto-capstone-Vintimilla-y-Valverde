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
    const { data: users = [], isLoading, error, refetch } = useGetUsersQuery(); // Asegúrate de que 'users' tenga un valor por defecto como arreglo
    const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await deleteUser(id);
                toast.success('User deleted');
                refetch();
            } catch (err) {
                toast.error(err?.data?.message || (typeof err.error === 'object' ? JSON.stringify(err.error) : err.error));
            }
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filtrado de usuarios, asegurándose de que sea un arreglo
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                <th>PAID</th>
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
                                            <LinkContainer to={`/admin/user/${user._id}/edit`}>
                                                <Button variant='light' className='btn-sm mx-2'>
                                                    <FaEdit />
                                                </Button>
                                            </LinkContainer>
                                            <Button variant='danger' className='btn-sm' onClick={() => deleteHandler(user._id)}>
                                                <FaTrash style={{ color: 'white' }} />
                                            </Button>
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
