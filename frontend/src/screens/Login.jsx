import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from "../components/FormContainer.jsx";
import Loader from '../components/Loader.jsx';
import { useLoginMutation } from '../slices/usersApiSlice.js';
import { setCredentials } from '../slices/authSlice.js';
import { toast } from "react-toastify";
import * as faceapi from 'face-api.js';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isFaceLogin, setIsFaceLogin] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [faceRecognitionStatus, setFaceRecognitionStatus] = useState('');
    const [storedDescriptor, setStoredDescriptor] = useState(null);
    const [matchPercentage, setMatchPercentage] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [login, { isLoading }] = useLoginMutation();
    const { userInfo } = useSelector((state) => state.auth);
    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const redirect = sp.get('redirect') || '/';

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [userInfo, redirect, navigate]);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // Validar email
        if (!validateEmail(email)) {
            toast.error('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        if (isFaceLogin) {
            if (!email) {
                toast.error('Por favor, ingresa tu email');
                return;
            }
        } else {
            try {
                const res = await login({ email, password }).unwrap();
                dispatch(setCredentials({ ...res }));
                navigate(redirect);
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    const startVideo = async () => {
        try {
            if (videoRef.current) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
                videoRef.current.srcObject = stream;
                setIsDetecting(true);
            }
        } catch (err) {
            console.error("Error accessing the camera: ", err);
        }
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        setIsDetecting(false);
    };

    const handleFaceLogin = async () => {
        if (!email) {
            toast.error('Por favor, ingresa tu email primero');
            return;
        }
        try {
            const { data } = await axios.post('/api/users/facedata', { email });
            if (!data.faceData || data.faceData.length === 0) {
                toast.error('No se encontraron datos faciales para este usuario');
                return;
            }
            const descriptor = new Float32Array(data.faceData);
            setStoredDescriptor(descriptor);
            setIsFaceLogin(true);
            setShowVideo(true);
            setIsDetecting(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al obtener datos faciales');
        }
    };

    const handleNormalLogin = () => {
        setIsFaceLogin(false);
        setShowVideo(false);
        setFaceRecognitionStatus('');
        setMatchPercentage(null);
        stopVideo();
    };

    const handleDetectAgain = () => {
        setIsDetecting(true);
        setFaceRecognitionStatus('');
        setMatchPercentage(null);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        detectFace();
    };

    const detectFace = async () => {
        if (videoRef.current && canvasRef.current && storedDescriptor && isDetecting) {
            try {
                const options = new faceapi.TinyFaceDetectorOptions();
                const result = await faceapi.detectSingleFace(videoRef.current, options)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                if (result) {
                    const displaySize = {
                        width: videoRef.current.videoWidth,
                        height: videoRef.current.videoHeight,
                    };
                    canvasRef.current.width = displaySize.width;
                    canvasRef.current.height = displaySize.height;
                    faceapi.matchDimensions(canvasRef.current, displaySize);
                    const resizedResult = faceapi.resizeResults(result, displaySize);

                    faceapi.draw.drawDetections(canvasRef.current, resizedResult);
                    faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedResult);

                    const descriptor = result.descriptor;
                    const distance = faceapi.euclideanDistance(storedDescriptor, descriptor);
                    const percentage = Math.max(0, (1 - distance / 0.6)) * 100;
                    setMatchPercentage(percentage.toFixed(2));

                    if (distance < 0.6) {
                        setFaceRecognitionStatus('¡Cara reconocida exitosamente!');
                        setIsDetecting(false);
                        try {
                            const res = await login({ email, faceData: Array.from(descriptor) }).unwrap();
                            dispatch(setCredentials({ ...res }));
                            navigate(redirect);
                            stopVideo();
                        } catch (err) {
                            setFaceRecognitionStatus('Error al iniciar sesión');
                        }
                    } else {
                        setFaceRecognitionStatus('Cara no reconocida. Intentando nuevamente...');
                    }
                } else {
                    setFaceRecognitionStatus('No se detectó ninguna cara. Por favor, colócate frente a la cámara.');
                }

                if (isDetecting) {
                    animationFrameId.current = requestAnimationFrame(detectFace);
                }

            } catch (error) {
                setFaceRecognitionStatus('Error en la detección facial');
                setIsDetecting(false);
            }
        }
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.addEventListener('play', () => {
                detectFace();
            });
        }
    }, [videoRef.current]);

    return (
        <FormContainer>
            <h1>Iniciar Sesión</h1>
            
            <Form onSubmit={submitHandler}>
                <Form.Group controlId="email" className="my-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type='email'
                        placeholder="Ingresa tu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>

                {!isFaceLogin && (
                    <Form.Group controlId="password" className="my-3">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control
                            type='password'
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} />
                    </Form.Group>
                )}

                <Button type='submit' variant='primary' className="mt-2" disabled={isLoading}>
                    {isFaceLogin ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                </Button>
                {isLoading && <Loader />}
            </Form>

            {!isFaceLogin ? (
                <Button onClick={handleFaceLogin} variant='secondary' className="mt-2">
                    Iniciar Sesión con Reconocimiento Facial
                </Button>
            ) : (
                <div className="mt-2">
                    <Button onClick={handleNormalLogin} variant='secondary' className="me-2">
                        Volver al Inicio de Sesión Normal
                    </Button>
                    <Button onClick={handleDetectAgain} variant='secondary'>
                        Detectar nuevamente
                    </Button>
                </div>
            )}

            {showVideo && (
                <div style={{ position: 'relative', marginTop: '20px' }}>
                    <video
                        ref={videoRef}
                        style={{ borderRadius: '10px', width: '320px', height: '240px' }}
                        autoPlay
                        muted
                    ></video>
                    <canvas
                        ref={canvasRef}
                        style={{ position: 'absolute', top: 0, left: 0, width: '320px', height: '240px' }}
                    ></canvas>
                </div>
            )}

            {matchPercentage && (
                <Alert variant="info" className="mt-3">
                    Porcentaje de coincidencia: {matchPercentage}%
                </Alert>
            )}

            {faceRecognitionStatus && (
                <Alert variant="info" className="mt-3">
                    {faceRecognitionStatus}
                </Alert>
            )}

            <Row className="py-3">
                <Col>
                    ¿Nuevo usuario?{' '}
                    <Link to={redirect ? `/register?redirect=${redirect}` : '/register'}>
                        Regístrate
                    </Link>
                </Col>
            </Row>
        </FormContainer>
    );
};

export default Login;
