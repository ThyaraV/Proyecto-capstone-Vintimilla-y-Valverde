// src/screens/MOCAmodules/MocaStartSelf.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Importar useNavigate
import { Button, Container, ProgressBar, Row, Col, ListGroup, Alert, Spinner } from "react-bootstrap";
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
import "../assets/styles/MocaTest.css";

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
  const navigate = useNavigate(); // Inicializar useNavigate
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

  // Hook para la mutación de crear MoCA Self
  const [createMocaSelf, { isLoading: isSaving, isSuccess, isError, error: saveError }] = useCreateMocaSelfMutation();

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
        setTestCompleted(true); // Marcar que el test ha finalizado
      }
    }
  };

  const handlePreviousModule = () => {
    if (selectedModuleIndex !== null) {
      setSelectedModuleIndex(null);
      setCurrentModuleIndex(currentModuleIndex - 1 >= 0 ? currentModuleIndex - 1 : 0);
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

    const mocaData = {
      patientId: selectedPatient._id,
      patientName: selectedPatient.user?.name || "Paciente Desconocido",
      modulesData: individualScores,
      totalScore: currentScore,
    };

    try {
      const savedRecord = await createMocaSelf(mocaData).unwrap(); // Enviar datos al backend
      alert("Resultados guardados exitosamente.");
      navigate(`/moca-final/${savedRecord._id}`); // Navegar a la pantalla final con el ID del registro
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

    // Enviar datos simulados al backend
    try {
      const savedRecord = await createMocaSelf({
        patientId: selectedPatient._id,
        patientName: selectedPatient.user?.name || "Paciente Desconocido",
        modulesData: simulatedScores,
        totalScore,
      }).unwrap();

      alert("Resultados simulados guardados exitosamente.");
      navigate(`/moca-final/${savedRecord._id}`); // Navegar a la pantalla final con el ID del registro
    } catch (err) {
      console.error("Error al guardar resultados simulados:", err);
      alert("Hubo un error al guardar los resultados simulados. Por favor, intenta nuevamente.");
    }
  };

  return (
    <Container className="moca-container my-5">
      {!testStarted ? (
        <div className="instructions-container text-center">
          <h2>Instrucciones para la Prueba MoCA</h2>
          <p>Por favor, siga las instrucciones y complete las actividades en cada sección.</p>
          {selectedPatient && (
            <>
              <p><strong>Paciente:</strong> {selectedPatient.user?.name}</p>
              <p><strong>ID del Paciente:</strong> {selectedPatient._id}</p>
            </>
          )}
          <Button variant="primary" onClick={handleStartTest}>
            Iniciar Prueba
          </Button>
        </div>
      ) : (
        <>
          <h3 className="module-title text-center mb-4">
            {MODULES[currentModuleIndex].icon} {MODULES[currentModuleIndex].name}
          </h3>

          <div className="module-container border p-4 mb-4">
            <Row>
              <Col>
                <CurrentModuleComponent
                  onComplete={(score, activityScores) =>
                    handleCompleteModule(currentModuleIndex, score, activityScores)
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
              now={((selectedModuleIndex !== null ? 1 : currentModuleIndex + 1) / MODULES.length) * 100}
              label={`${selectedModuleIndex !== null ? 1 : currentModuleIndex + 1} / ${MODULES.length}`}
              className="mb-3"
            />
            <div className="module-status">
              {MODULES.map((module, index) => (
                <span
                  key={module.id}
                  className={`module-dot ${
                    index < currentModuleIndex || index === selectedModuleIndex ? "completed" : "pending"
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
                      index === currentModuleIndex || index === selectedModuleIndex
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
                  disabled={isSaving}
                >
                  {isSaving ? (
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
                disabled={isSaving || testCompleted}
              >
                {isSaving ? (
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
        </>
      )}
    </Container>
  );
};

export default MocaStartSelf;
