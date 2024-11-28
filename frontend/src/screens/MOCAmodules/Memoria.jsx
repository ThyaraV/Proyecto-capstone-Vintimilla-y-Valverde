import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Form, Alert, Spinner } from "react-bootstrap";

const Memoria = ({ onComplete, onPrevious, isFirstModule }) => {
  const wordList = ["ROSTRO", "SEDA", "IGLESIA", "CLAVEL", "ROJO"];
  
  // Definición de etapas para mayor claridad
  const STAGE_FIRST_READ = 1;
  const STAGE_FIRST_RECALL = 2;
  const STAGE_SECOND_READ = 3;
  const STAGE_SECOND_RECALL = 4;
  const STAGE_FINAL = 5;

  const [stage, setStage] = useState(STAGE_FIRST_READ); // Inicialmente en la primera lectura
  const [responses, setResponses] = useState([]); // Almacena las palabras recordadas
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
  }, []); // Solo se ejecuta una vez al montar

  // useEffect para manejar acciones basadas en el stage
  useEffect(() => {
    const executeStageActions = async () => {
      if (stage === STAGE_FIRST_READ || stage === STAGE_SECOND_READ) {
        // Si está en una etapa de lectura, habla las instrucciones y lee las palabras
        const instructions =
          stage === STAGE_FIRST_READ
            ? "Ésta es una prueba de memoria. Le voy a leer una lista de palabras que debe recordar. Escuche con atención."
            : "Ahora le voy a leer la misma lista de palabras una vez más. Intente acordarse del mayor número posible de palabras, incluyendo las que repitió en la primera ronda.";
        await speakInstructions(instructions);
        await readWords();
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

  // Función para leer las palabras una por una
  const readWords = () => {
    return new Promise((resolve) => {
      if (!ttsSupported) {
        // Avanzar a la etapa de recuerdo si TTS no está soportado
        setStage((prevStage) => prevStage + 1);
        resolve();
        return;
      }

      let index = 0;
      const readNextWord = () => {
        if (index < wordList.length) {
          const utterance = new SpeechSynthesisUtterance(wordList[index]);
          utterance.lang = "es-ES";
          utterance.onend = () => {
            index++;
            setTimeout(() => {
              readNextWord();
            }, 1000); // 1 segundo de pausa entre palabras
          };
          window.speechSynthesis.speak(utterance);
        } else {
          // Avanzar a la siguiente etapa después de leer todas las palabras
          setStage((prevStage) => prevStage + 1);
          resolve();
        }
      };

      readNextWord();
    });
  };

  // Función para iniciar el reconocimiento de voz para recordar palabras
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

  // Función para confirmar la palabra reconocida y agregarla a las respuestas
  const handleConfirmWord = () => {
    const word = transcript.toUpperCase();
    if (word !== "") {
      setResponses((prevResponses) => [...prevResponses, word]);
    }
    setTranscript("");
    setShowButtons(false);
  };

  // Función para manejar la acción "No recuerdo más"
  const handleNoMoreWords = () => {
    if (stage === STAGE_FIRST_RECALL) {
      // Primer intento de recuerdo
      setStage(STAGE_SECOND_READ);
    } else if (stage === STAGE_SECOND_RECALL) {
      // Segundo intento de recuerdo
      setStage(STAGE_FINAL);
      setMessage(
        "Recuerde estas palabras, ya que deberá repetirlas más tarde al final de la prueba."
      );
    }
  };

  // Función para avanzar al siguiente módulo con el puntaje calculado
  const handleNext = () => {
    // Evaluar las respuestas y calcular el puntaje total
    let uniqueResponses = [...new Set(responses)];
    let score = 0;
    uniqueResponses.forEach((word) => {
      if (wordList.includes(word)) {
        score += 1;
      }
    });
    onComplete(score, { responses: uniqueResponses });
  };

  // Función para regresar a la etapa anterior
  const handlePreviousAnimal = () => {
    if (stage > STAGE_FIRST_READ) {
      setStage((prevStage) => prevStage - 1);
    }
  };

  // Limpieza al desmontar el componente o finalizar el módulo
  useEffect(() => {
    return () => {
      if (recognitionRef.current && listening) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [listening]);

  // Función para manejar reintentar
  const handleRetry = () => {
    setTranscript("");
    setShowButtons(false);
    handleStartRecall();
  };

  return (
    <div className="module-container">
      <h4>Memoria</h4>
      
      {/* Etapas de lectura de palabras */}
      {(stage === STAGE_FIRST_READ || stage === STAGE_SECOND_READ) && (
        <div className="text-center">
          <p >
            {stage === STAGE_FIRST_READ
              ? "Ésta es una prueba de memoria. Le voy a leer una lista de palabras que debe recordar. Escuche con atención."
              : "Ahora le voy a leer la misma lista de palabras una vez más. Intente acordarse del mayor número posible de palabras, incluyendo las que repitió en la primera ronda."}
          </p>
          <Spinner animation="grow" variant="primary" />
        </div>
      )}

      {/* Etapas de recuerdo de palabras */}
      {(stage === STAGE_FIRST_RECALL || stage === STAGE_SECOND_RECALL) && !message && (
        <div className="text-center">
          <p >
            Dígame todas las palabras que pueda recordar, en el orden que desee.
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
              <Button variant="success" onClick={handleConfirmWord} className="me-2">
                Sí
              </Button>
              <Button variant="warning" onClick={handleRetry}>
                Reintentar
              </Button>
            </div>
          )}

          {/* Lista de palabras recordadas */}
          <div className="mt-3">
            <p>Palabras recordadas:</p>
            <ul>
              {responses.map((word, index) => (
                <li key={index}>{word}</li>
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

export default Memoria;
