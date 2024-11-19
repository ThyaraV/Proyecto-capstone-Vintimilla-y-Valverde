import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Image, Alert, Form, Spinner } from "react-bootstrap";

const Identificacion = ({ onComplete, onPrevious, isFirstModule }) => {
  const animals = [
    {
      id: 1,
      image: require("../../images/MOCA/camello.jpg"),
      correctAnswers: ["camello", "dromedario"],
    },
    {
      id: 2,
      image: require("../../images/MOCA/leon.jpg"),
      correctAnswers: ["león", "leon"],
    },
    {
      id: 3,
      image: require("../../images/MOCA/rinoceronte.jpg"),
      correctAnswers: ["rinoceronte"],
    },
  ];

  const [currentAnimalIndex, setCurrentAnimalIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [useVoice, setUseVoice] = useState(true);
  const [confirmation, setConfirmation] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Verificar compatibilidad con SpeechRecognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setUseVoice(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setListening(false);
      setConfirmation(true);
    };

    recognition.onerror = () => {
      setListening(false);
      alert("Error al reconocer la voz. Intente de nuevo.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup function to stop recognition when component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleListen = () => {
    if (!recognitionRef.current) {
      alert("Reconocimiento de voz no disponible.");
      return;
    }

    setListening(true);
    setTranscript("");
    recognitionRef.current.start();
  };

  const handleStop = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const handleConfirm = () => {
    const currentAnimal = animals[currentAnimalIndex];
    const inputText = transcript || manualInput;

    // Guardar la respuesta
    setScores((prevScores) => ({
      ...prevScores,
      [currentAnimal.id]: inputText,
    }));

    setManualInput("");
    setTranscript("");
    setConfirmation(false);

    if (currentAnimalIndex < animals.length - 1) {
      setCurrentAnimalIndex(currentAnimalIndex + 1);
    } else {
      setModuleCompleted(true);
    }
  };

  const handleRetry = () => {
    setTranscript("");
    setManualInput("");
    setConfirmation(false);
  };

  const handleNext = () => {
    // Evaluar las respuestas y calcular el puntaje total
    let totalScore = 0;
    animals.forEach((animal) => {
      const answer = scores[animal.id];
      if (answer) {
        const normalizedAnswer = normalizeText(answer);
        if (animal.correctAnswers.map(normalizeText).includes(normalizedAnswer)) {
          totalScore += 1;
        }
      }
    });
    onComplete(totalScore, scores);
  };

  const handlePreviousAnimal = () => {
    if (currentAnimalIndex > 0) {
      setCurrentAnimalIndex(currentAnimalIndex - 1);
    }
  };

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // Cerrar el micrófono cuando el componente se desmonte o el módulo termine
  useEffect(() => {
    return () => {
      if (recognitionRef.current && listening) {
        recognitionRef.current.abort();
      }
    };
  }, [listening]);

  return (
    <div className="module-container">
      <h4>Identificación de Animales</h4>
      {moduleCompleted ? (
        <div className="text-center">
          <p>¡Ha completado el módulo!</p>
          <Button variant="success" onClick={handleNext}>
            Continuar
          </Button>
        </div>
      ) : (
        <>
          <Row className="justify-content-center mt-3">
            <Col md={6} className="text-center">
              <Image
                src={animals[currentAnimalIndex].image}
                alt={`Animal ${currentAnimalIndex + 1}`}
                fluid
                style={{ maxHeight: "300px" }}
              />
              <p className="instructions-text mt-3">
                Nombre el animal mostrado en la imagen.
              </p>

              {useVoice && !confirmation ? (
                listening ? (
                  <div>
                    <Spinner animation="grow" variant="primary" />
                    <p className="mt-2">Escuchando...</p>
                    <Button variant="danger" onClick={handleStop}>
                      Detener
                    </Button>
                  </div>
                ) : (
                  <Button variant="primary" onClick={handleListen}>
                    Hablar
                  </Button>
                )
              ) : null}

              {/* Entrada manual */}
              {!listening && !confirmation && (
                <Form className="mt-3">
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="Escriba aquí su respuesta"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                    />
                  </Form.Group>
                  <Button
                    variant="success"
                    onClick={() => setConfirmation(true)}
                    className="me-2 mt-2"
                    disabled={!manualInput.trim()}
                  >
                    Confirmar
                  </Button>
                </Form>
              )}

              {/* Confirmación de la respuesta */}
              {confirmation && (
                <div className="mt-3">
                  <Alert variant="secondary">
                    <p>¿Es correcta su respuesta?</p>
                    <strong>"{transcript || manualInput}"</strong>
                  </Alert>
                  <Button variant="success" onClick={handleConfirm} className="me-2">
                    Sí
                  </Button>
                  <Button variant="warning" onClick={handleRetry}>
                    Reintentar
                  </Button>
                </div>
              )}
            </Col>
          </Row>

          {/* Botones de navegación */}
          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="secondary"
              onClick={onPrevious}
              disabled={isFirstModule}
            >
              Regresar al Módulo Anterior
            </Button>

            <div>
              <Button
                variant="secondary"
                onClick={handlePreviousAnimal}
                disabled={currentAnimalIndex === 0}
                className="me-2"
              >
                Anterior
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Identificacion;
