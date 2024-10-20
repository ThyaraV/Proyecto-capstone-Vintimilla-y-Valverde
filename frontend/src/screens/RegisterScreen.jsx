import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from "../components/FormContainer.jsx";
import Loader from '../components/Loader.jsx';
import { useRegisterMutation } from '../slices/usersApiSlice.js';
import { setCredentials } from '../slices/authSlice.js';
import { toast } from "react-toastify";

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [cardId, setCardId] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [register, { isLoading }] = useRegisterMutation();
    const { userInfo } = useSelector((state) => state.auth);

    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const redirect = sp.get('redirect') || '/';

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [userInfo, redirect, navigate]);

    const validateCedula = (cedula) => {
        // Verificar que sea una cadena de exactamente 10 dígitos
        if (!/^\d{10}$/.test(cedula)) {
            return false;
        }

        // Extraer el último dígito como verificador
        const verificador = parseInt(cedula[9], 10);

        // Extraer los dos primeros dígitos para verificar la provincia
        const provincia = parseInt(cedula.substring(0, 2), 10);
        if (provincia < 0 || provincia > 24) {
            return false; // Provincia inválida
        }

        // Coeficientes
        const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        let suma = 0;

        // Sumar los resultados de la multiplicación de los dígitos por los coeficientes
        for (let i = 0; i < 9; i++) {
            let digito = parseInt(cedula[i], 10) * coeficientes[i];
            if (digito >= 10) {
                digito -= 9; // Restar 9 si el resultado es mayor o igual que 10
            }
            suma += digito; // Sumar al total
        }

        // Aplicar el módulo 10
        const modulo = suma % 10;
        const resultadoFinal = modulo === 0 ? 0 : 10 - modulo;

        // Comparar el resultado con el dígito verificador
        return resultadoFinal === verificador;
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // Validar la cédula
        if (!validateCedula(cardId)) {
            toast.error('Cédula inválida. Asegúrate de que tenga 10 dígitos y sea coherente.');
            return;
        }

        // Validar email
        if (!validateEmail(email)) {
            toast.error('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        // Validar contraseñas
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        } else {
            try {
                const res = await register({ name, lastName, cardId, email, phoneNumber, password }).unwrap();
                dispatch(setCredentials({ ...res }));
                navigate(redirect);
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    return (
        <FormContainer>
            <h1>Registrarse</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group controlId="name" className="my-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder="Ingrese su nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)} />
                </Form.Group>

                <Form.Group controlId="lastName" className="my-3">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder="Ingrese su apellido"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)} />
                </Form.Group>

                <Form.Group controlId="cedula" className="my-3">
                    <Form.Label>Cédula</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder="Ingrese su cédula"
                        value={cardId}
                        onChange={(e) => setCardId(e.target.value)} />
                </Form.Group>

                <Form.Group controlId="email" className="my-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type='email'
                        placeholder="Ingrese su email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>
                
                <Form.Group controlId="telefono" className="my-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder="Ingrese su número de teléfono"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)} />
                </Form.Group>

                <Form.Group controlId="password" className="my-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                        type='password'
                        placeholder="Ingrese una contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>
                
                <Form.Group controlId="confirmPassword" className="my-3">
                    <Form.Label>Confirmar contraseña</Form.Label>
                    <Form.Control
                        type='password'
                        placeholder="Ingrese nuevamente la contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} />
                </Form.Group>

                <Button 
                    type='submit' 
                    variant='primary' 
                    className="mt-2"
                    disabled={isLoading}>
                    Registrarse
                </Button>
                {isLoading && <Loader />}
            </Form>

            <Row className="py-3">
                <Col>
                    ¿Ya tienes una cuenta? {''}
                    <Link to={redirect ? `/login?redirect=${redirect}` : '/login'}>
                        Iniciar sesión
                    </Link>
                </Col>
            </Row>
        </FormContainer>
    );
};

export default RegisterScreen;
