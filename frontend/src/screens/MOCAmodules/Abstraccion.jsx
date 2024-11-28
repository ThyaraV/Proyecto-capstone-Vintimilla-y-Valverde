import React, { useState } from "react";
import { Button, Row, Col } from "react-bootstrap";

const TemplateModule = ({ onComplete, onPrevious, isFirstModule }) => {
  // Estados para almacenar los puntajes de las actividades
  const [activity1Score, setActivity1Score] = useState(null);
  const [activity2Score, setActivity2Score] = useState(null);
  const [activity3Score, setActivity3Score] = useState(null);

  // Función para calcular el puntaje total del módulo y avanzar al siguiente
  const handleNext = () => {
    const totalScore = (activity1Score || 0) + (activity2Score || 0) + (activity3Score || 0);
    onComplete(
      totalScore,
      {
        activity1: activity1Score,
        activity2: activity2Score,
        activity3: activity3Score,
      }
    );
  };

  return (
    <div className="module-container">
      {/* Actividad 1 */}
      <Row className="justify-content-center mt-3">
        <Col md={8} className="d-flex flex-column">
          <p className="instructions-text">Instrucción para la actividad 1</p>
          <Button
            variant={activity1Score === 1 ? "success" : "outline-success"}
            className={`toggle-button ${activity1Score === 1 ? "active" : ""} mb-2`}
            onClick={() => setActivity1Score(1)}
          >
            Completado correctamente +1
          </Button>
          <Button
            variant={activity1Score === 0 ? "danger" : "outline-danger"}
            className={`toggle-button ${activity1Score === 0 ? "active" : ""}`}
            onClick={() => setActivity1Score(0)}
          >
            No completado correctamente 0
          </Button>
        </Col>
      </Row>

      {/* Actividad 2 */}
      <Row className="justify-content-center mt-4">
        <Col md={8} className="d-flex flex-column">
          <p className="instructions-text">Instrucción para la actividad 2</p>
          <Button
            variant={activity2Score === 1 ? "success" : "outline-success"}
            className={`toggle-button ${activity2Score === 1 ? "active" : ""} mb-2`}
            onClick={() => setActivity2Score(1)}
          >
            Completado correctamente +1
          </Button>
          <Button
            variant={activity2Score === 0 ? "danger" : "outline-danger"}
            className={`toggle-button ${activity2Score === 0 ? "active" : ""}`}
            onClick={() => setActivity2Score(0)}
          >
            No completado correctamente 0
          </Button>
        </Col>
      </Row>

      {/* Actividad 3 */}
      <Row className="justify-content-center mt-4">
        <Col md={8} className="d-flex flex-column">
          <p className="instructions-text">Instrucción para la actividad 3</p>
          <Button
            variant={activity3Score === 2 ? "success" : "outline-success"}
            className={`toggle-button ${activity3Score === 2 ? "active" : ""} mb-2`}
            onClick={() => setActivity3Score(2)}
          >
            Completado correctamente +2
          </Button>
          <Button
            variant={activity3Score === 0 ? "danger" : "outline-danger"}
            className={`toggle-button ${activity3Score === 0 ? "active" : ""}`}
            onClick={() => setActivity3Score(0)}
          >
            No completado correctamente 0
          </Button>
        </Col>
      </Row>

      {/* Botones para continuar y regresar */}
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={isFirstModule}
        >
          Regresar
        </Button>

        <Button
          variant="success"
          onClick={handleNext}
          disabled={activity1Score === null || activity2Score === null || activity3Score === null}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default TemplateModule;
