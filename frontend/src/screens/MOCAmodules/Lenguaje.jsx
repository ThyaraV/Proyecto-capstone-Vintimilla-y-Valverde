// src/screens/MOCAmodules/Lenguaje.jsx

import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Alert, Form, Spinner } from "react-bootstrap";
import { FaPlay, FaStop } from "react-icons/fa";

// Componente para la primera actividad: Repetición de frases
const RepeticionFrasesActivity = ({
  onComplete,
  isSpeaking,
  speakInstructions,
  onPrevious,
  isFirstModule,
}) => {
  const phrases = [
    "El gato se esconde bajo el sofá cuando los perros entran en la sala",
    "Espero que él le entregue el mensaje una vez que ella se lo pida",
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [useVoice, setUseVoice] = useState(true);
  const [confirmation, setConfirmation] = useState(false);
  const [hasListenedLocal, setHasListenedLocal] = useState(false);

  const recognitionRef = useRef(null);

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

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, " "); // Remover espacios extras
  };

  const handleConfirm = () => {
    const currentPhrase = normalizeText(phrases[currentPhraseIndex]);
    const inputText = normalizeText(transcript || manualInput);

    const isCorrect = inputText === currentPhrase;

    setScores((prevScores) => ({
      ...prevScores,
      [currentPhraseIndex]: isCorrect ? 1 : 0,
    }));

    setManualInput("");
    setTranscript("");
    setConfirmation(false);

    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
      setHasListenedLocal(false); // Resetear estado para la próxima frase
      onComplete(isCorrect ? 1 : 0); // Asignar puntaje por frase
    } else {
      // Calcular puntaje total
      const totalScore =
        Object.values(scores).reduce((a, b) => a + b, 0) + (isCorrect ? 1 : 0);
      onComplete(totalScore);
    }
  };

  const handleRetry = () => {
    setTranscript("");
    setManualInput("");
    setConfirmation(false);
  };

  return (
    <div className="module-container">
      <div className="d-flex align-items-center">
        <h4>Repetición de frases</h4>
        <Button
          variant="link"
          onClick={() =>
            speakInstructions(
              "Ahora le voy a leer una frase y me gustaría que la repitiera a continuación."
            )
          }
          disabled={hasListenedLocal}
        >
          {isSpeaking ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>“Me gustaría que repita la siguiente frase.”</p>
      <div className="d-flex justify-content-center mt-3">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            {!confirmation && (
              <>
                <p>
                  Escuche cuidadosamente la frase y repítala a continuación.
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    speakInstructions(phrases[currentPhraseIndex]);
                    setHasListenedLocal(true);
                  }}
                  className="mb-3"
                  disabled={hasListenedLocal}
                >
                  Escuchar frase
                </Button>
              </>
            )}

            {!confirmation && (
              <>
                <Form className="mt-3">
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="Escriba aquí su respuesta"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      disabled={listening}
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
              </>
            )}

            {useVoice && !confirmation && (
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
                  disabled={hasListenedLocal}
                >
                  Hablar
                </Button>
              )
            )}

            {confirmation && (
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
          </Col>
        </Row>
      </div>
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={isFirstModule}
        >
          Regresar
        </Button>
      </div>
    </div>
  );
};

