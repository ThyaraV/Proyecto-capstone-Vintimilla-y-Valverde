import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetPatientsQuery } from "../slices/patientApiSlice";
import { Button, Container, Form, ListGroup, Row, Col } from "react-bootstrap";
import "../assets/styles/MocaTest.css";

const MocaStart = () => {
  const { id } = useParams();
  const { data: patients = [] } = useGetPatientsQuery();
  const selectedPatient = patients.find((patient) => patient._id === id);

  const [testStarted, setTestStarted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [extraPoint, setExtraPoint] = useState(0);

  // Puntajes independientes para cada ítem de "Visuoespacial/Ejecutivo"
  const [diagramScore, setDiagramScore] = useState(null);
  const [cubeScore, setCubeScore] = useState(null);
  const [clockScore, setClockScore] = useState(null);

  const [lionScore, setLionScore] = useState(null);
  const [rhinoScore, setRhinoScore] = useState(null);
  const [camelScore, setCamelScore] = useState(null);

  const [memoryScore, setMemoryScore] = useState(null);
  const [digitsForwardScore, setDigitsForwardScore] = useState(null);
  const [digitsBackwardScore, setDigitsBackwardScore] = useState(null);
  const [letterTapScore, setLetterTapScore] = useState(null);
  const [serialSubtractionScore, setSerialSubtractionScore] = useState(null);

  const [sentence1Score, setSentence1Score] = useState(null);
  const [sentence2Score, setSentence2Score] = useState(null);
  const [wordsFScore, setWordsFScore] = useState(null);
  const [abstraction1Score, setAbstraction1Score] = useState(null);
  const [abstraction2Score, setAbstraction2Score] = useState(null);

  const [delayedRecallScore, setDelayedRecallScore] = useState(null);
const [orientationScore, setOrientationScore] = useState(null);


  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handleEducationChange = (years) => {
    setExtraPoint(years === "less" ? 1 : 0);
  };

  const handleScoreChange = (score, setScore) => {
    setScore(score);
  };

  // Actualizar el puntaje total cada vez que cambian los puntajes individuales
  useEffect(() => {
    const currentScore =
      extraPoint +
      (diagramScore || 0) +
      (cubeScore || 0) +
      (clockScore || 0) +
      (lionScore || 0) +
      (rhinoScore || 0) +
      (camelScore || 0) +
      (memoryScore || 0) +
      (digitsForwardScore || 0) +
      (digitsBackwardScore || 0) +
      (letterTapScore || 0) +
      (serialSubtractionScore || 0) +
      (sentence1Score || 0) +
      (sentence2Score || 0) +
      (wordsFScore || 0) +
      (abstraction1Score || 0) +
      (abstraction2Score || 0) +
      (delayedRecallScore || 0) +
      (orientationScore || 0);
  
    setTotalScore(currentScore);
  }, [
    extraPoint,
    diagramScore,
    cubeScore,
    clockScore,
    lionScore,
    rhinoScore,
    camelScore,
    memoryScore,
    digitsForwardScore,
    digitsBackwardScore,
    letterTapScore,
    serialSubtractionScore,
    sentence1Score,
    sentence2Score,
    wordsFScore,
    abstraction1Score,
    abstraction2Score,
    delayedRecallScore,
    orientationScore,
  ]);
  

  return (
    <Container className="my-5">
      <h1>Evaluación Cognitiva Montreal (MoCA)</h1>
      <p>
        Pantalla de detección para deterioro cognitivo leve y enfermedad de
        Alzheimer.
      </p>

      {selectedPatient ? (
        <>
          <p>
            <strong>Paciente:</strong>{" "}
            {selectedPatient.user?.name || "Paciente sin nombre"}
          </p>

          <div className="instructions my-4">
            <h4>Instrucciones</h4>
            <p>
              El test MoCA está diseñado para evaluar las disfunciones
              cognitivas leves. Siga las instrucciones cuidadosamente.
            </p>
          </div>

          {!testStarted ? (
            <Button variant="primary" onClick={handleStartTest}>
              Iniciar Test MoCA
            </Button>
          ) : (
            <div className="test-section mt-4">
              {/* Pregunta sobre educación */}
              <ListGroup.Item>
                <Row>
                  <Col md={8}>
                    <strong>
                      ¿El paciente tiene más de 12 años de educación?
                    </strong>
                    <p className="text-muted">
                      No incluya los años de jardín de infantes
                    </p>
                  </Col>
                  <Col md={4} className="d-flex align-items-center">
                    <Form.Check
                      inline
                      type="radio"
                      label="No +1"
                      name="education"
                      onChange={() => handleEducationChange("less")}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Sí 0"
                      name="education"
                      onChange={() => handleEducationChange("more")}
                    />
                  </Col>
                </Row>
              </ListGroup.Item>

              {/* Sección Visuoespacial/Ejecutivo */}
              <div className="section-title">Visuoespacial/Ejecutivo</div>

              {/* Diagrama */}
              <Row className="justify-content-center mt-3">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Pida al paciente que trace el diagrama en orden |
                    Seguimiento visual | Precisión
                  </p>
                  <Button
                    variant={diagramScore === 1 ? "success" : "outline-success"}
                    className={`toggle-button ${
                      diagramScore === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setDiagramScore)}
                  >
                    Completado correctamente +1
                  </Button>
                  <Button
                    variant={diagramScore === 0 ? "danger" : "outline-danger"}
                    className={`toggle-button ${
                      diagramScore === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setDiagramScore)}
                  >
                    No completado correctamente 0
                  </Button>
                </Col>
              </Row>

              {/* Copiar el cubo */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Pida al paciente que copie el cubo
                  </p>
                  <Button
                    variant={cubeScore === 1 ? "success" : "outline-success"}
                    className={`toggle-button ${
                      cubeScore === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setCubeScore)}
                  >
                    Completado correctamente +1
                  </Button>
                  <Button
                    variant={cubeScore === 0 ? "danger" : "outline-danger"}
                    className={`toggle-button ${
                      cubeScore === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setCubeScore)}
                  >
                    No completado correctamente 0
                  </Button>
                </Col>
              </Row>

              {/* Dibujo del reloj */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Pida al paciente que dibuje un reloj (diez y diez)
                  </p>
                  <Button
                    variant={clockScore === 3 ? "success" : "outline-success"}
                    className={`toggle-button ${
                      clockScore === 3 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(3, setClockScore)}
                  >
                    Dibujo correctamente todas las características +3
                  </Button>
                  <Button
                    variant={clockScore === 2 ? "primary" : "outline-primary"}
                    className={`toggle-button ${
                      clockScore === 2 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(2, setClockScore)}
                  >
                    Dibujo correctamente dos de tres características +2
                  </Button>
                  <Button
                    variant={clockScore === 1 ? "warning" : "outline-warning"}
                    className={`toggle-button ${
                      clockScore === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setClockScore)}
                  >
                    Dibujo correctamente solo una característica +1
                  </Button>
                  <Button
                    variant={clockScore === 0 ? "danger" : "outline-danger"}
                    className={`toggle-button ${
                      clockScore === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setClockScore)}
                  >
                    Ninguna de las anteriores 0
                  </Button>
                </Col>
              </Row>

              {/* Sección Naming */}
              <div className="section-title">Denominación</div>

              {/* Primera Imagen - León */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column align-items-center">
                  <img
                    src="https://via.placeholder.com/200"
                    alt="León"
                    className="mb-3"
                  />
                  <p className="instructions-text">
                    Pida al paciente que nombre el primer animal
                  </p>
                  <Button
                    variant={lionScore === 1 ? "success" : "outline-success"}
                    className={`toggle-button ${
                      lionScore === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setLionScore)}
                  >
                    Nombró "león" correctamente +1
                  </Button>
                  <Button
                    variant={lionScore === 0 ? "danger" : "outline-danger"}
                    className={`toggle-button ${
                      lionScore === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setLionScore)}
                  >
                    No nombró "león" correctamente 0
                  </Button>
                </Col>
              </Row>

              {/* Segunda Imagen - Rinoceronte */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column align-items-center">
                  <img
                    src="https://via.placeholder.com/200"
                    alt="Rinoceronte"
                    className="mb-3"
                  />
                  <p className="instructions-text">
                    Pida al paciente que nombre el segundo animal
                  </p>
                  <Button
                    variant={rhinoScore === 1 ? "success" : "outline-success"}
                    className={`toggle-button ${
                      rhinoScore === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setRhinoScore)}
                  >
                    Nombró "rinoceronte" correctamente +1
                  </Button>
                  <Button
                    variant={rhinoScore === 0 ? "danger" : "outline-danger"}
                    className={`toggle-button ${
                      rhinoScore === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setRhinoScore)}
                  >
                    No nombró "rinoceronte" correctamente 0
                  </Button>
                </Col>
              </Row>

              {/* Tercera Imagen - Camello */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column align-items-center">
                  <img
                    src="https://via.placeholder.com/200"
                    alt="Camello"
                    className="mb-3"
                  />
                  <p className="instructions-text">
                    Pida al paciente que nombre el tercer animal
                  </p>
                  <Button
                    variant={camelScore === 1 ? "success" : "outline-success"}
                    className={`toggle-button ${
                      camelScore === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setCamelScore)}
                  >
                    Nombró "camello" correctamente +1
                  </Button>
                  <Button
                    variant={camelScore === 0 ? "danger" : "outline-danger"}
                    className={`toggle-button ${
                      camelScore === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setCamelScore)}
                  >
                    No nombró "camello" correctamente 0
                  </Button>
                </Col>
              </Row>

              {/* Sección Memory */}
              <div className="section-title">Memoria</div>
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Lea las palabras "Cara", "Terciopelo", "Iglesia",
                    "Margarita", "Rojo" y pida al paciente que las repita (haga
                    dos intentos y una recuperación más tarde en el examen).
                  </p>
                  <Button
                    variant={memoryScore === 0 ? "success" : "outline-success"}
                    className={`toggle-button ${
                      memoryScore === 0 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(0, setMemoryScore)}
                  >
                    Completó ambos intentos correctamente
                  </Button>
                  <Button
                    variant={memoryScore === 0 ? "danger" : "outline-danger"}
                    className={`toggle-button ${
                      memoryScore === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setMemoryScore)}
                  >
                    No completó ambos intentos correctamente
                  </Button>
                </Col>
              </Row>

              {/* Sección Attention */}
              <div className="section-title">Atención</div>

              {/* Repetir dígitos en orden hacia adelante */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Lea la lista de dígitos (2, 1, 8, 5, 4) a un ritmo de 1
                    dígito/seg y pida al paciente que los repita en el mismo
                    orden
                  </p>
                  <Button
                    variant={
                      digitsForwardScore === 1 ? "success" : "outline-success"
                    }
                    className={`toggle-button ${
                      digitsForwardScore === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setDigitsForwardScore)}
                  >
                    Repitió correctamente +1
                  </Button>
                  <Button
                    variant={
                      digitsForwardScore === 0 ? "danger" : "outline-danger"
                    }
                    className={`toggle-button ${
                      digitsForwardScore === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setDigitsForwardScore)}
                  >
                    No repitió correctamente 0
                  </Button>
                </Col>
              </Row>

              {/* Repetir dígitos en orden inverso */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Lea la lista de dígitos (7, 4, 2) a un ritmo de 1 dígito/seg
                    y pida al paciente que los repita en orden inverso
                  </p>
                  <Button
                    variant={
                      digitsBackwardScore === 1 ? "success" : "outline-success"
                    }
                    className={`toggle-button ${
                      digitsBackwardScore === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setDigitsBackwardScore)}
                  >
                    Repitió correctamente +1
                  </Button>
                  <Button
                    variant={
                      digitsBackwardScore === 0 ? "danger" : "outline-danger"
                    }
                    className={`toggle-button ${
                      digitsBackwardScore === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setDigitsBackwardScore)}
                  >
                    No repitió correctamente 0
                  </Button>
                </Col>
              </Row>

              {/* Tap con la letra A */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Lea la lista de letras y pida al paciente que golpee con su
                    mano cada vez que escuche la letra "A": FBAC MNAA JKLB AFAK
                    DEAA AJAM OFAAB
                  </p>
                  <Button
                    variant={
                      letterTapScore === 1 ? "success" : "outline-success"
                    }
                    className={`toggle-button ${
                      letterTapScore === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setLetterTapScore)}
                  >
                    Menos de 2 errores +1
                  </Button>
                  <Button
                    variant={letterTapScore === 0 ? "danger" : "outline-danger"}
                    className={`toggle-button ${
                      letterTapScore === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setLetterTapScore)}
                  >
                    2 o más errores 0
                  </Button>
                </Col>
              </Row>

              {/* Sustracción serial de 7s */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Pida al paciente que reste 7 en serie comenzando desde 100;
                    el paciente debería decir: 93, 86, 79, 72, 65
                  </p>
                  <Button
                    variant={
                      serialSubtractionScore === 3
                        ? "success"
                        : "outline-success"
                    }
                    className={`toggle-button ${
                      serialSubtractionScore === 3 ? "active" : ""
                    } mb-2`}
                    onClick={() =>
                      handleScoreChange(3, setSerialSubtractionScore)
                    }
                  >
                    4 o 5 correctas +3
                  </Button>
                  <Button
                    variant={
                      serialSubtractionScore === 2
                        ? "primary"
                        : "outline-primary"
                    }
                    className={`toggle-button ${
                      serialSubtractionScore === 2 ? "active" : ""
                    } mb-2`}
                    onClick={() =>
                      handleScoreChange(2, setSerialSubtractionScore)
                    }
                  >
                    2 o 3 correctas +2
                  </Button>
                  <Button
                    variant={
                      serialSubtractionScore === 1
                        ? "warning"
                        : "outline-warning"
                    }
                    className={`toggle-button ${
                      serialSubtractionScore === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() =>
                      handleScoreChange(1, setSerialSubtractionScore)
                    }
                  >
                    1 correcta +1
                  </Button>
                  <Button
                    variant={
                      serialSubtractionScore === 0 ? "danger" : "outline-danger"
                    }
                    className={`toggle-button ${
                      serialSubtractionScore === 0 ? "active" : ""
                    }`}
                    onClick={() =>
                      handleScoreChange(0, setSerialSubtractionScore)
                    }
                  >
                    Ninguna correcta 0
                  </Button>
                </Col>
              </Row>

              {/* Sección Language */}
              <div className="section-title">Lenguaje</div>

              {/* Repetir frase 1 */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Lea y pida al paciente que repita: "Solo sé que John es el
                    que ayudará hoy"
                  </p>
                  <Button
                    variant={
                      sentence1Score === 1 ? "success" : "outline-success"
                    }
                    className={`toggle-button ${
                      sentence1Score === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setSentence1Score)}
                  >
                    Repitió correctamente +1
                  </Button>
                  <Button
                    variant={sentence1Score === 0 ? "danger" : "outline-danger"}
                    className={`toggle-button ${
                      sentence1Score === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setSentence1Score)}
                  >
                    No repitió correctamente 0
                  </Button>
                </Col>
              </Row>

              {/* Repetir frase 2 */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Lea y pida al paciente que repita: "El gato siempre se
                    escondía debajo del sofá cuando había perros en la
                    habitación"
                  </p>
                  <Button
                    variant={
                      sentence2Score === 1 ? "success" : "outline-success"
                    }
                    className={`toggle-button ${
                      sentence2Score === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setSentence2Score)}
                  >
                    Repitió correctamente +1
                  </Button>
                  <Button
                    variant={sentence2Score === 0 ? "danger" : "outline-danger"}
                    className={`toggle-button ${
                      sentence2Score === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setSentence2Score)}
                  >
                    No repitió correctamente 0
                  </Button>
                </Col>
              </Row>

              {/* Nombrar palabras con F */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Pida al paciente que nombre el mayor número de palabras en 1
                    minuto que comiencen con la letra "F"
                  </p>
                  <Button
                    variant={wordsFScore === 1 ? "success" : "outline-success"}
                    className={`toggle-button ${
                      wordsFScore === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setWordsFScore)}
                  >
                    Nombró ≥11 palabras +1
                  </Button>
                  <Button
                    variant={wordsFScore === 0 ? "danger" : "outline-danger"}
                    className={`toggle-button ${
                      wordsFScore === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setWordsFScore)}
                  >
                    Nombró &lt;11 palabras 0
                  </Button>
                </Col>
              </Row>

              {/* Sección Abstraction */}
              <div className="section-title">Abstracción</div>

              {/* Similaridad entre tren y bicicleta */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Pida al paciente que indique la similitud entre tren y
                    bicicleta (por ejemplo, ambos son medios de transporte)
                  </p>
                  <Button
                    variant={
                      abstraction1Score === 1 ? "success" : "outline-success"
                    }
                    className={`toggle-button ${
                      abstraction1Score === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setAbstraction1Score)}
                  >
                    Respondió correctamente +1
                  </Button>
                  <Button
                    variant={
                      abstraction1Score === 0 ? "danger" : "outline-danger"
                    }
                    className={`toggle-button ${
                      abstraction1Score === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setAbstraction1Score)}
                  >
                    No respondió correctamente 0
                  </Button>
                </Col>
              </Row>

              {/* Similaridad entre reloj y regla */}
              <Row className="justify-content-center mt-4">
                <Col md={8} className="d-flex flex-column">
                  <p className="instructions-text">
                    Pida al paciente que indique la similitud entre reloj y
                    regla (por ejemplo, ambos son herramientas de medición)
                  </p>
                  <Button
                    variant={
                      abstraction2Score === 1 ? "success" : "outline-success"
                    }
                    className={`toggle-button ${
                      abstraction2Score === 1 ? "active" : ""
                    } mb-2`}
                    onClick={() => handleScoreChange(1, setAbstraction2Score)}
                  >
                    Respondió correctamente +1
                  </Button>
                  <Button
                    variant={
                      abstraction2Score === 0 ? "danger" : "outline-danger"
                    }
                    className={`toggle-button ${
                      abstraction2Score === 0 ? "active" : ""
                    }`}
                    onClick={() => handleScoreChange(0, setAbstraction2Score)}
                  >
                    No respondió correctamente 0
                  </Button>
                </Col>
              </Row>

              {/* Sección Delayed Recall */}
<div className="section-title">Recuerdo Diferido</div>

<Row className="justify-content-center mt-4">
  <Col md={8} className="d-flex flex-column">
    <p className="instructions-text">
      Pida al paciente que recuerde las palabras del test de memoria anterior (Ej. "Cara", "Terciopelo", "Iglesia", "Margarita", "Rojo")
    </p>
    <Button
      variant={delayedRecallScore === 5 ? "success" : "outline-success"}
      className={`toggle-button ${delayedRecallScore === 5 ? "active" : ""} mb-2`}
      onClick={() => handleScoreChange(5, setDelayedRecallScore)}
    >
      Recordó todas las palabras +5
    </Button>
    <Button
      variant={delayedRecallScore === 4 ? "primary" : "outline-primary"}
      className={`toggle-button ${delayedRecallScore === 4 ? "active" : ""} mb-2`}
      onClick={() => handleScoreChange(4, setDelayedRecallScore)}
    >
      Recordó 4 palabras +4
    </Button>
    <Button
      variant={delayedRecallScore === 3 ? "warning" : "outline-warning"}
      className={`toggle-button ${delayedRecallScore === 3 ? "active" : ""} mb-2`}
      onClick={() => handleScoreChange(3, setDelayedRecallScore)}
    >
      Recordó 3 palabras +3
    </Button>
    <Button
      variant={delayedRecallScore === 2 ? "info" : "outline-info"}
      className={`toggle-button ${delayedRecallScore === 2 ? "active" : ""} mb-2`}
      onClick={() => handleScoreChange(2, setDelayedRecallScore)}
    >
      Recordó 2 palabras +2
    </Button>
    <Button
      variant={delayedRecallScore === 1 ? "secondary" : "outline-secondary"}
      className={`toggle-button ${delayedRecallScore === 1 ? "active" : ""} mb-2`}
      onClick={() => handleScoreChange(1, setDelayedRecallScore)}
    >
      Recordó 1 palabra +1
    </Button>
    <Button
      variant={delayedRecallScore === 0 ? "danger" : "outline-danger"}
      className={`toggle-button ${delayedRecallScore === 0 ? "active" : ""}`}
      onClick={() => handleScoreChange(0, setDelayedRecallScore)}
    >
      No recordó ninguna palabra 0
    </Button>
  </Col>
</Row>

{/* Sección Orientation */}
<div className="section-title">Orientación</div>

<Row className="justify-content-center mt-4">
  <Col md={8} className="d-flex flex-column">
    <p className="instructions-text">Pida al paciente que diga la fecha, mes, año, día, lugar y ciudad</p>
    <Button
      variant={orientationScore === 6 ? "success" : "outline-success"}
      className={`toggle-button ${orientationScore === 6 ? "active" : ""} mb-2`}
      onClick={() => handleScoreChange(6, setOrientationScore)}
    >
      Todo correcto +6
    </Button>
    <Button
      variant={orientationScore === 5 ? "primary" : "outline-primary"}
      className={`toggle-button ${orientationScore === 5 ? "active" : ""} mb-2`}
      onClick={() => handleScoreChange(5, setOrientationScore)}
    >
      5 correctas +5
    </Button>
    <Button
      variant={orientationScore === 4 ? "warning" : "outline-warning"}
      className={`toggle-button ${orientationScore === 4 ? "active" : ""} mb-2`}
      onClick={() => handleScoreChange(4, setOrientationScore)}
    >
      4 correctas +4
    </Button>
    <Button
      variant={orientationScore === 3 ? "info" : "outline-info"}
      className={`toggle-button ${orientationScore === 3 ? "active" : ""} mb-2`}
      onClick={() => handleScoreChange(3, setOrientationScore)}
    >
      3 correctas +3
    </Button>
    <Button
      variant={orientationScore === 2 ? "secondary" : "outline-secondary"}
      className={`toggle-button ${orientationScore === 2 ? "active" : ""} mb-2`}
      onClick={() => handleScoreChange(2, setOrientationScore)}
    >
      2 correctas +2
    </Button>
    <Button
      variant={orientationScore === 1 ? "dark" : "outline-dark"}
      className={`toggle-button ${orientationScore === 1 ? "active" : ""} mb-2`}
      onClick={() => handleScoreChange(1, setOrientationScore)}
    >
      1 correcta +1
    </Button>
    <Button
      variant={orientationScore === 0 ? "danger" : "outline-danger"}
      className={`toggle-button ${orientationScore === 0 ? "active" : ""}`}
      onClick={() => handleScoreChange(0, setOrientationScore)}
    >
      Ninguna correcta 0
    </Button>
  </Col>
</Row>



              {/* Puntaje total */}
              <div className="mt-4">
                <h5>Puntaje Total: {totalScore}</h5>
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
