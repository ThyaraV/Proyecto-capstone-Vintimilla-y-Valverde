// src/screens/MOCAmodules/Lenguaje.jsx

import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Alert, Form, Spinner } from "react-bootstrap";
import { FaPlay, FaStop } from "react-icons/fa";

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
  const [ttsSupported, setTtsSupported] = useState(true);
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  const [hasHeardPhrase, setHasHeardPhrase] = useState(false);

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
    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }
  }, []);

  const handleListen = () => {
    if (!recognitionRef.current) {
      alert("Reconocimiento de voz no disponible.");
      return;
    }

    if (!hasHeardPhrase) {
      alert("Primero debe escuchar la frase antes de responder.");
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

  const speakPhrase = (text) => {
    if (!ttsSupported) return;
    if (isSpeakingLocal) {
      window.speechSynthesis.cancel();
      setIsSpeakingLocal(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onend = () => {
        setIsSpeakingLocal(false);
        setHasHeardPhrase(true);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeakingLocal(true);
    }
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
      setHasHeardPhrase(false);
    } else {
      const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
      // Devolver el puntaje total de esta actividad
      onComplete(totalScore + (isCorrect ? 1 : 0));
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
      if (manualInput.trim() && hasHeardPhrase && !confirmation) {
        setConfirmation(true);
      }
    }
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
          disabled={isSpeakingLocal}
        >
          {isSpeakingLocal ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>“Me gustaría que repita la siguiente frase.”</p>
      <div className="d-flex justify-content-center mt-3">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            {!confirmation && (
              <>
                <p>Escuche cuidadosamente la frase y repítala a continuación.</p>
                <Button
                  variant="primary"
                  onClick={() => speakPhrase(phrases[currentPhraseIndex])}
                  className="mb-3"
                  disabled={isSpeakingLocal || hasHeardPhrase}
                >
                  Escuchar frase
                </Button>
              </>
            )}

            {!confirmation && (
              <>
                <Form onSubmit={(e) => e.preventDefault()} className="mt-3">
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="Escriba aquí su respuesta"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!hasHeardPhrase || listening}
                    />
                  </Form.Group>
                  <Button
                    variant="success"
                    onClick={() => setConfirmation(true)}
                    className="me-2 mt-2"
                    disabled={!manualInput.trim() || !hasHeardPhrase}
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
                  disabled={!hasHeardPhrase}
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

const FluidezVerbalActivity = ({
  onComplete,
  isSpeaking,
  speakInstructions,
  onPrevious,
  isFirstModule,
}) => {
  const [timer, setTimer] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [wordList, setWordList] = useState([]);
  const [inputWord, setInputWord] = useState("");
  const [useVoice, setUseVoice] = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    let interval = null;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRunning(false);
      clearInterval(interval);
      if (listening) handleStopListening();
      calculateScore();
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

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
    recognition.continuous = true;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const result = event.results[i][0].transcript.toLowerCase().trim();
          const words = result
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, "")
            .split(/\s+/)
            .filter((w) => w && w[0] === "p" && w.length > 1);
          setWordList((prevList) => {
            const combined = [...prevList, ...words];
            return combined.filter((word, index, self) => self.indexOf(word) === index);
          });
        }
      }
    };

    recognition.onerror = () => {
      setListening(false);
      alert("Error al reconocer la voz. Intente de nuevo.");
    };

    recognition.onend = () => {
      if (listening) recognition.start();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleInputChange = (e) => {
    setInputWord(e.target.value);
  };

  const handleAddWord = () => {
    if (inputWord.trim()) {
      const word = inputWord
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "")
        .trim();
      if (word && word[0] === "p" && word.length > 1) {
        setWordList((prevList) =>
          [...prevList, word].filter(
            (w, idx, arr) => arr.indexOf(w) === idx
          )
        );
      }
      setInputWord("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddWord();
    }
  };

  const handleListen = () => {
    if (!recognitionRef.current) {
      alert("Reconocimiento de voz no disponible.");
      return;
    }
    if (!isRunning) {
      alert("Primero inicie el tiempo antes de hablar.");
      return;
    }
    setListening(true);
    recognitionRef.current.start();
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const calculateScore = () => {
    const validWords = wordList.filter((w) => w[0] === "p" && w.length > 1);
    const score = validWords.length >= 11 ? 1 : 0;
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
              "Me gustaría que me diga el mayor número posible de palabras que comiencen por la letra P. Puede hablar o escribirlas. ¿Está listo? Presione el botón para iniciar."
            )
          }
        >
          {isSpeaking ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>
        Me gustaría que me diga el mayor número posible de palabras que comiencen por la letra P. Puede hablar o escribirlas. Presione el botón para iniciar.
      </p>
      {!isRunning ? (
        <div className="text-center">
          <Button variant="primary" onClick={handleStart}>
            Iniciar
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center mb-3">
            <h5>Tiempo restante: {timer}s</h5>
          </div>
          <div className="d-flex justify-content-center align-items-center mb-4">
            {useVoice && !listening ? (
              <Button variant="primary" onClick={handleListen} className="me-3">
                Hablar
              </Button>
            ) : listening ? (
              <div className="d-flex align-items-center me-3">
                <Spinner animation="grow" variant="primary" className="me-2" />
                <Button variant="danger" onClick={handleStopListening}>
                  Detener
                </Button>
              </div>
            ) : null}
            <Form onSubmit={(e) => e.preventDefault()} className="d-flex">
              <Form.Control
                type="text"
                placeholder="Escriba una palabra"
                value={inputWord}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
              />
              <Button
                variant="success"
                onClick={handleAddWord}
                className="ms-2"
              >
                Agregar
              </Button>
            </Form>
          </div>
          <div>
            <h5>Palabras registradas:</h5>
            <ul>
              {wordList.map((word, index) => (
                <li key={index}>{word}</li>
              ))}
            </ul>
          </div>
        </>
      )}
      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={onPrevious} disabled={isFirstModule}>
          Regresar
        </Button>
      </div>
    </div>
  );
};

const Lenguaje = ({ onComplete, onPrevious, isFirstModule }) => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [activity1Score, setActivity1Score] = useState(null);
  const [activity2Score, setActivity2Score] = useState(null);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }
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

  const handleActivity1Complete = (score) => {
    setActivity1Score(score);
    setCurrentActivityIndex((prev) => prev + 1);
  };

  const handleActivity2Complete = (score) => {
    setActivity2Score(score);
  };

  const handleNext = () => {
    const totalScore = (activity1Score || 0) + (activity2Score || 0);
    onComplete(
      totalScore,
      {
        activity1: activity1Score,
        activity2: activity2Score,
      }
    );
  };

  const allActivitiesDone = activity1Score !== null && activity2Score !== null;

  return (
    <div className="module-container">
      {currentActivityIndex === 0 && (
        <RepeticionFrasesActivity
          onComplete={handleActivity1Complete}
          isSpeaking={isSpeaking}
          speakInstructions={speakInstructions}
          onPrevious={onPrevious}
          isFirstModule={isFirstModule}
        />
      )}
      {currentActivityIndex === 1 && (
        <FluidezVerbalActivity
          onComplete={handleActivity2Complete}
          isSpeaking={isSpeaking}
          speakInstructions={speakInstructions}
          onPrevious={onPrevious}
          isFirstModule={isFirstModule}
        />
      )}

      {currentActivityIndex === 1 && (
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
      )}

      <div className="d-flex justify-content-center mt-4">
        <Button variant="info" onClick={() => setCurrentActivityIndex(0)} className="me-2">
          Ir a Actividad 1
        </Button>
        <Button variant="info" onClick={() => setCurrentActivityIndex(1)}>
          Ir a Actividad 2
        </Button>
      </div>
    </div>
  );
};

export default Lenguaje;
