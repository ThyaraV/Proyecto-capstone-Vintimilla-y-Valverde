import { useState, useEffect, useRef } from "react";
import { Table, Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { useProfileMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import * as faceapi from "face-api.js";

const ProfileScreen = () => {
  // Estados para los campos
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cardId, setCardId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [faceDescriptor, setFaceDescriptor] = useState(null);

  const videoRef = useRef();
  const canvasRef = useRef();

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setLastName(userInfo.lastName);
      setCardId(userInfo.cardId);
      setEmail(userInfo.email);
      setPhoneNumber(userInfo.phoneNumber);
    }
  }, [userInfo]);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
        });
    };

    loadModels().then(startVideo);
  }, []);

  const captureFace = async () => {
    if (videoRef.current) {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
  
      if (detections) {
        const descriptor = detections.descriptor;
        const descriptorArray = Array.from(descriptor);
        setFaceDescriptor(descriptorArray);
        toast.success("Face captured successfully!");
      } else {
        toast.error("No face detected. Please try again.");
      }
    }
  };

  // Función para validar cédula
  const validateCedula = (cedula) => {
    if (!/^\d{10}$/.test(cedula)) {
      return false;
    }
    const verificador = parseInt(cedula[9], 10);
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 0 || provincia > 24) {
      return false;
    }
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let digito = parseInt(cedula[i], 10) * coeficientes[i];
      if (digito >= 10) {
        digito -= 9;
      }
      suma += digito;
    }
    const modulo = suma % 10;
    const resultadoFinal = modulo === 0 ? 0 : 10 - modulo;
    return resultadoFinal === verificador;
  };

  // Función para validar correo electrónico
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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
      toast.error('Correo electrónico inválido. Asegúrate de que sea un formato válido.');
      return;
    }

    // Validar contraseñas
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await updateProfile({
        _id: userInfo._id,
        name,
        lastName,
        cardId,
        email,
        phoneNumber,
        password,
        faceDescriptor,
      }).unwrap();

      dispatch(setCredentials(res));
      toast.success("Perfil actualizado correctamente");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Row>
      <Col md={3}>
        <h2>Perfil de Usuario</h2>

        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name" className="my-2">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="name"
              placeholder="Ingrese su nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="lastName" className="my-2">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese su apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="cardId" className="my-2">
            <Form.Label>Cédula</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese su cédula"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="email" className="my-2">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingrese su email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="phoneNumber" className="my-2">
            <Form.Label>Número de teléfono</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese su número de teléfono"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="password" className="my-2">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="confirmPassword" className="my-3">
            <Form.Label>Confirmar Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirme su contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <div className="my-3">
            <video ref={videoRef} autoPlay muted width="300" height="300" />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <Button
              type="button"
              variant="secondary"
              onClick={captureFace}
              className="mt-2"
            >
              Capturar rostro
            </Button>
          </div>

          <Button type="Submit" variant="primary" className="my-2">
            Actualizar
          </Button>

          {loadingUpdateProfile && <Loader />}
        </Form>
      </Col>
    </Row>
  );
};

export default ProfileScreen;
