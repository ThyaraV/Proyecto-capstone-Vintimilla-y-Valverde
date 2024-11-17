import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Container, ProgressBar, Row, Col } from "react-bootstrap";
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
    setModuleScores((prevModuleScores) => ({
      ...prevModuleScores,
      [moduleId]: moduleScore,
    }));

    const newCurrentScore = Object.values({
      ...moduleScores,
      [moduleId]: moduleScore,
    }).reduce((sum, score) => sum + score, 0);

    setCurrentScore(newCurrentScore);

    setIndividualScores((prevScores) => ({
      ...prevScores,
      [MODULES[moduleId].name]: { ...activityScores, total: moduleScore },
    }));

    if (currentModuleIndex < MODULES.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    } else {
      alert(`¡Prueba completada! Puntaje final: ${newCurrentScore}`);
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  const CurrentModuleComponent = MODULES[currentModuleIndex].component;

  return (
    <Container className="moca-container my-5">
      {!testStarted ? (
        <div className="instructions-container">
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
          <h3 className="module-title">
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

          <div className="progress-container">
            <h5>Tiempo transcurrido: {formatTime(timeElapsed)}</h5>
            <h5>Puntaje Actual: {currentScore}</h5>
            <ProgressBar
              now={(currentModuleIndex / MODULES.length) * 100}
              label={`${currentModuleIndex + 1} / ${MODULES.length}`}
            />
            <div className="module-status">
              {MODULES.map((module, index) => (
                <span
                  key={module.id}
                  className={`module-dot ${
                    index <= currentModuleIndex ? "completed" : "pending"
                  }`}
                ></span>
              ))}
            </div>
          </div>

          {/* Mostrar los puntajes individuales para depuración */}
          <pre className="mt-4">
            <strong>Puntajes por Módulo:</strong>
            {Object.entries(individualScores).map(([moduleName, scores]) => (
              <div key={moduleName}>
                <strong>{moduleName}:</strong> {JSON.stringify(scores)}
              </div>
            ))}
          </pre>
        </>
      )}
    </Container>
  );
};

export default MocaStartSelf;
