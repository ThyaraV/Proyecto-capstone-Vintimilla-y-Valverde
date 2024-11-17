import React, { useState } from "react";
import { Button, Row, Col } from "react-bootstrap";

const Visuoespacial = ({ onComplete, onPrevious, isFirstModule }) => {
  // Estado para almacenar los puntajes de las actividades
  const [diagramScore, setDiagramScore] = useState(null);
  const [cubeScore, setCubeScore] = useState(null);
  const [clockScore, setClockScore] = useState(null);

  // Función para manejar el puntaje y avanzar al siguiente módulo
  const handleNext = () => {
    // Calcular el puntaje total del módulo sumando los puntajes de las actividades
    const totalScore = (diagramScore || 0) + (cubeScore || 0) + (clockScore || 0);

    // Enviar puntajes individuales y puntaje total al MocaStartSelf.jsx
    onComplete(
      totalScore, // Puntaje total del módulo
      {
        diagram: diagramScore,
        cube: cubeScore,
        clock: clockScore,
      }
    );
  };

  return (
    <div className="module-container">
      {/* Actividad 1: Diagrama */}
      <Row className="justify-content-center mt-3">
        <Col md={8} className="d-flex flex-column">
          <p className="instructions-text">
            Pida al paciente que trace el diagrama en orden | Seguimiento visual | Precisión
          </p>
          <Button
            variant={diagramScore === 1 ? "success" : "outline-success"}
            className={`toggle-button ${diagramScore === 1 ? "active" : ""} mb-2`}
            onClick={() => setDiagramScore(1)}
          >
            Completado correctamente +1
          </Button>
          <Button
            variant={diagramScore === 0 ? "danger" : "outline-danger"}
            className={`toggle-button ${diagramScore === 0 ? "active" : ""}`}
            onClick={() => setDiagramScore(0)}
          >
            No completado correctamente 0
          </Button>
        </Col>
      </Row>

      {/* Actividad 2: Copiar el cubo */}
      <Row className="justify-content-center mt-4">
        <Col md={8} className="d-flex flex-column">
          <p className="instructions-text">Pida al paciente que copie el cubo</p>
          <Button
            variant={cubeScore === 1 ? "success" : "outline-success"}
            className={`toggle-button ${cubeScore === 1 ? "active" : ""} mb-2`}
            onClick={() => setCubeScore(1)}
          >
            Completado correctamente +1
          </Button>
          <Button
            variant={cubeScore === 0 ? "danger" : "outline-danger"}
            className={`toggle-button ${cubeScore === 0 ? "active" : ""}`}
            onClick={() => setCubeScore(0)}
          >
            No completado correctamente 0
          </Button>
        </Col>
      </Row>

      {/* Actividad 3: Dibujo del reloj */}
      <Row className="justify-content-center mt-4">
        <Col md={8} className="d-flex flex-column">
          <p className="instructions-text">
            Pida al paciente que dibuje un reloj (diez y diez)
          </p>
          <Button
            variant={clockScore === 3 ? "success" : "outline-success"}
            className={`toggle-button ${clockScore === 3 ? "active" : ""} mb-2`}
            onClick={() => setClockScore(3)}
          >
            Dibujo correctamente todas las características +3
          </Button>
          <Button
            variant={clockScore === 2 ? "primary" : "outline-primary"}
            className={`toggle-button ${clockScore === 2 ? "active" : ""} mb-2`}
            onClick={() => setClockScore(2)}
          >
            Dibujo correctamente dos de tres características +2
          </Button>
          <Button
            variant={clockScore === 1 ? "warning" : "outline-warning"}
            className={`toggle-button ${clockScore === 1 ? "active" : ""} mb-2`}
            onClick={() => setClockScore(1)}
          >
            Dibujo correctamente solo una característica +1
          </Button>
          <Button
            variant={clockScore === 0 ? "danger" : "outline-danger"}
            className={`toggle-button ${clockScore === 0 ? "active" : ""}`}
            onClick={() => setClockScore(0)}
          >
            Ninguna de las anteriores 0
          </Button>
        </Col>
      </Row>

      {/* Botones para continuar y regresar */}
      <div className="d-flex justify-content-between mt-4">
        {/* Botón de Regresar */}
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={isFirstModule}
        >
          Regresar
        </Button>

        {/* Botón de Continuar */}
        <Button
          variant="success"
          onClick={handleNext}
          disabled={diagramScore === null || cubeScore === null || clockScore === null}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Visuoespacial;
