// src/screens/MOCAmodules/Lenguaje.jsx

import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Spinner, Alert, Row, Col } from "react-bootstrap";
import { FaPlay, FaStop, FaMicrophone } from "react-icons/fa";


/**
 * ACTIVIDAD 1: Repetición de Frases
 * El usuario escucha y repite dos frases. Se asigna 1 punto por cada frase repetida correctamente.
 * Al finalizar, se devuelve la suma de puntos (0, 1 o 2) y las respuestas dadas.
 */
const RepeticionFrasesActivity = ({
  onComplete,
  onPrevious,
  isFirstModule,
}) => {
  const phrases = [
    "El gato se esconde bajo el sofá cuando los perros entran en la sala",
    "Espero que él le entregue el mensaje una vez que ella se lo pida",
  ];

  // Estados para manejar las frases
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [activityAnswers, setActivityAnswers] = useState([]); // Guarda la respuesta original del usuario
  const [scoresMap, setScoresMap] = useState({});             // Guarda 1 o 0 por cada frase
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [useVoice, setUseVoice] = useState(true);

  // Control de TTS
  const [ttsSupported, setTtsSupported] = useState(true);
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);

  // Control de reconocimiento de voz
  const recognitionRef = useRef(null);

  // Indica si el usuario ya escuchó la frase antes de responder
  const [hasHeardPhrase, setHasHeardPhrase] = useState(false);

  // Indica si se está confirmando la respuesta actual
  const [confirmation, setConfirmation] = useState(false);

  // Inicialización de reconocimiento de voz
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setUseVoice(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.interimResults = false;
      recognition.continuous = false; // Para reconocer cada frase individualmente

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

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Inicia la escucha
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

  // Detiene la escucha
  const handleStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  // Reproduce la frase actual por TTS
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
        setHasHeardPhrase(true); // El usuario ya escuchó la frase
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeakingLocal(true);
    }
  };

  // Normaliza texto para comparación
  const normalizeText = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, " ");

  // Confirma la respuesta del usuario
  const handleConfirm = () => {
    const phraseOrig = phrases[currentPhraseIndex];
    const userResp = transcript || manualInput;

    setActivityAnswers((prev) => [
      ...prev,
      { phraseIndex: currentPhraseIndex, response: userResp },
    ]);

    const isCorrect =
      normalizeText(userResp) === normalizeText(phraseOrig) ? 1 : 0;

    setScoresMap((prev) => ({
      ...prev,
      [currentPhraseIndex]: isCorrect,
    }));

    setManualInput("");
    setTranscript("");
    setConfirmation(false);

    // Avanza a la siguiente frase o finaliza si era la última
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
      setHasHeardPhrase(false);
    } else {
      // Calcula el puntaje final de la actividad
      const partialScore = Object.values(scoresMap).reduce((a, b) => a + b, 0);
      const lastScore = isCorrect; // Puntaje de la frase actual
      const totalScore = partialScore + lastScore;

      onComplete(totalScore, {
        activityScore: totalScore,
        phraseAnswers: [
          ...activityAnswers,
          { phraseIndex: currentPhraseIndex, response: userResp },
        ],
      });
    }
  };

  // Reintenta la respuesta actual
  const handleRetry = () => {
    setTranscript("");
    setManualInput("");
    setConfirmation(false);
  };

  // Manejo del Enter en el input
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
      {/* Título e instrucciones */}
      <div className="d-flex align-items-center">
        <h4 className="mb-0">Repetición de Frases</h4>
        <Button
          variant="link"
          onClick={() =>
            speakPhrase(
              "Ahora le voy a leer una frase y me gustaría que la repitiera a continuación."
            )
          }
          disabled={isSpeakingLocal}
          className="ms-3 text-decoration-none"
          style={{ whiteSpace: "nowrap", minWidth: "220px" }}
        >
          {isSpeakingLocal ? <FaStop /> : <FaPlay />} Escuchar Instrucciones
        </Button>
      </div>

      <p className="mt-2">Repita exactamente la frase que escuche.</p>

      <div className="d-flex justify-content-center mt-3">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            {/* Si no se está confirmando la respuesta */}
            {!confirmation && (
              <>
                <p>Escuche cuidadosamente la frase y repítala a continuación.</p>
                <Button
                  variant="primary"
                  onClick={() => speakPhrase(phrases[currentPhraseIndex])}
                  className="mb-3 d-block mx-auto"
                  disabled={isSpeakingLocal || hasHeardPhrase}
                  style={{ minWidth: "180px" }}
                >
                  Escuchar la frase
                </Button>
              </>
            )}

            {/* Formulario para respuesta manual */}
            {!confirmation && (
              <>
                <Form
                  onSubmit={(e) => e.preventDefault()}
                  className="mt-3 d-flex flex-column align-items-center"
                >
                  <Form.Control
                    type="text"
                    placeholder="Escriba aquí su respuesta"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!hasHeardPhrase || listening}
                    style={{ maxWidth: "400px" }}
                  />
                  <Button
                    variant="success"
                    onClick={() => setConfirmation(true)}
                    className="me-2 mt-2"
                    disabled={!manualInput.trim() || !hasHeardPhrase}
                    style={{ minWidth: "150px" }}
                  >
                    Confirmar
                  </Button>
                </Form>
              </>
            )}

            {/* Botón de voz para responder */}
            {useVoice && !confirmation && (
              listening ? (
                <div className="mt-3">
                  <Spinner animation="grow" variant="primary" />
                  <p className="mt-2">Escuchando...</p>
                  <Button variant="danger" onClick={handleStop} style={{ minWidth: "150px" }}>
                    Detener
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleListen}
                  disabled={!hasHeardPhrase}
                  className="mt-3"
                  style={{ minWidth: "150px" }}
                >
                  <FaMicrophone className="me-2" />
                  Hablar
                </Button>
              )
            )}

            {/* Confirmación de la respuesta */}
            {confirmation && (
              <div className="mt-3">
                <Alert variant="secondary">
                  <p>¿Es correcta su respuesta?</p>
                  <strong>"{transcript || manualInput}"</strong>
                </Alert>
                <div className="d-flex justify-content-center">
                  <Button
                    variant="warning"
                    onClick={handleRetry}
                    className="me-3"
                    style={{ minWidth: "100px" }}
                  >
                    Reintentar
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleConfirm}
                    style={{ minWidth: "100px" }}
                  >
                    Sí
                  </Button>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* Botón para regresar al módulo anterior */}
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={isFirstModule}
          style={{ minWidth: "150px" }}
        >
          Regresar
        </Button>
      </div>
    </div>
  );
};