// Componente para la segunda actividad: Fluidez verbal
const FluidezVerbalActivity = ({
  onComplete,
  isSpeaking,
  speakInstructions,
  onPrevious,
  isFirstModule,
}) => {
  const targetLetter = "p";
  const timeLimit = 60; // 60 segundos
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [useVoice, setUseVoice] = useState(true);
  const [words, setWords] = useState([]);
  const [timerActive, setTimerActive] = useState(false);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [score, setScore] = useState(null);
  const [hasListenedLocal, setHasListenedLocal] = useState(false);

  const recognitionRef = useRef(null);

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
      handleVoiceResult(result);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      alert("Error al reconocer la voz. Intente de nuevo.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleVoiceResult = (text) => {
    const normalizedWords = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .filter(
        (word, index, self) =>
          word.startsWith(targetLetter) && self.indexOf(word) === index
      );

    setWords((prev) => [...prev, ...normalizedWords]);
  };

  const handleListen = () => {
    if (!recognitionRef.current) {
      alert("Reconocimiento de voz no disponible.");
      return;
    }

    if (!timerActive) {
      alert("Primero inicie el tiempo antes de hablar.");
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

  const handleAddWord = () => {
    if (!timerActive) {
      alert("Primero inicie el tiempo antes de ingresar palabras.");
      return;
    }

    const normalized = manualInput
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .filter(
        (word, index, self) =>
          word.startsWith(targetLetter) && self.indexOf(word) === index
      );

    setWords((prev) => [...prev, ...normalized]);
    setManualInput("");
  };

  const handleStartTimer = () => {
    setTimerActive(true);
  };

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      clearInterval(interval);
      evaluateWords();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const evaluateWords = () => {
    // Filtrar palabras que empiezan con la letra p y son únicas
    const filteredWords = words.filter((w) => w.startsWith(targetLetter));
    const uniqueFilteredWords = [...new Set(filteredWords)];

    // Asignar puntaje: 1 si hay 11 o más palabras, 0 si menos
    const finalScore = uniqueFilteredWords.length >= 11 ? 1 : 0;
    setScore(finalScore);
    setIsEvaluated(true);
  };

  const handleContinue = () => {
    if (!isEvaluated) {
      evaluateWords();
    }
    onComplete(score);
  };

  return (
    <div className="module-container">
      <div className="d-flex align-items-center">
        <h4>Fluidez verbal</h4>
        <Button
          variant="link"
          onClick={() =>
            speakInstructions(
              "Me gustaría que me diga el mayor número posible de palabras que comiencen por la letra P. Puede decir cualquier tipo de palabra, excepto nombres propios, números, conjugaciones verbales y palabras de la misma familia. Le pediré que pare al minuto. Está preparado? Ahora, diga el mayor número posible de palabras que comiencen por la letra P."
            )
          }
          disabled={hasListenedLocal}
        >
          {isSpeaking ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>
        “Me gustaría que me diga el mayor número posible de palabras que comiencen por la letra P. Puede decir cualquier tipo de palabra, excepto nombres propios, números, conjugaciones verbales y palabras de la misma familia. Le pediré que pare al minuto. Está preparado? Ahora, diga el mayor número posible de palabras que comiencen por la letra P.”
      </p>
      {!timerActive && (
        <div className="text-center mb-3">
          <Button variant="primary" onClick={handleStartTimer}>
            Iniciar tiempo
          </Button>
        </div>
      )}
      {timerActive && (
        <div className="text-center mb-3">
          <p>Tiempo restante: {timeLeft}s</p>
        </div>
      )}
      <Row className="justify-content-center mt-3">
        <Col md={8} className="text-center">
          {useVoice && timerActive && !isEvaluated && (
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
                onClick={() => {
                  handleListen();
                  setHasListenedLocal(true);
                }}
                disabled={isEvaluated || !timerActive || timeLeft === 0 || hasListenedLocal}
              >
                Hablar
              </Button>
            )
          )}

          {!isEvaluated && (
            <>
              <Form className="mt-3">
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="Escriba aquí su palabra"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    disabled={!timerActive || timeLeft === 0}
                  />
                </Form.Group>
                <Button
                  variant="success"
                  onClick={handleAddWord}
                  className="me-2 mt-2"
                  disabled={!manualInput.trim() || !timerActive || timeLeft === 0}
                >
                  Añadir palabra
                </Button>
              </Form>
              <div className="mt-3">
                <p>Palabras registradas: {words.join(", ")}</p>
              </div>
            </>
          )}

          {isEvaluated && (
            <div className="mt-3">
              <Alert variant="info">
                <p>Tiempo finalizado.</p>
                <p>Palabras registradas: {words.join(", ")}</p>
                <p>Puntaje: {score}</p>
              </Alert>
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
        <Button
          variant="success"
          onClick={handleContinue}
          disabled={!isEvaluated}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

// Componente principal que maneja las actividades
const Lenguaje = ({ onComplete, onPrevious, isFirstModule }) => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const [ttsSupported, setTtsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }
  }, []);

  // Función para hablar instrucciones
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

  // Manejar la finalización de cada actividad
  const handleActivityComplete = (score) => {
    setTotalScore((prev) => prev + score);
    setCurrentActivityIndex((prev) => prev + 1);
  };

  // Manejar la finalización del módulo
  const handleModuleComplete = (score) => {
    setTotalScore((prev) => prev + score);
    onComplete(totalScore + score, { totalScore: totalScore + score });
  };

  return (
    <div className="module-container">
      {currentActivityIndex === 0 && (
        <RepeticionFrasesActivity
          onComplete={handleActivityComplete}
          isSpeaking={isSpeaking}
          speakInstructions={speakInstructions}
          onPrevious={onPrevious}
          isFirstModule={isFirstModule}
        />
      )}
      {currentActivityIndex === 1 && (
        <FluidezVerbalActivity
          onComplete={handleModuleComplete}
          isSpeaking={isSpeaking}
          speakInstructions={speakInstructions}
          onPrevious={onPrevious}
          isFirstModule={isFirstModule}
        />
      )}
    </div>
  );
};

export default Lenguaje;
