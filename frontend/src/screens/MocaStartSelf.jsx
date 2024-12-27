// src/screens/MOCAmodules/MocaStartSelf.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Container, ProgressBar, Row, Col, ListGroup } from "react-bootstrap";
import { useGetPatientsQuery } from "../slices/patientApiSlice";
import { useMoca } from "../context/MocaContext";
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
  const { data: patients = [] } = useGetPatientsQuery();
  const selectedPatient = patients.find((patient) => patient._id === id);

  const { totalScore, updateScore } = useMoca();
  const [testStarted, setTestStarted] = useState(false);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [individualScores, setIndividualScores] = useState({});
  const [moduleScores, setModuleScores] = useState({});
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(null);

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
      [moduleId]: moduleScore,
    }));

    // Calcular puntaje actual
    const newCurrentScore = Object.values({
      ...moduleScores,
      [moduleId]: moduleScore,
    }).reduce((sum, score) => sum + score, 0);

    setCurrentScore(newCurrentScore);

    // Guardar respuestas del modulo actual
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
        alert(`¡Prueba completada! Puntaje final: ${newCurrentScore}`);
        // Aquí podrías mandar todo a un backend o guardar los resultados
        // individualScores contiene todas las respuestas y puntajes por módulo.
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
        </>
      )}
    </Container>
  );
};

export default MocaStartSelf;