/**
 * ACTIVIDAD 2: Fluidez Verbal
 * El usuario dispone de 60 segundos para decir o escribir tantas palabras
 * que comiencen con la letra 'P' como sea posible. Se asigna 1 punto si se consiguen >= 11 palabras.
 * De lo contrario, 0 puntos.
 */
const FluidezVerbalActivity = ({
  onComplete,
  onPrevious,
  isFirstModule,
}) => {
  const [timer, setTimer] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [wordList, setWordList] = useState([]); // Guarda todas las palabras (no solo las que empiezan con 'p')
  const [inputWord, setInputWord] = useState("");
  const [useVoice, setUseVoice] = useState(true);
  const [listening, setListening] = useState(false);

  const [ttsSupported, setTtsSupported] = useState(true);
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);

  const recognitionRef = useRef(null);

  // Inicialización de reconocimiento de voz (solo una vez)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setUseVoice(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.interimResults = false;
      recognition.continuous = true;

      recognition.onresult = (event) => {
        // Procesa resultados finales
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const result = event.results[i][0].transcript
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9\s]/g, "")
              .trim();

            // Separa en palabras
            const words = result.split(/\s+/).filter((w) => w.length > 0);

            // Agrega cada palabra al wordList sin duplicados
            setWordList((prev) => {
              const combined = [...prev, ...words];
              return combined.filter(
                (word, index, self) => self.indexOf(word) === index
              );
            });
          }
        }
      };

      recognition.onerror = () => {
        setListening(false);
        alert("Error al reconocer la voz. Intente de nuevo.");
      };

      recognition.onend = () => {
        // Si todavía estamos escuchando y el tiempo no ha acabado, reinicia la escucha
        if (listening && isRunning && timer > 0) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    }

    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []); // Corregido: vacío array para que solo se ejecute una vez

  // Manejo del temporizador
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
  }, [isRunning, timer, listening]);

  // TTS para las instrucciones
  const speakInstructions = () => {
    if (!ttsSupported) return;
    if (isSpeakingLocal) {
      window.speechSynthesis.cancel();
      setIsSpeakingLocal(false);
    } else {
      const text =
        "Me gustaría que me diga el mayor número posible de palabras que comiencen por la letra P. Puede hablar o escribirlas. Tiene 60 segundos para hacerlo. Presione el botón Iniciar cuando esté listo.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onend = () => {
        setIsSpeakingLocal(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeakingLocal(true);
    }
  };

  // Iniciar la actividad
  const handleStart = () => {
    setTimer(60);
    setWordList([]);
    setIsRunning(true);
  };

  // Manejar la entrada manual
  const handleInputChange = (e) => {
    setInputWord(e.target.value);
  };

  const handleAddWord = () => {
    if (inputWord.trim()) {
      const cleaned = inputWord
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "")
        .trim();

      if (cleaned.length > 0) {
        setWordList((prev) => {
          const combined = [...prev, cleaned];
          return combined.filter(
            (word, index, arr) => arr.indexOf(word) === index
          );
        });
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

  // Iniciar reconocimiento de voz
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

  // Detener reconocimiento de voz
  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  // Calcular puntaje final y pasar datos al padre
  const calculateScore = () => {
    // Filtra las palabras que empiezan con 'p' y tengan longitud > 1
    const validWords = wordList.filter(
      (w) => w[0] === "p" && w.length > 1
    );
    // Puntaje 1 si >= 11 palabras, caso contrario 0
    const score = validWords.length >= 11 ? 1 : 0;
    onComplete(score, {
      activityScore: score,
      allWords: wordList,      // todas las palabras registradas
      validWords,             // solo las que comienzan con 'p'
    });
  };

  return (
    <div className="module-container">
      {/* Título e instrucciones */}
      <div className="d-flex align-items-center mb-2">
        <h4 className="mb-0">Fluidez Verbal</h4>
        <Button
          variant="link"
          onClick={speakInstructions}
          disabled={isSpeakingLocal}
          className="ms-3 text-decoration-none"
          style={{ whiteSpace: "nowrap", minWidth: "220px" }}
        >
          {isSpeakingLocal ? <FaStop /> : <FaPlay />} Escuchar Instrucciones
        </Button>
      </div>

      <p>
        Tiene 60 segundos para decir o escribir tantas palabras como sea posible.
        Se cuentan todas, pero solo puntúan las que comiencen con 'p' y tengan más de una letra.
      </p>

      {/* Botón para iniciar la actividad */}
      {!isRunning ? (
        <div className="text-center">
          <Button
            variant="primary"
            onClick={handleStart}
            className="mb-3"
            style={{ minWidth: "180px" }}
          >
            Iniciar
          </Button>
        </div>
      ) : (
        <>
          {/* Temporizador */}
          <div className="text-center mb-3">
            <h5>Tiempo restante: {timer}s</h5>
          </div>

          {/* Botones de voz y entrada manual */}
          <div className="d-flex justify-content-center align-items-center mb-4">
            {/* Botón para iniciar la escucha de voz */}
            {useVoice && !listening ? (
              <Button
                variant="primary"
                onClick={handleListen}
                className="me-3"
                style={{ minWidth: "120px" }}
              >
                <FaMicrophone className="me-1" />
                Hablar
              </Button>
            ) : listening ? (
              <div className="d-flex align-items-center me-3">
                <Spinner animation="grow" variant="primary" className="me-2" />
                <Button
                  variant="danger"
                  onClick={handleStopListening}
                  style={{ minWidth: "100px" }}
                >
                  Detener
                </Button>
              </div>
            ) : null}

            {/* Entrada manual de palabras */}
            <Form onSubmit={(e) => e.preventDefault()} className="d-flex">
              <Form.Control
                type="text"
                placeholder="Escriba una palabra"
                value={inputWord}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                style={{ minWidth: "180px" }}
              />
              <Button
                variant="success"
                onClick={handleAddWord}
                className="ms-2"
                style={{ minWidth: "100px" }}
              >
                Agregar
              </Button>
            </Form>
          </div>

          {/* Lista de todas las palabras registradas */}
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

      {/* Botón para regresar al módulo anterior */}
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={isFirstModule}
          style={{ minWidth: "150px" }}
        >
          Regresar
        </Button>
      </div>
    </div>
  );
};

/**
 * MÓDULO DE LENGUAJE:
 * Contiene 2 actividades:
 *   1) Repetición de Frases
 *   2) Fluidez Verbal
 * Envía (score, responses) al completarse, con la estructura:
 * {
 *   totalScore: <number>,
 *   activity1: { activityScore, phraseAnswers },
 *   activity2: { activityScore, words }
 * }
 */
const Lenguaje = ({ onComplete, onPrevious, isFirstModule }) => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [activity1Data, setActivity1Data] = useState(null);
  const [activity2Data, setActivity2Data] = useState(null);

  // Avanza a la segunda actividad
  const handleActivity1Complete = (score, data) => {
    setActivity1Data({
      activityScore: score,
      phraseAnswers: data.phraseAnswers || [],
    });
    setCurrentActivityIndex(1);
  };

  // Final de la segunda actividad
  const handleActivity2Complete = (score, data) => {
    setActivity2Data({
      activityScore: score,
      words: data.words || [],
    });
  };

  // Termina el módulo
  const handleNext = () => {
    const totalScore =
      (activity1Data?.activityScore || 0) +
      (activity2Data?.activityScore || 0);

    onComplete(
      totalScore,
      {
        totalScore,
        activity1: activity1Data,
        activity2: activity2Data,
      }
    );
  };

  const allActivitiesDone =
    activity1Data !== null && activity2Data !== null;

  return (
    <div className="module-container">
      {currentActivityIndex === 0 && (
        <RepeticionFrasesActivity
          onComplete={handleActivity1Complete}
          onPrevious={onPrevious}
          isFirstModule={isFirstModule}
        />
      )}
      {currentActivityIndex === 1 && (
        <FluidezVerbalActivity
          onComplete={handleActivity2Complete}
          onPrevious={onPrevious}
          isFirstModule={isFirstModule}
        />
      )}

      {/* Si ya estamos en la segunda actividad, muestra botones de Navegación */}
      {currentActivityIndex === 1 && (
        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="secondary"
            onClick={onPrevious}
            disabled={isFirstModule}
            style={{ minWidth: "150px" }}
          >
            Regresar
          </Button>
          <Button
            variant="success"
            onClick={handleNext}
            disabled={!allActivitiesDone}
            style={{ minWidth: "150px" }}
          >
            Continuar
          </Button>
        </div>
      )}

      {/* Botones de navegación rápida */}
      <div className="d-flex justify-content-center mt-4">
        <Button
          variant="info"
          onClick={() => setCurrentActivityIndex(0)}
          className="me-2"
          style={{ minWidth: "120px" }}
        >
          Ir a Actividad 1
        </Button>
        <Button
          variant="info"
          onClick={() => setCurrentActivityIndex(1)}
          style={{ minWidth: "120px" }}
        >
          Ir a Actividad 2
        </Button>
      </div>
    </div>
  );
};

export default Lenguaje;
