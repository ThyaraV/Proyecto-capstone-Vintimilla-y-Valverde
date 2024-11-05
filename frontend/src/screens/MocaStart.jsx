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

  const handleStartTest = () => {
    setTestStarted(true);
  };

  // Función para actualizar el puntaje en tiempo real
  const handleScoreChange = (points) => {
    setTotalScore((prevScore) => prevScore + points);
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
              rhoncus, urna a vulputate commodo, neque risus gravida libero, eu
              congue est erat eu ante. Pellentesque eget augue sit amet erat
              suscipit gravida ut sit amet lorem.
            </p>
          </div>

          {/* Botón para iniciar el test */}
          {!testStarted ? (
            <Button variant="primary" onClick={handleStartTest}>
              Iniciar Test MoCA
            </Button>
          ) : (
            <div className="test-section mt-4">
              <h4>Sección de Test MoCA</h4>

              {/* Test completo */}
              <ListGroup>

                {/* Educación */}
                <ListGroup.Item>
                  <strong>¿El paciente tiene más de 12 años de educación?</strong>
                  <Form.Check
                    type="radio"
                    label="No (+1)"
                    name="education"
                    onChange={() => handleScoreChange(1)}
                  />
                  <Form.Check
                    type="radio"
                    label="Sí (0)"
                    name="education"
                    onChange={() => handleScoreChange(0)}
                  />
                </ListGroup.Item>

                {/* Visuoespacial / Ejecutiva */}
                <ListGroup.Item>
                  <strong>Rastrear el diagrama</strong>
                  <Form.Check
                    type="radio"
                    label="Completado correctamente (+1)"
                    name="diagram"
                    onChange={() => handleScoreChange(1)}
                  />
                  <Form.Check
                    type="radio"
                    label="No completado correctamente (0)"
                    name="diagram"
                    onChange={() => handleScoreChange(0)}
                  />
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Copiar el cubo</strong>
                  <Form.Check
                    type="radio"
                    label="Completado correctamente (+1)"
                    name="cube"
                    onChange={() => handleScoreChange(1)}
                  />
                  <Form.Check
                    type="radio"
                    label="No completado correctamente (0)"
                    name="cube"
                    onChange={() => handleScoreChange(0)}
                  />
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Dibujar un reloj (Once y diez)</strong>
                  <Form.Check
                    type="radio"
                    label="Correcto en contorno, números y agujas (+3)"
                    name="clock"
                    onChange={() => handleScoreChange(3)}
                  />
                  <Form.Check
                    type="radio"
                    label="Correcto en dos de tres elementos (+2)"
                    name="clock"
                    onChange={() => handleScoreChange(2)}
                  />
                  <Form.Check
                    type="radio"
                    label="Solo contorno (+1)"
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

                {/* Nombres */}
                <ListGroup.Item>
                  <strong>Nombre del animal: León</strong>
                  <Form.Check
                    type="radio"
                    label="Identificado correctamente (+1)"
                    name="lion"
                    onChange={() => handleScoreChange(1)}
                  />
                  <Form.Check
                    type="radio"
                    label="No identificado (0)"
                    name="lion"
                    onChange={() => handleScoreChange(0)}
                  />
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Nombre del animal: Rinoceronte</strong>
                  <Form.Check
                    type="radio"
                    label="Identificado correctamente (+1)"
                    name="rhino"
                    onChange={() => handleScoreChange(1)}
                  />
                  <Form.Check
                    type="radio"
                    label="No identificado (0)"
                    name="rhino"
                    onChange={() => handleScoreChange(0)}
                  />
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Nombre del animal: Camello</strong>
                  <Form.Check
                    type="radio"
                    label="Identificado correctamente (+1)"
                    name="camel"
                    onChange={() => handleScoreChange(1)}
                  />
                  <Form.Check
                    type="radio"
                    label="No identificado (0)"
                    name="camel"
                    onChange={() => handleScoreChange(0)}
                  />
                </ListGroup.Item>

                {/* Agregar el resto de secciones del test aquí, siguiendo el formato */}
                
                {/* Orientación */}
                <ListGroup.Item>
                  <strong>¿Fecha completa?</strong>
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

              {/* Puntaje total en tiempo real */}
              <div className="mt-4">
                <h5>Puntaje Total: {totalScore}</h5>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Cargando datos del paciente...</p>
      )}
    </Container>
  );
};

export default MocaStart;
