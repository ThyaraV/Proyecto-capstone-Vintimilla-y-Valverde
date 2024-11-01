import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice.js';
import { setCredentials } from '../slices/authSlice.js';
import { toast } from "react-toastify";
import * as faceapi from 'face-api.js';
import axios from 'axios';
import '../assets/styles/Login.css';

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

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
            console.log('Modelos de face-api.js cargados');
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (showVideo && storedDescriptor) {
            startVideo();
        }
        return () => {
            stopVideo();
        };
    }, [showVideo]);

    const startVideo = async () => {
        try {
            if (videoRef.current) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
                videoRef.current.srcObject = stream;
                setIsDetecting(true);
            }
        } catch (err) {
            console.error("Error al acceder a la cámara: ", err);
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
            console.error('Error al obtener datos faciales:', error);
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
                const result = await faceapi
                    .detectSingleFace(videoRef.current, options)
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
                            console.error('Error al iniciar sesión:', err);
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
                console.error('Error en detectFace:', error);
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

    const submitHandler = async (e) => {
        e.preventDefault();
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

    return (
        <div className="login-page">
            <div className="form-wrapper">
                <div className="form-inner">
                    <h2 id="form-title">Iniciar Sesión</h2>
                    <form className="form-space" onSubmit={submitHandler}>
                        <input
                            className="input-field"
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {!isFaceLogin && (
                            <input
                                className="input-field"
                                placeholder="Contraseña"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        )}

                        <button
                            className="primary-button"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isFaceLogin ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                        </button>

                        {!isFaceLogin ? (
                            <button
                                type="button"
                                onClick={handleFaceLogin}
                                className="secondary-button"
                            >
                                Iniciar con Reconocimiento Facial
                            </button>
                        ) : (
                            <div className="button-group">
                                <button
                                    type="button"
                                    onClick={handleNormalLogin}
                                    className="secondary-button yellow"
                                >
                                    Volver al Inicio Normal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDetectAgain}
                                    className="secondary-button purple"
                                >
                                    Detectar de Nuevo
                                </button>
                            </div>
                        )}

                        <div className="text-center" style={{ marginTop: '1rem' }}>
                            <Link
                                to={redirect ? `/register?redirect=${redirect}` : '/register'}
                                className="link"
                            >
                                ¿Nuevo usuario? Regístrate
                            </Link>
                        </div>

                        {isLoading && <div className="loader">Cargando...</div>}

                        {faceRecognitionStatus && (
                            <div className="alert-error">
                                {faceRecognitionStatus}
                            </div>
                        )}

                        {matchPercentage && (
                            <div className="alert-success">
                                Porcentaje de coincidencia: {matchPercentage}%
                            </div>
                        )}
                    </form>

                    {showVideo && (
                        <div className="video-container">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                            ></video>
                            <canvas
                                ref={canvasRef}
                            ></canvas>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
