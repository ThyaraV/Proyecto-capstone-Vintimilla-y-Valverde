// frontend/src/screens/MocaStart.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetPatientsQuery } from '../slices/patientApiSlice';
import { Button, Container, Form, ListGroup } from 'react-bootstrap';

const MocaStart = () => {
  const { id } = useParams(); // Obtener el ID del paciente de la URL
  const { data: patients = [] } = useGetPatientsQuery();
  const selectedPatient = patients.find((patient) => patient._id === id);

  const [testStarted, setTestStarted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [extraPoint, setExtraPoint] = useState(0);

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handleScoreChange = (points) => {
    setTotalScore((prevScore) => prevScore + points);
  };

  const handleEducationChange = (years) => {
    setExtraPoint(years === "less" ? 1 : 0);
  };

  return (
    <Container className="my-5">
      <h1>Evaluación Cognitiva Montreal (MoCA)</h1>
      
      {selectedPatient ? (
        <>
          {/* Información del paciente */}
          <p><strong>Paciente:</strong> {selectedPatient.user?.name || "Paciente sin nombre"}</p>

          {/* Instrucciones */}
          <div className="instructions my-4">
            <h4>Instrucciones</h4>
            <p>
              El test MoCA está diseñado para evaluar las disfunciones cognitivas leves. Siga las instrucciones cuidadosamente.
            </p>
          </div>

          {!testStarted ? (
            <Button variant="primary" onClick={handleStartTest}>
              Iniciar Test MoCA
            </Button>
          ) : (
            <div className="test-section mt-4">
              <h4>Test MoCA</h4>

              {/* Nivel de educación */}
              <ListGroup.Item>
                <strong>¿El paciente tiene más de 12 años de educación?</strong>
                <Form.Check
                  type="radio"
                  label="No (+1)"
                  name="education"
                  onChange={() => handleEducationChange("less")}
                />
                <Form.Check
                  type="radio"
                  label="Sí (0)"
                  name="education"
                  onChange={() => handleEducationChange("more")}
                />
              </ListGroup.Item>

              <ListGroup>
                {/* 1. Alternancia Conceptual */}
                <ListGroup.Item>
                  <h5>1. Alternancia Conceptual</h5>
                  <Form.Check
                    type="radio"
                    label="Secuencia correcta (+1)"
                    name="alternating"
                    onChange={() => handleScoreChange(1)}
                  />
                  <Form.Check
                    type="radio"
                    label="Incorrecto (0)"
                    name="alternating"
                    onChange={() => handleScoreChange(0)}
                  />
                </ListGroup.Item>

                {/* 2. Visuoespacial (Copia de cubo) */}
                <ListGroup.Item>
                  <h5>2. Copiar el cubo</h5>
                  <Form.Check
                    type="radio"
                    label="Correcto (+1)"
                    name="cube"
                    onChange={() => handleScoreChange(1)}
                  />
                  <Form.Check
                    type="radio"
                    label="Incorrecto (0)"
                    name="cube"
                    onChange={() => handleScoreChange(0)}
                  />
                </ListGroup.Item>

                {/* 3. Reloj */}
                <ListGroup.Item>
                  <h5>3. Dibujar un Reloj</h5>
                  <Form.Check
                    type="radio"
                    label="Contorno, números y agujas correctos (+3)"
                    name="clock"
                    onChange={() => handleScoreChange(3)}
                  />
                  <Form.Check
                    type="radio"
                    label="Dos de tres elementos correctos (+2)"
                    name="clock"
                    onChange={() => handleScoreChange(2)}
                  />
                  <Form.Check
                    type="radio"
                    label="Uno correcto (+1)"
                    name="clock"
                    onChange={() => handleScoreChange(1)}
                  />
                  <Form.Check
                    type="radio"
                    label="Incorrecto (0)"
                    name="clock"
                    onChange={() => handleScoreChange(0)}
                  />
                </ListGroup.Item>

                {/* 4. Nombres de animales */}
                {["León", "Rinoceronte", "Camello"].map((animal, index) => (
                  <ListGroup.Item key={index}>
                    <h5>{`4. Identificar: ${animal}`}</h5>
                    <Form.Check
                      type="radio"
                      label="Correcto (+1)"
                      name={`animal-${index}`}
                      onChange={() => handleScoreChange(1)}
                    />
                    <Form.Check
                      type="radio"
                      label="Incorrecto (0)"
                      name={`animal-${index}`}
                      onChange={() => handleScoreChange(0)}
                    />
                  </ListGroup.Item>
                ))}

                {/* 5. Atención - Series numéricas */}
                <ListGroup.Item>
                  <h5>5. Atención</h5>
                  <Form.Check
                    type="radio"
                    label="Secuencia correcta (+1)"
                    name="attention-sequence"
                    onChange={() => handleScoreChange(1)}
                  />
                  <Form.Check
                    type="radio"
                    label="Incorrecto (0)"
                    name="attention-sequence"
                    onChange={() => handleScoreChange(0)}
                  />
                </ListGroup.Item>

                {/* 6. Orientación */}
                <ListGroup.Item>
                  <h5>6. Orientación</h5>
                  {[6, 5, 4, 3, 2, 1, 0].map((points, index) => (
                    <Form.Check
                      key={index}
                      type="radio"
                      label={`${points} correctos (+${points})`}
                      name="orientation"
                      onChange={() => handleScoreChange(points)}
                    />
                  ))}
                </ListGroup.Item>
              </ListGroup>

              {/* Puntaje total */}
              <div className="mt-4">
                <h5>Puntaje Total: {totalScore + extraPoint}</h5>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Cargando datos del paciente....</p>
      )}
    </Container>
  );
};

export default MocaStart;
