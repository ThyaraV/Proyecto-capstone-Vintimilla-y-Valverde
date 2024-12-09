// src/screens/MOCAmodules/Abstraccion.jsx

import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Alert, Form, Spinner } from "react-bootstrap";
import { FaPlay, FaStop } from "react-icons/fa";

const Abstraccion = ({ onComplete, onPrevious, isFirstModule }) => {
  const pairs = [
    {
      objects: "un tren y una bicicleta",
      acceptedAnswers: ["transporte", "para transportar", "medios de transporte", "son medios de transporte"],
    },
    {
      objects: "una regla y un reloj",
      acceptedAnswers: ["miden", "medir", "para medir", "sirven para medir"],
    },
  ];

  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [activity1Score, setActivity1Score] = useState(null);
  const [activity2Score, setActivity2Score] = useState(null);

  const [useVoice, setUseVoice] = useState(true);
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);

  const [transcript, setTranscript] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  const [hasHeardPair, setHasHeardPair] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }
  }, []);

  useEffect(() => {
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
  }, []);

  const speakInstructions = (text) => {
    if (!ttsSupported) {
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const speakPair = (text) => {
    if (!ttsSupported) return;
    if (isSpeakingLocal) {
      window.speechSynthesis.cancel();
      setIsSpeakingLocal(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(
        "Dígame en qué se parecen " + text
      );
      utterance.lang = "es-ES";
      utterance.onend = () => {
        setIsSpeakingLocal(false);
        setHasHeardPair(true);
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

    if (!hasHeardPair) {
      alert("Primero debe escuchar las instrucciones para este par de objetos antes de responder.");
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
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, " ");
  };

  const handleConfirm = () => {
    const inputText = normalizeText(transcript || manualInput);
    const pair = pairs[currentPairIndex];
    const correct = pair.acceptedAnswers.some((ans) => inputText.includes(ans));

    if (currentPairIndex === 0) {
      setActivity1Score(correct ? 1 : 0);
    } else if (currentPairIndex === 1) {
      setActivity2Score(correct ? 1 : 0);
    }

    setManualInput("");
    setTranscript("");
    setConfirmation(false);

    if (currentPairIndex < pairs.length - 1) {
      setCurrentPairIndex(currentPairIndex + 1);
      setHasHeardPair(false);
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
      if (manualInput.trim() && hasHeardPair && !confirmation) {
        setConfirmation(true);
      }
    }
  };

  const handleNext = () => {
    const totalScore = (activity1Score || 0) + (activity2Score || 0);
    onComplete(
      totalScore,
      {
        activity1: activity1Score,
        activity2: activity2Score
      }
    );
  };

  const allActivitiesDone = activity1Score !== null && activity2Score !== null;

  return (
    <div className="module-container">
      <div className="d-flex align-items-center">
        <h4>Abstracción</h4>
        <Button
          variant="link"
          onClick={() =>
            speakInstructions(
              "Le diré dos objetos y me gustaría que me diga en qué se parecen."
            )
          }
          disabled={isSpeakingLocal}
        >
          {isSpeakingLocal ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>“Le diré dos objetos, y usted me dirá en qué se parecen.”</p>

      <div className="d-flex justify-content-center mt-3">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            {currentPairIndex < pairs.length && !confirmation && (
              <>
                <p>
                  Escuche los objetos y luego dígame en qué se parecen. Puede hablar o escribir su respuesta.
                </p>
                <Button
                  variant="primary"
                  onClick={() => speakPair(pairs[currentPairIndex].objects)}
                  className="mb-3"
                  disabled={isSpeakingLocal || hasHeardPair}
                >
                  Escuchar objetos
                </Button>
              </>
            )}

            {currentPairIndex < pairs.length && !confirmation && (
              <>
                <Form onSubmit={(e) => e.preventDefault()} className="mt-3">
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="Escriba aquí su respuesta"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!hasHeardPair || listening}
                    />
                  </Form.Group>
                  <Button
                    variant="success"
                    onClick={() => setConfirmation(true)}
                    className="me-2 mt-2"
                    disabled={!manualInput.trim() || !hasHeardPair}
                  >
                    Confirmar
                  </Button>
                </Form>
              </>
            )}

            {currentPairIndex < pairs.length && useVoice && !confirmation && (
              listening ? (
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
                  disabled={!hasHeardPair}
                >
                  Hablar
                </Button>
              )
            )}

            {currentPairIndex < pairs.length && confirmation && (
              <div className="mt-3">
                <Alert variant="secondary">
                  <p>¿Es correcta su respuesta?</p>
                  <strong>"{transcript || manualInput}"</strong>
                </Alert>
                <Button
                  variant="success"
                  onClick={handleConfirm}
                  className="me-2"
                >
                  Sí
                </Button>
                <Button variant="warning" onClick={handleRetry}>
                  Reintentar
                </Button>
              </div>
            )}

            {currentPairIndex >= pairs.length && (
              <div className="mt-3">
                <p>¡Actividades completadas!</p>
              </div>
            )}
          </Col>
        </Row>
      </div>

      <div className="d-flex justify-content-center mt-4">
        <Button variant="info" onClick={() => setCurrentPairIndex(0)} className="me-2">
          Ir a Actividad 1
        </Button>
        <Button variant="info" onClick={() => setCurrentPairIndex(1)}>
          Ir a Actividad 2
        </Button>
      </div>

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
          disabled={!allActivitiesDone}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Abstraccion;
