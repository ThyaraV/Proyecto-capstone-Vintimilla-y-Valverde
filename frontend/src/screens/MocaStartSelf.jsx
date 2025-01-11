// src/screens/MOCAmodules/MocaStartSelf.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  ProgressBar,
  Row,
  Col,
  ListGroup,
  Alert,
  Spinner,
  Form,
} from "react-bootstrap";
import { useGetPatientsQuery } from "../slices/patientApiSlice";
import { useCreateMocaSelfMutation } from "../slices/mocaSelfApiSlice"; // Importar hook para enviar datos
import Visuoespacial from "./MOCAmodules/Visuoespacial";
import Identificacion from "./MOCAmodules/Identificacion";
import Memoria from "./MOCAmodules/Memoria";
import Atencion from "./MOCAmodules/Atencion";
import Lenguaje from "./MOCAmodules/Lenguaje";
import Abstraccion from "./MOCAmodules/Abstraccion";
import RecuerdoDiferido from "./MOCAmodules/RecuerdoDiferido";
import Orientacion from "./MOCAmodules/Orientacion";
import { FaPlay, FaStop, FaMicrophone } from "react-icons/fa"; // Importar iconos
import "../assets/styles/MocaTest.css";
import { useUpdatePatientMutation } from '../slices/patientApiSlice.js'; // Importar hook para actualizar paciente

const MODULES = [
  { id: 0, name: "Visuoespacial", icon: "🧩", component: Visuoespacial },
  { id: 1, name: "Identificación", icon: "🦁", component: Identificacion },
  { id: 2, name: "Memoria", icon: "🧠", component: Memoria },
  { id: 3, name: "Atención", icon: "🔍", component: Atencion },
  { id: 4, name: "Lenguaje", icon: "🗣️", component: Lenguaje },
  { id: 5, name: "Abstracción", icon: "🔎", component: Abstraccion },
  { id: 6, name: "Recuerdo Diferido", icon: "💭", component: RecuerdoDiferido },
  { id: 7, name: "Orientación", icon: "🧭", component: Orientacion },
];

