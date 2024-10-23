import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import FormContainer from "../../components/FormContainer";
import { toast } from 'react-toastify';
import { useUpdateUserMutation, useGetUserDetailsQuery } from "../../slices/usersApiSlice";
import { useGetDoctorsQuery } from "../../slices/doctorApiSlice"; // Importa la consulta para obtener los doctores

const UserEditScreen = () => {
    const { id: userId } = useParams();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user'); // Nueva propiedad de rol
    const [doctorId, setDoctorId] = useState(''); // Para almacenar el doctor asignado si es paciente

    const { data: user, isLoading, refetch, error } = useGetUserDetailsQuery(userId);
    const { data: doctors, isLoading: loadingDoctors, error: errorDoctors } = useGetDoctorsQuery(); // Obtener los doctores

    const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.isAdmin ? 'admin' : user.isDoctor ? 'doctor' : 'patient');
            setDoctorId(user.doctor || ''); // Si el usuario es paciente, preselecciona el doctor responsable
        }
    }, [user]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await updateUser({
                userId,
                name,
                email,
                role,
                doctorId: role === 'patient' ? doctorId : null, // Solo envía doctorId si el rol es paciente
            });
            toast.success('Usuario actualizado correctamente');
            refetch();
            navigate('/admin/userlist');
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    return (
        <>
            <Link to='/admin/userlist' className="btn btn-light my-3">
                Volver
            </Link>
            <FormContainer>
                <h1>Editar Usuario</h1>
                {loadingUpdate && <Loader />}
                {isLoading ? <Loader /> : error ? (
                    <Message variant='danger'>{error}</Message>
                ) : (
                    <Form onSubmit={submitHandler}>
                        <Form.Group controlId='name' className="my-2">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Ingrese el nombre'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId='email' className="my-2">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type='email'
                                placeholder='Ingrese el email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId='role' className="my-2">
                            <Form.Label>Rol</Form.Label>
                            <Form.Control
                                as='select'
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value='user'>Usuario</option>
                                <option value='admin'>Administrador</option>
                                <option value='doctor'>Doctor</option>
                                <option value='patient'>Paciente</option>
                            </Form.Control>
                        </Form.Group>

                        {/* Solo muestra el dropdown de doctores si el rol seleccionado es 'patient' */}
                        {role === 'patient' && (
                            <Form.Group controlId='doctor' className="my-2">
                                <Form.Label>Doctor Responsable</Form.Label>
                                {loadingDoctors ? (
                                    <Loader />
                                ) : errorDoctors ? (
                                    <Message variant='danger'>{errorDoctors}</Message>
                                ) : (
                                    <Form.Control
                                        as='select'
                                        value={doctorId}
                                        onChange={(e) => setDoctorId(e.target.value)}
                                    >
                                        <option value=''>Seleccione un doctor</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor._id} value={doctor._id}>
                                                {doctor.user.name} - {doctor.especialidad}
                                            </option>
                                        ))}
                                    </Form.Control>
                                )}
                            </Form.Group>
                        )}

                        <Button type='submit' variant='primary' className='my-2'>
                            Actualizar
                        </Button>
                    </Form>
                )}
            </FormContainer>
        </>
    );
};

export default UserEditScreen;
