import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../slices/usersApiSlice.js";
import { setCredentials } from "../slices/authSlice.js";
import { toast } from "react-toastify";
import * as faceapi from "face-api.js";
import axios from "axios";
import logo from "../assets/logoHigea.png";
import { AiOutlineMail } from "react-icons/ai"; // Ícono de correo
import { AiOutlineLock } from "react-icons/ai"; // Ícono de candado
import TypingAnimation from "./TypingAnimation";
import cerebro from "../images/background/cerebro.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFaceLogin, setIsFaceLogin] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [faceRecognitionStatus, setFaceRecognitionStatus] = useState("");
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
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    document.body.classList.add("no-navbar");
    return () => document.body.classList.remove("no-navbar");
  }, []);

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
      stopVideo();
    }
  }, [userInfo, redirect, navigate]);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log("Modelos de face-api.js cargados");
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (showVideo && storedDescriptor) {
      startVideo();
      detectFace();
    }
    return () => {
      stopVideo();
    };
  }, [showVideo]); // eslint-disable-line react-hooks/exhaustive-deps

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
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsDetecting(false);
  };

  const handleFaceLogin = async () => {
    if (!email) {
      toast.error("Por favor, ingresa tu email primero");
      return;
    }
    try {
      const { data } = await axios.post("/api/users/facedata", { email });
      if (!data.faceData || data.faceData.length === 0) {
        toast.error("No se encontraron datos faciales para este usuario");
        return;
      }
      const descriptor = new Float32Array(data.faceData);
      setStoredDescriptor(descriptor);
      setIsFaceLogin(true);
      setShowVideo(true);
    } catch (error) {
      console.error("Error al obtener datos faciales:", error);
      toast.error(
        error.response?.data?.message || "Error al obtener datos faciales"
      );
    }
  };

  const handleNormalLogin = () => {
    setIsFaceLogin(false);
    setShowVideo(false);
    setFaceRecognitionStatus("");
    setMatchPercentage(null);
    stopVideo();
  };

  const handleDetectAgain = () => {
    setIsDetecting(true);
    setFaceRecognitionStatus("");
    setMatchPercentage(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    detectFace();
  };

  const detectFace = async () => {
    if (
      videoRef.current &&
      canvasRef.current &&
      storedDescriptor &&
      isDetecting
    ) {
      try {
        const options = new faceapi.TinyFaceDetectorOptions();
        const result = await faceapi
          .detectSingleFace(videoRef.current, options)
          .withFaceLandmarks()
          .withFaceDescriptor();

        const ctx = canvasRef.current.getContext("2d");
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
          const distance = faceapi.euclideanDistance(
            storedDescriptor,
            descriptor
          );
          const percentage = Math.max(0, 1 - distance / 0.6) * 100;
          setMatchPercentage(percentage.toFixed(2));

          if (distance < 0.6) {
            setFaceRecognitionStatus("¡Cara reconocida exitosamente!");
            setIsDetecting(false);
            try {
              const res = await login({
                email,
                faceData: Array.from(descriptor),
              }).unwrap();
              dispatch(setCredentials({ ...res }));
              navigate(redirect);
              stopVideo();
            } catch (err) {
              console.error("Error al iniciar sesión:", err);
              setFaceRecognitionStatus("Error al iniciar sesión");
            }
          } else {
            setFaceRecognitionStatus(
              "Cara no reconocida. Intentando nuevamente..."
            );
          }
        } else {
          setFaceRecognitionStatus(
            "No se detectó ninguna cara. Por favor, colócate frente a la cámara."
          );
        }

        if (isDetecting) {
          animationFrameId.current = requestAnimationFrame(detectFace);
        }
      } catch (error) {
        console.error("Error en detectFace:", error);
        setFaceRecognitionStatus("Error en la detección facial");
        setIsDetecting(false);
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("play", () => {
        detectFace();
      });
    }
  }, [videoRef.current]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitHandler = async (e) => {
    e.preventDefault();
    if (isFaceLogin) {
      if (!email) {
        toast.error("Por favor, ingresa tu email");
        return;
      }
    } else {
      try {
        const res = await login({ email, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate(redirect);
        stopVideo();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <>
      <div className="typing-animation-container">
        <TypingAnimation
          text="  Creemos en un enfoque integral y personalizado para el tratamiento de la salud mental y neurológica. Combinamos técnicas modernas con un enfoque humanista para abordar los problemas desde una perspectiva completa y personalizada."
          speed={100}
        />
      </div>
      <div className="login-container">
        <div className="login-page">
          <div className="form-wrapper">
            <div className="form-inner">
              <img
                src={logo}
                alt="Logo de la empresa"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "contain",
                  margin: "0 auto 20px auto",
                  display: "block",
                  borderRadius: "50%",
                  paddingTop: "10px",
                }}
              />
              <form className="form-space" onSubmit={submitHandler}>
                <div className="mailfield">
                  <AiOutlineMail className="icon" />
                  <input
                    className="input-field"
                    placeholder="Correo electrónico"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {!isFaceLogin && (
                  <div className="mailfield2">
                    <div className="iconfliend">
                      <AiOutlineLock className="icon2" />
                    </div>
                    <input
                      className="input-field"
                      placeholder="Contraseña"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                )}

                <button
                  className="primary-button"
                  type="submit"
                  disabled={isLoading}
                >
                  {isFaceLogin ? "Iniciando Sesión..." : "Iniciar Sesión"}
                </button>

                {!isFaceLogin && (
                  <button
                    type="button"
                    onClick={handleFaceLogin}
                    className="secondary-button"
                  >
                    Iniciar con reconocimiento facial
                  </button>
                )}

                <div className="text-center" style={{ marginTop: "1rem" }}>
                  <Link
                    to={redirect ? `/register?redirect=${redirect}` : "/register"}
                    className="link"
                  >
                    ¿Nuevo usuario? Regístrate
                  </Link>
                </div>

                {isLoading && <div className="loader">Cargando...</div>}

                {faceRecognitionStatus && (
                  <div className="alert-error">{faceRecognitionStatus}</div>
                )}

                {matchPercentage && (
                  <div className="alert-success">
                    Porcentaje de coincidencia: {matchPercentage}%
                  </div>
                )}
              </form>

              {showVideo && (
                <div className="video-overlay">
                  <div className="video-container">
                    <video ref={videoRef} autoPlay muted></video>
                    <canvas ref={canvasRef}></canvas>
                    <div className="button-group-popup">
                      <button
                        onClick={handleDetectAgain}
                        className="secondary-button purple"
                      >
                        Ingresar
                      </button>
                      <button
                        onClick={handleNormalLogin}
                        className="secondary-button yellow"
                      >
                        Volver al Inicio Normal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <style>
            {`
              .no-navbar header {
                  display: none;
              }
              .video-overlay {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.5);
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  z-index: 999;
              }
              .video-container {
                  background: white;
                  padding: 20px;
                  border-radius: 12px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  width: 500px;
                  max-width: 90%;
              }
              .video-container video, .video-container canvas {
                  border-radius: 8px;
                  width: 100%;
                  height: auto;
                  margin-bottom: 10px;
              }
              .button-group-popup {
                  display: flex;
                  justify-content: space-between;
                  width: 100%;
                  margin-top: 15px;
              }
            `}
          </style>
        </div>
        <div className="fullscreen-background"></div>
      </div>

      {/* Estilos generales */}
      <style>
        {`
          /* Fondo que ocupa toda la pantalla */
          .fullscreen-background {
              position: fixed;
              top: 0;
              right: 0;
              width: 50%;
              height: 100%;
              background-image: url(${cerebro});
              background-size: cover;
              background-position: center;
              z-index: -10;
              background: linear-gradient(to right, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.1)), url(${cerebro});
              background-size: cover;
              background-position: center;
              filter: blur(2px);
          }

          /* Contenedor del formulario */
          .login-container {
              display: flex;
              align-items: left;
              justify-content: left;
              width: 100%;
              height: 100vh;
              padding-bottom: 3rem;
          }

          input,
          button,
          a {
              z-index: 2;
              position: relative;
          }

          .login-page {
              width: 40%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 2;
          }

          .form-wrapper {
              position: relative;
              padding: 15px;
              border-radius: 1rem;
              background: rgb(255, 255, 255);
              backdrop-filter: blur(15px);
              border: 1px solid rgba(255, 255, 255, 0.3);
              display: flex;
              justify-content: center;
              align-items: center;
              width: 30rem;
              height: auto;
              animation: fadeIn 1.5s ease-out;
          }

          /* Animación de entrada */
          @keyframes fadeIn {
              0% {
                  opacity: 0;
                  transform: translateY(-50px);
              }
              100% {
                  opacity: 1;
                  transform: translateY(0);
              }
          }

          /* Contenedor interior del formulario */
          .form-inner {
              background-color: #ffffff;
              padding: 3rem;
              border-radius: 0.75rem;
              position: relative;
              z-index: 1;
              width: 28rem;
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }

          /* Espaciado entre elementos del formulario */
          .form-space {
              display: flex;
              flex-direction: column;
              gap: 1.5rem;
          }

          /* Estilos de los inputs */
          .input-field {
              width: 100%;
              height: 3.5rem;
              border: none;
              padding-left: 1rem;
              padding-right: 1rem;
              border-radius: 15rem;
              box-sizing: border-box;
              font-size: 1.1rem;
          }

          /* Botón principal */
          .primary-button {
              width: 100%;
              height: 3.5rem;
              background-color: #3b82f6;
              color: white;
              font-weight: 700;
              border-radius: 15rem;
              border: none;
              cursor: pointer;
              transition: background-color 0.3s ease;
              font-size: 1.1rem;
          }
          .primary-button:hover {
              background-color: #2563eb;
          }
          .primary-button:disabled {
              background-color: #93c5fd;
              cursor: not-allowed;
          }

          /* Botones secundarios */
          .secondary-button {
              width: 100%;
              height: 3.5rem;
              background-color: #10b981;
              color: white;
              font-weight: 700;
              border-radius: 15rem;
              border: none;
              cursor: pointer;
              transition: background-color 0.3s ease;
              font-size: 1.1rem;
          }
          .secondary-button:hover {
              background-color: #059669;
          }
          .secondary-button.yellow {
              background-color: #f59e0b;
          }
          .secondary-button.yellow:hover {
              background-color: #d97706;
          }
          .secondary-button.purple {
              background-color: #8b5cf6;
          }
          .secondary-button.purple:hover {
              background-color: #7c3aed;
          }

          /* Estilos del enlace */
          .link {
              color: #3b82f6;
              font-size: 1rem;
              line-height: 1.5rem;
              text-decoration: none;
              display: block;
              text-align: center;
          }
          .link:hover {
              color: #1d4ed8;
          }

          /* Mensajes y alertas */
          .alert-info,
          .alert-error,
          .alert-success {
              text-align: center;
              margin-top: 1.5rem;
              font-size: 1rem;
          }
          .alert-info {
              color: #3b82f6;
          }
          .alert-error {
              color: #ef4444;
          }
          .alert-success {
              color: #10b981;
          }

          /* Contenedor de video y canvas */
          .video-container {
              position: relative;
              margin-top: 1.5rem;
          }
          .video-container video,
          .video-container canvas {
              border-radius: 0.625rem;
              width: 320px;
              height: 240px;
          }
          .video-container canvas {
              position: absolute;
              top: 0;
              left: 0;
          }

          /* Loader */
          .loader {
              text-align: center;
              color: #6b7280;
              margin-top: 1.5rem;
              font-size: 1rem;
          }

          button {
              font: inherit;
          }
          input {
              font: inherit;
              margin: 0;
          }
          a {
              text-decoration: none;
          }

          .mailfield {
              position: relative;
              width: 100%;
              display: flex;
              align-items: center;
              border: 1px solid rgb(70, 70, 70);
              border-radius: 15rem;
              padding: 4px;
              box-sizing: border-box;
          }
          .icon {
              color: #000000;
              font-size: 20px;
              margin-right: 1px;
          }
          .mailfield2 {
              position: relative;
              width: 100%;
              display: flex;
              align-items: center;
              border:1px solid rgb(70, 70, 70);
              border-radius: 15rem;
              padding: 3px;
              box-sizing: border-box;
          }
          .icon2 {
              color: #000000;
              font-size: 20px;
          }

          .typing-animation-container {
              position: absolute;
              top: 50%;
              right: 2rem;
              transform: translateY(-50%);
              z-index: 1000;
              color: white;
              font-size: 1.2rem;
              text-align: right;
              font-weight: bold;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
              max-width: 300px;
              white-space: pre-wrap;
          }
          .typing-animation-container .typing-text {
              font-size: 1.2rem;
              line-height: 1.5;
              overflow: hidden;
              border-right: 2px solid white;
              animation: blink 0.7s step-end infinite;
          }
          @keyframes blink {
              50% {
                  border-color: transparent;
              }
          }

          /*----------------------------------------------*/
          /*  MEDIA QUERIES PARA HACERLO MÁS RESPONSIVE   */
          /*----------------------------------------------*/

          @media (max-width: 1024px) {
            .fullscreen-background {
              width: 60%;
            }
            .login-page {
              width: 50%;
            }
          }

          @media (max-width: 768px) {
            /* Ocultamos o reducimos el fondo lateral para pantallas pequeñas */
            .fullscreen-background {
              display: none;
            }
            .typing-animation-container {
              display: none;
              right: 1rem;
              font-size: 1rem;
              max-width: 200px;
            }
            .login-container {
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding-bottom: 1rem;
              height: auto;
            }
            .login-page {
              width: 100%;
              margin-top: 2rem;
            }
            .form-wrapper {
              width: 90%;
            }
            .form-inner {
              width: 100%;
              padding: 2rem;
            }
          }

          @media (max-width: 480px) {
            .typing-animation-container {
              display: none; /* o reducir mucho su tamaño */
            }
            .form-inner {
              padding: 1rem;
            }
            .input-field {
              font-size: 1rem;
              height: 3rem;
            }
            .primary-button,
            .secondary-button {
              font-size: 1rem;
              height: 3rem;
            }
          }
        `}
      </style>
    </>
  );
};

export default Login;
