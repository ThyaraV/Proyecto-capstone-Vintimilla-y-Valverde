import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Alert, Spinner } from "react-bootstrap";

const Atencion = ({ onComplete, onPrevious, isFirstModule }) => {
  // Definición de etapas para mayor claridad
  const STAGE_FIRST_SEQUENCE_READ = 1;
  const STAGE_FIRST_SEQUENCE_RECALL = 2;
  const STAGE_SECOND_SEQUENCE_READ = 3;
  const STAGE_SECOND_SEQUENCE_RECALL = 4;
  const STAGE_FINAL = 5;

  // Listas de secuencias
  const firstSequence = ["5", "3", "8", "1", "6"];
  const secondSequence = ["2", "4", "7"]; // Inversa: "7", "4", "2"

  const [stage, setStage] = useState(STAGE_FIRST_SEQUENCE_READ); // Inicialmente en la primera lectura
  const [responses, setResponses] = useState({ first: [], second: [] }); // Almacena las respuestas
  const [listening, setListening] = useState(false); // Indica si el micrófono está activo
  const [transcript, setTranscript] = useState(""); // Última palabra reconocida
  const [message, setMessage] = useState(""); // Mensaje informativo al paciente
  const [ttsSupported, setTtsSupported] = useState(true); // Soporte para TTS
  const [recognitionSupported, setRecognitionSupported] = useState(true); // Soporte para reconocimiento de voz
  const [showButtons, setShowButtons] = useState(false); // Muestra los botones de confirmación

  const recognitionRef = useRef(null); // Referencia al objeto SpeechRecognition

  // Inicialización de TTS y reconocimiento de voz
  useEffect(() => {
    // Verificar soporte para SpeechSynthesis
    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }

    // Verificar soporte para SpeechRecognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setListening(false);
        setShowButtons(true);
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

    // Cleanup function to stop recognition when component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta una vez al montar

  // useEffect para manejar acciones basadas en el stage
  useEffect(() => {
    const executeStageActions = async () => {
      if (
        stage === STAGE_FIRST_SEQUENCE_READ ||
        stage === STAGE_SECOND_SEQUENCE_READ
      ) {
        // Si está en una etapa de lectura, habla las instrucciones y lee las secuencias
        const instructions =
          stage === STAGE_FIRST_SEQUENCE_READ
            ? "Le voy a leer una serie de números, y cuando haya terminado, me gustaría que repita estos números en el mismo orden en el que yo los he dicho."
            : "Ahora le voy a leer la misma serie de números una vez más. Intente repetirlos en el orden inverso al que yo los he dado.";
        await speakInstructions(instructions);
        await readSequence();
      }
    };

    executeStageActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]); // Solo reacciona a cambios en 'stage'

  // Función para hablar instrucciones usando TTS
  const speakInstructions = (text) => {
    return new Promise((resolve) => {
      if (!ttsSupported) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  // Función para leer las secuencias una por una
  const readSequence = () => {
    return new Promise((resolve) => {
      if (!ttsSupported) {
        // Avanzar a la etapa de recuerdo si TTS no está soportado
        setStage((prevStage) => prevStage + 1);
        resolve();
        return;
      }

      let index = 0;
      const currentSequence =
        stage === STAGE_FIRST_SEQUENCE_READ
          ? firstSequence
          : secondSequence;

      const readNextNumber = () => {
        if (index < currentSequence.length) {
          const utterance = new SpeechSynthesisUtterance(currentSequence[index]);
          utterance.lang = "es-ES";
          utterance.onend = () => {
            index++;
            setTimeout(() => {
              readNextNumber();
            }, 1000); // 1 segundo de pausa entre números
          };
          window.speechSynthesis.speak(utterance);
        } else {
          // Avanzar a la siguiente etapa después de leer todas las secuencias
          setStage((prevStage) => prevStage + 1);
          resolve();
        }
      };

      readNextNumber();
    });
  };

  // Función para iniciar el reconocimiento de voz para recordar números
  const handleStartRecall = () => {
    if (recognitionSupported) {
      setListening(true);
      setTranscript("");
      setShowButtons(false);
      recognitionRef.current.start();
    } else {
      alert(
        "El reconocimiento de voz no está disponible en su navegador. Por favor, use la entrada manual."
      );
    }
  };

  // Función para detener el reconocimiento de voz
  const handleStopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
    setListening(false);
    setShowButtons(false);
  };

  // Función para confirmar la palabra/número reconocida y agregarla a las respuestas
  const handleConfirmResponse = () => {
    const number = transcript.trim();
    if (number !== "") {
      setResponses((prevResponses) => {
        const updatedResponses = { ...prevResponses };
        if (stage === STAGE_FIRST_SEQUENCE_RECALL) {
          updatedResponses.first.push(number);
        } else if (stage === STAGE_SECOND_SEQUENCE_RECALL) {
          updatedResponses.second.push(number);
        }
        return updatedResponses;
      });
    }
    setTranscript("");
    setShowButtons(false);
  };

  // Función para manejar la acción "No recuerdo más"
  const handleNoMoreWords = () => {
    if (stage === STAGE_FIRST_SEQUENCE_RECALL) {
      // Avanzar a la segunda lectura de secuencias
      setStage(STAGE_SECOND_SEQUENCE_READ);
    } else if (stage === STAGE_SECOND_SEQUENCE_RECALL) {
      // Finalizar el módulo
      setStage(STAGE_FINAL);
      setMessage(
        "Ha completado el módulo de Atención. Por favor, presione continuar para avanzar."
      );
    }
  };

  // Función para avanzar al siguiente módulo con el puntaje calculado
  const handleNext = () => {
    // Evaluar las respuestas y calcular el puntaje total
    const { first, second } = responses;
    let score = 0;

    // Validar la secuencia numérica
    if (arraysEqual(first, firstSequence)) {
      score += 1;
    }

    // Validar la secuencia numérica inversa
    const expectedSecond = [...secondSequence].reverse();
    if (arraysEqual(second, expectedSecond)) {
      score += 1;
    }

    onComplete(score, { first, second });
  };

  // Función para regresar a la etapa anterior
  const handlePreviousStage = () => {
    if (stage > STAGE_FIRST_SEQUENCE_READ) {
      setStage((prevStage) => prevStage - 1);
    }
  };

  // Función para verificar si dos arreglos son iguales
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].toUpperCase() !== b[i].toUpperCase()) return false;
    }
    return true;
  };

  return (
    <div className="module-container">
      <h4>Atención</h4>

      {/* Etapas de lectura de secuencias */}
      {(stage === STAGE_FIRST_SEQUENCE_READ ||
        stage === STAGE_SECOND_SEQUENCE_READ) && (
        <div className="text-center">
          <Spinner animation="grow" variant="primary" />
          <p className="mt-2">Leyendo secuencia...</p>
        </div>
      )}

      {/* Etapas de recuerdo de secuencias */}
      {(stage === STAGE_FIRST_SEQUENCE_RECALL ||
        stage === STAGE_SECOND_SEQUENCE_RECALL) &&
        !message && (
          <div className="text-center">
            <p className="instructions-text">
              {stage === STAGE_FIRST_SEQUENCE_RECALL
                ? "Repita los números en el mismo orden en el que los escuchó."
                : "Repita los números en el orden inverso al que los escuchó."}
            </p>

            {listening ? (
              <div>
                <Spinner animation="grow" variant="primary" />
                <p className="mt-2">Escuchando...</p>
                <Button variant="danger" onClick={handleStopListening}>
                  Detener
                </Button>
              </div>
            ) : (
              <Button variant="primary" onClick={handleStartRecall}>
                Hablar
              </Button>
            )}

            {showButtons && (
              <div className="mt-3">
                <Alert variant="secondary">
                  <p>¿Es correcta su respuesta?</p>
                  <strong>"{transcript}"</strong>
                </Alert>
                <Button
                  variant="success"
                  onClick={handleConfirmResponse}
                  className="me-2"
                >
                  Sí
                </Button>
                <Button
                  variant="warning"
                  onClick={() => setTranscript("")}
                >
                  Reintentar
                </Button>
              </div>
            )}

            {/* Lista de números recordados */}
            <div className="mt-3">
              <p>Números recordados:</p>
              <ul>
                {(stage === STAGE_FIRST_SEQUENCE_RECALL
                  ? responses.first
                  : responses.second
                ).map((number, index) => (
                  <li key={index}>{number}</li>
                ))}
              </ul>
            </div>

            <Button variant="secondary" onClick={handleNoMoreWords}>
              No recuerdo más
            </Button>
          </div>
        )}

      {/* Etapa de finalización del módulo */}
      {stage === STAGE_FINAL && (
        <div className="text-center">
          {message && <Alert variant="info">{message}</Alert>}
          <Button variant="success" onClick={handleNext}>
            Continuar
          </Button>
        </div>
      )}

      {/* Botón para regresar al módulo anterior */}
      {stage !== STAGE_FINAL && (
        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="secondary"
            onClick={onPrevious}
            disabled={isFirstModule}
          >
            Regresar al Módulo Anterior
          </Button>
        </div>
      )}
    </div>
  );
};

export default Atencion;
