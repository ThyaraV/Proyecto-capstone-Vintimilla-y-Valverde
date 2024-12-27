import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Image, Alert, Form, Spinner } from "react-bootstrap";
import { FaPlay, FaStop, FaMicrophone } from "react-icons/fa";

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

  const [ttsSupported, setTtsSupported] = useState(true);
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setUseVoice(false);
    } else {
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
    }

    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }
  }, []);

  const speakInstructions = (text) => {
    if (!ttsSupported) return;
    if (isSpeakingLocal) {
      window.speechSynthesis.cancel();
      setIsSpeakingLocal(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onend = () => {
        setIsSpeakingLocal(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeakingLocal(true);
    }
  };

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

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const handleConfirm = () => {
    const currentAnimal = animals[currentAnimalIndex];
    const inputText = transcript || manualInput;

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
      handleNext();
    }
  };

  const handleRetry = () => {
    setTranscript("");
    setManualInput("");
    setConfirmation(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (manualInput.trim() && !confirmation) {
        setConfirmation(true);
      }
    }
  };

  const handleNext = () => {
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

  useEffect(() => {
    return () => {
      if (recognitionRef.current && listening) {
        recognitionRef.current.abort();
      }
    };
  }, [listening]);

  return (
    <div className="module-container">
      <div className="d-flex align-items-center">
        <h4 className="mb-0">Identificación de Animales</h4>
        <Button
          variant="link"
          onClick={() => speakInstructions("Nombre el animal mostrado en la imagen.")}
          disabled={isSpeakingLocal}
          className="ms-3 text-decoration-none"
          style={{ whiteSpace: "nowrap", textDecoration: "none", minWidth: "180px" }}
        >
          {isSpeakingLocal ? <FaStop /> : <FaPlay />} Escuchar Instrucciones
        </Button>
      </div>

      <Row className="justify-content-center mt-3">
        <Col md={6} className="text-center">
          <Image
            src={animals[currentAnimalIndex].image}
            alt={`Animal ${currentAnimalIndex + 1}`}
            fluid
            style={{ maxHeight: "300px" }}
          />
          <p>Nombre el animal mostrado en la imagen.</p>

          {useVoice && !confirmation && (
            <div className="text-center mb-3">
              {listening ? (
                <div>
                  <Spinner animation="grow" variant="primary" />
                  <p className="mt-2">Escuchando...</p>
                  <Button variant="danger" onClick={handleStop}>
                    Detener
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleListen}
                  className="d-flex align-items-center justify-content-center mx-auto"
                  style={{ minWidth: "150px" }}
                >
                  <FaMicrophone className="me-2" />
                  Hablar
                </Button>
              )}
            </div>
          )}

          {!listening && !confirmation && (
            <Form onSubmit={(e) => e.preventDefault()} className="mt-3">
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Escriba aquí su respuesta"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={handleKeyPress}
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

          {confirmation && (
            <div className="mt-3">
              <Alert variant="secondary">
                <p>¿Es correcta su respuesta?</p>
                <strong>"{transcript || manualInput}"</strong>
              </Alert>
              <Row>
                <Col className="d-flex justify-content-start">
                  <Button variant="warning" onClick={handleRetry}>
                    Reintentar
                  </Button>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Button variant="success" onClick={handleConfirm}>
                    Sí
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </Col>
      </Row>

      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={isFirstModule}
        >
          Regresar
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
    </div>
  );
};

export default Identificacion;