const MocaStartSelf = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patients = [] } = useGetPatientsQuery();
  const selectedPatient = patients.find((patient) => patient._id === id);

  const [testStarted, setTestStarted] = useState(false);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [individualScores, setIndividualScores] = useState({});
  const [moduleScores, setModuleScores] = useState({});
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false); // Nuevo estado para detectar la finalización del test
  const [hasLessThan12YearsOfEducation, setHasLessThan12YearsOfEducation] = useState(false); // Nuevo estado para checkbox

  // Hooks para las mutaciones
  const [
    createMocaSelf,
    { isLoading: isSaving, isSuccess, isError, error: saveError },
  ] = useCreateMocaSelfMutation();

  const [
    updatePatient,
    { isLoading: isUpdatingPatient, isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError },
  ] = useUpdatePatientMutation();

  useEffect(() => {
    let interval;
    if (testStarted) {
      interval = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [testStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleStartTest = () => {
    setTestStarted(true);
    setStartTime(new Date().toLocaleString());
  };

  const handleCompleteModule = (moduleId, moduleScore, activityScores) => {
    // Guardar puntaje del módulo
    setModuleScores((prevModuleScores) => ({
      ...prevModuleScores,
      [MODULES[moduleId].name]: moduleScore,
    }));

    // Calcular puntaje actual
    const newCurrentScore = Object.values({
      ...moduleScores,
      [MODULES[moduleId].name]: moduleScore,
    }).reduce((sum, score) => sum + score, 0);

    setCurrentScore(newCurrentScore);

    // Guardar respuestas del módulo actual
    setIndividualScores((prevScores) => ({
      ...prevScores,
      [MODULES[moduleId].name]: { ...activityScores, total: moduleScore },
    }));

    if (selectedModuleIndex !== null) {
      // Si se seleccionó un módulo manualmente, no avanzar automáticamente
      setSelectedModuleIndex(null);
    } else {
      // Si no, avanzar al siguiente módulo automáticamente
      if (currentModuleIndex < MODULES.length - 1) {
        setCurrentModuleIndex(currentModuleIndex + 1);
      } else {
        setTestCompleted(true);
      }
    }
  };

  const handlePreviousModule = () => {
    if (selectedModuleIndex !== null) {
      setSelectedModuleIndex(null);
      setCurrentModuleIndex(
        currentModuleIndex - 1 >= 0 ? currentModuleIndex - 1 : 0
      );
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  const handleSelectModule = (index) => {
    setSelectedModuleIndex(index);
    setCurrentModuleIndex(index);
  };

  const CurrentModuleComponent = MODULES[currentModuleIndex].component;

  // Función para manejar el envío de resultados reales
  const handleSaveResults = async () => {
    if (!selectedPatient) {
      alert("Paciente no seleccionado.");
      return;
    }

    // Añadir un punto si tiene 12 años o menos de estudios y MoCA < 30
    let finalScore = currentScore;
    if (hasLessThan12YearsOfEducation && currentScore < 30) {
      finalScore += 1;
    }

    const mocaData = {
      patientId: selectedPatient._id,
      patientName: selectedPatient.user?.name || "Paciente Desconocido",
      modulesData: individualScores,
      totalScore: finalScore,
      hasLessThan12YearsOfEducation,
    };

    try {
      // Guardar los resultados de MoCA
      const savedRecord = await createMocaSelf(mocaData).unwrap();
      alert("Resultados guardados exitosamente.");

      // Actualizar el campo mocaAssigned a false
      await updatePatient({ id: selectedPatient._id, mocaAssigned: false }).unwrap();
      alert("Estado de MOCA actualizado correctamente.");

      // Redirigir a la pantalla final de MoCA
      navigate(`/moca-final/${savedRecord._id}`);
    } catch (err) {
      console.error("Error al guardar resultados:", err);
      alert("Hubo un error al guardar los resultados. Por favor, intenta nuevamente.");
    }
  };

  // Función para manejar el envío de resultados simulados
  const handleSimulateAndSaveResults = async () => {
    if (!selectedPatient) {
      alert("Paciente no seleccionado.");
      return;
    }

    // Datos simulados de prueba
    const simulatedScores = {
      Visuoespacial: { alternancia: 0, cube: 0, clock: 1, total: 1 },
      Identificación: { "1": "Un camello.", "2": "León.", "3": "Reina serán.", total: 0 },
      Memoria: { responses: ["ROSA", "CLAVEL"], total: 1 },
      Atención: { activity1: 0, activity2: 0, activity3: null, total: 0 },
      Lenguaje: {
        totalScore: 0,
        activity1: {
          activityScore: 0,
          phraseAnswers: [
            { phraseIndex: 0, response: "El gato se esconde." },
            { phraseIndex: 1, response: "Espero que él entregue el mensaje una vez que ella se lo pida." },
          ],
        },
        activity2: { activityScore: 0, words: [] },
        total: 0,
      },
      Abstracción: {
        totalScore: 1,
        activity1: 0,
        activity2: 1,
        pairAnswers: [{ pairIndex: 0, input: "nada", correct: false }],
        total: 1,
      },
      RecuerdoDiferido: {
        totalScore: 0,
        spontaneousScore: 0,
        pairAnswers: {
          spontaneousAnswers: [],
          categoryAnswers: {},
          multipleChoiceAnswers: { rojo: "rojo" },
        },
        total: 0,
      },
      Orientación: {
        date: { day: "2", month: "marzo", year: "2023" },
        weekday: "sábado",
        location: "",
        total: 0,
      },
    };

    const totalScore = Object.values(simulatedScores).reduce(
      (sum, module) => sum + (module.total || 0),
      0
    );

    // Añadir un punto si tiene 12 años o menos de estudios y MoCA < 30
    let finalScore = totalScore;
    if (hasLessThan12YearsOfEducation && totalScore < 30) {
      finalScore += 1;
    }

    // Enviar datos simulados al backend
    try {
      // Guardar los resultados simulados de MoCA
      const savedRecord = await createMocaSelf({
        patientId: selectedPatient._id,
        patientName: selectedPatient.user?.name || "Paciente Desconocido",
        modulesData: simulatedScores,
        totalScore: finalScore,
        hasLessThan12YearsOfEducation,
      }).unwrap();

      alert("Resultados simulados guardados exitosamente.");

      // Actualizar el campo mocaAssigned a false
      await updatePatient({ id: selectedPatient._id, mocaAssigned: false }).unwrap();
      alert("Estado de MOCA actualizado correctamente.");

      // Redirigir a la pantalla final de MoCA
      navigate(`/moca-final/${savedRecord._id}`);
    } catch (err) {
      console.error("Error al guardar resultados simulados:", err);
      alert("Hubo un error al guardar los resultados simulados. Por favor, intenta nuevamente.");
    }
  };

  // Función para hablar instrucciones
  const speakInstructions = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onstart = () => setIsSpeakingInstructions(true);
      utterance.onend = () => setIsSpeakingInstructions(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Tu navegador no soporta la síntesis de voz.");
    }
  };

  // Funciones para manejar el micrófono
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [isSpeakingInstructions, setIsSpeakingInstructions] = useState(false);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleStartListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      setShowButtons(true);
    };

    recognition.onerror = (event) => {
      console.error("Error en reconocimiento de voz:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  const handleStopListening = () => {
    window.speechSynthesis.cancel();
    setListening(false);
  };

  const handleConfirmWord = () => {
    // Aquí puedes manejar la confirmación de la palabra
    setShowButtons(false);
  };

  const handleRetry = () => {
    setTranscript("");
    setShowButtons(false);
    handleStartListening();
  };

  const handleSpeakModuleInstructions = (moduleName) => {
    const instructions = `Instrucciones para ${moduleName}: Por favor, sigue las indicaciones para completar esta actividad.`;
    speakInstructions(instructions);
  };

  const handleTestDescription = () => {
    const description =
      "La prueba MoCA es una evaluación breve diseñada para detectar deterioro cognitivo leve. Está dividida en varios módulos, cada uno con actividades específicas que evalúan diferentes aspectos de la función cognitiva, como la memoria, la atención, el lenguaje y la orientación.";
    speakInstructions(description);
  };

  return (
    <Container className="moca-container my-5">
      {!testStarted ? (
        <div className="instructions-container">
          <Row>
            {/* Columna izquierda: Instrucciones y descripción */}
            <Col md={6} className="instructions-text">
              <h2>Instrucciones para la Prueba MoCA</h2>
              <Button
                variant="link"
                onClick={handleTestDescription}
                disabled={isSpeakingInstructions}
                className="mb-3 text-decoration-none"
                style={{ whiteSpace: "nowrap", minWidth: "180px" }}
              >
                {isSpeakingInstructions ? <FaStop /> : <FaPlay />} Escuchar Instrucciones
              </Button>
              <p style={{ textAlign: "justify" }}>
                Bienvenido a la Evaluación Cognitiva Montreal (MoCA). Esta prueba está dividida en
                varios módulos, y cada módulo consta de diferentes actividades. Por favor, sigue las
                instrucciones de cada actividad cuidadosamente. En ciertas actividades, tendrás
                que dar respuestas habladas o escritas. Asegúrate de tener tu micrófono funcionando
                correctamente antes de iniciar la prueba.
              </p>
              {/* Checkbox para años de educación */}
              <Form.Group controlId="educationCheckbox" className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="¿Tiene 12 años o menos de estudios? (Por ejemplo, educación primaria, secundaria, etc.)"
                  checked={hasLessThan12YearsOfEducation}
                  onChange={(e) => setHasLessThan12YearsOfEducation(e.target.checked)}
                />
              </Form.Group>
              {selectedPatient && (
                <>
                  <p>
                    <strong>Paciente:</strong> {selectedPatient.user?.name}
                  </p>
                  <p>
                    <strong>ID del Paciente:</strong> {selectedPatient._id}
                  </p>
                </>
              )}
            </Col>

            {/* Columna derecha: Audio y micrófono */}
            <Col md={6} className="microphone-test">
              <h4>Prueba de Audio y Micrófono</h4>
              <p>Utiliza estos botones para asegurarte de que tu audio y micrófono funcionan correctamente.</p>
              {/* Botón Escuchar */}
              <Button
                variant="link"
                onClick={() => speakInstructions("Esta es una prueba de audio.")}
                disabled={isSpeakingInstructions}
                className="instruction-button mb-3 text-decoration-none"
                style={{ whiteSpace: "nowrap", minWidth: "180px" }}
              >
                {isSpeakingInstructions ? <FaStop /> : <FaPlay />} Escuchar
              </Button>
              {/* Botón Hablar */}
              <div className="d-flex flex-column align-items-center">
                {listening ? (
                  <div className="d-flex flex-column align-items-center mb-3">
                    <Spinner animation="grow" variant="primary" className="mb-2" />
                    <p>Escuchando...</p>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleStartListening}
                    className="instruction-button mb-3"
                    style={{ minWidth: "180px" }}
                  >
                    <FaMicrophone className="me-2" />
                    Hablar
                  </Button>
                )}
              </div>
              {/* Mostrar botones de confirmación si hay transcript */}
              {showButtons && (
                <div className="mt-3">
                  <Alert variant="secondary">
                    <p>¿Es correcta su palabra?</p>
                    <strong>{transcript}</strong>
                  </Alert>
                  <Row>
                    <Col className="d-flex justify-content-start">
                      <Button variant="warning" onClick={handleRetry}>
                        Reintentar
                      </Button>
                    </Col>
                    <Col className="d-flex justify-content-end">
                      <Button variant="success" onClick={handleConfirmWord}>
                        Sí
                      </Button>
                    </Col>
                  </Row>
                </div>
              )}
              {/* Animación de audio reproducido */}
              {isSpeakingInstructions && (
                <div className="d-flex align-items-center mt-3">
                  <Spinner animation="border" variant="info" className="me-2" />
                  <span>Reproduciendo audio...</span>
                </div>
              )}
            </Col>
          </Row>

          {/* Botón "Iniciar Prueba" centrado y verde suave */}
          <div className="text-center mt-4">
            <Button
              variant="success"
              size="lg"
              onClick={handleStartTest}
              disabled={!selectedPatient}
              className="start-button"
            >
              Iniciar Prueba
            </Button>
            {!selectedPatient && (
              <Alert variant="warning" className="mt-3">
                Por favor, selecciona un paciente para iniciar la prueba.
              </Alert>
            )}
          </div>
        </div>
      ) : (
        <>
          <h3 className="module-title text-center mb-4">
            {MODULES[currentModuleIndex].icon} {MODULES[currentModuleIndex].name}
            <Button
              variant="link"
              onClick={() =>
                handleSpeakModuleInstructions(MODULES[currentModuleIndex].name)
              }
              disabled={isSpeakingInstructions}
              className="ms-3 text-decoration-none"
              style={{ whiteSpace: "nowrap", minWidth: "180px" }}
            >
              {isSpeakingInstructions ? <FaStop /> : <FaPlay />} Escuchar Instrucciones
            </Button>
          </h3>

          <div className="module-container border p-4 mb-4">
            <Row>
              <Col>
                <CurrentModuleComponent
                  onComplete={(score, activityScores) =>
                    handleCompleteModule(
                      currentModuleIndex,
                      score,
                      activityScores
                    )
                  }
                  onPrevious={handlePreviousModule}
                  isFirstModule={currentModuleIndex === 0}
                />
              </Col>
            </Row>
          </div>

          <hr className="my-4" />

          <div className="progress-container mb-4">
            <h5>Tiempo transcurrido: {formatTime(timeElapsed)}</h5>
            <h5>Puntaje Actual: {currentScore}</h5>
            <ProgressBar
              now={
                ((selectedModuleIndex !== null
                  ? 1
                  : currentModuleIndex + 1) /
                  MODULES.length) *
                100
              }
              label={`${
                selectedModuleIndex !== null
                  ? 1
                  : currentModuleIndex + 1
              } / ${MODULES.length}`}
              className="mb-3"
            />
            <div className="module-status">
              {MODULES.map((module, index) => (
                <span
                  key={module.id}
                  className={`module-dot ${
                    index < currentModuleIndex ||
                    index === selectedModuleIndex
                      ? "completed"
                      : "pending"
                  }`}
                ></span>
              ))}
            </div>
          </div>

          <pre className="mt-4">
            <strong>Puntajes por Módulo y Respuestas:</strong>
            {Object.entries(individualScores).map(([moduleName, scores]) => (
              <div key={moduleName}>
                <strong>{moduleName}:</strong> {JSON.stringify(scores)}
              </div>
            ))}
          </pre>

          <div className="mt-5">
            <h4 className="text-center">Selecciona un Módulo para Probar:</h4>
            <ListGroup horizontal className="flex-wrap justify-content-center">
              {MODULES.map((module, index) => (
                <ListGroup.Item key={module.id} className="m-2">
                  <Button
                    variant={
                      index === currentModuleIndex ||
                      index === selectedModuleIndex
                        ? "primary"
                        : "outline-primary"
                    }
                    onClick={() => handleSelectModule(index)}
                  >
                    {module.icon} {module.name}
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>

          {/* Botón para guardar resultados reales, visible solo cuando el test está completado */}
          {testCompleted && (
            <Row className="mt-4">
              <Col className="d-flex justify-content-end">
                <Button
                  variant="success"
                  onClick={handleSaveResults}
                  disabled={isSaving || isUpdatingPatient}
                  size="lg"
                >
                  {isSaving || isUpdatingPatient ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Resultados"
                  )}
                </Button>
              </Col>
            </Row>
          )}

          {/* Botón adicional para simular y guardar resultados */}
          <Row className="mt-4">
            <Col className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={handleSimulateAndSaveResults}
                disabled={isSaving || testCompleted || isUpdatingPatient}
                size="lg"
              >
                {isSaving || isUpdatingPatient ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Simulando...
                  </>
                ) : (
                  "Simular y Guardar Resultados"
                )}
              </Button>
            </Col>
          </Row>

          {/* Mensajes de éxito o error al guardar */}
          {isSuccess && (
            <Alert variant="success" className="mt-3 text-center">
              Resultados guardados exitosamente.
            </Alert>
          )}
          {isError && (
            <Alert variant="danger" className="mt-3 text-center">
              {saveError?.data?.error || "Hubo un error al guardar los resultados."}
            </Alert>
          )}
          {isUpdateSuccess && (
            <Alert variant="success" className="mt-3 text-center">
              Estado de MOCA actualizado correctamente.
            </Alert>
          )}
          {isUpdateError && (
            <Alert variant="danger" className="mt-3 text-center">
              {updateError?.data?.error || "Hubo un error al actualizar el estado de MOCA."}
            </Alert>
          )}
        </>
      )}
    </Container>
  );
};

export default MocaStartSelf;
