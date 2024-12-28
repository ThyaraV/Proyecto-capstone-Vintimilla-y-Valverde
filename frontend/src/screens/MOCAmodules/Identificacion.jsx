import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Form, Alert, Spinner } from "react-bootstrap";
import { FaPlay, FaStop, FaMicrophone } from "react-icons/fa";

const Memoria = ({ onComplete, onPrevious, isFirstModule }) => {
  const wordList = ["ROSTRO", "SEDA", "IGLESIA", "CLAVEL", "ROJO"];

  // Definición de etapas para mayor claridad
  const STAGE_FIRST_READ = 1;    // Lee la lista de palabras (1ra vez)
  const STAGE_FIRST_RECALL = 2; // Recuerdo después de 1ra lectura
  const STAGE_SECOND_READ = 3;   // Lee la lista de palabras (2da vez)
  const STAGE_SECOND_RECALL = 4; // Recuerdo después de 2da lectura
  const STAGE_FINAL = 5;         // Finaliza el módulo

  const [stage, setStage] = useState(STAGE_FIRST_READ);
  const [responses, setResponses] = useState([]);  // Almacena las palabras recordadas (voz o texto)
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [ttsSupported, setTtsSupported] = useState(true);
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  const [showConfirmation, setShowConfirmation] = useState(false); // Muestra botones de confirmación
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false); // Controla si está reproduciendo TTS
  const [manualWords, setManualWords] = useState("");   // Texto de entrada manual
  const [message, setMessage] = useState("");           // Mensaje final (fase final)

  const recognitionRef = useRef(null); // Reconocimiento de voz

  // Inicializar TTS y reconocimiento de voz
  useEffect(() => {
    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript.toUpperCase().trim();
        setTranscript(result);
        setListening(false);
        setShowConfirmation(true);
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

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Manejar acciones basadas en 'stage'
  useEffect(() => {
    const executeStageActions = async () => {
      if (stage === STAGE_FIRST_READ || stage === STAGE_SECOND_READ) {
        // Si está en una etapa de lectura de palabras, primero reproducimos las instrucciones y luego la lista
        let instructions;
        if (stage === STAGE_FIRST_READ) {
          instructions =
            "Ésta es una prueba de memoria. Le voy a leer una lista de palabras que debe recordar. Escuche con atención.";
        } else {
          instructions =
            "Ahora le voy a leer la misma lista de palabras una vez más. Intente acordarse del mayor número posible de palabras, incluyendo las que repitió en la primera ronda.";
        }
        await speakText(instructions);
        await readWords();
      }
    };
    executeStageActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Función para reproducir un texto con TTS
  const speakText = (text) => {
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

  // Leer la lista de palabras una a una
  const readWords = () => {
    return new Promise((resolve) => {
      if (!ttsSupported) {
        setStage((prev) => prev + 1);
        resolve();
        return;
      }
      let index = 0;
      const readNext = () => {
        if (index < wordList.length) {
          const utterance = new SpeechSynthesisUtterance(wordList[index]);
          utterance.lang = "es-ES";
          utterance.onend = () => {
            index++;
            setTimeout(() => {
              readNext();
            }, 1000); // 1 seg de pausa
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setStage((prev) => prev + 1);
          resolve();
        }
      };
      readNext();
    });
  };

  // Iniciar reconocimiento de voz para recordar palabras
  const handleStartRecall = () => {
    if (recognitionSupported) {
      setListening(true);
      setTranscript("");
      setShowConfirmation(false);
      recognitionRef.current.start();
    } else {
      alert("El reconocimiento de voz no está disponible en su navegador. Por favor, use la entrada manual.");
    }
  };

  // Detener reconocimiento de voz
  const handleStopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
    setListening(false);
    setShowConfirmation(false);
  };

  // Confirmar la palabra reconocida
  const handleConfirmWord = () => {
    addResponse(transcript);
    setTranscript("");
    setShowConfirmation(false);
    if (stage === STAGE_SECOND_RECALL) {
      handleNext();
    }
  };

  // Añadir palabra(s) introducida(s) manualmente
  const handleAddManualWords = () => {
    if (manualWords.trim() !== "") {
      // Permitir que el usuario introduzca varias palabras separadas por comas o espacios
      const splitted = manualWords
        .toUpperCase()
        .split(/[\s,]+/)
        .filter((w) => w);
      splitted.forEach((w) => addResponse(w));
      setManualWords("");
      // Si es la segunda etapa de recuerdo, avanzar automáticamente
      if (stage === STAGE_SECOND_RECALL) {
        handleNext();
      }
    }
  };

  // Añadir respuesta única al array 'responses'
  const addResponse = (word) => {
    if (!word) return;
    setResponses((prev) => [...prev, word]);
  };

  // Siguiente stage al decir "No recuerdo más"
  const handleNoMoreWords = () => {
    if (stage === STAGE_FIRST_RECALL) {
      setStage(STAGE_SECOND_READ);
    } else if (stage === STAGE_SECOND_RECALL) {
      setStage(STAGE_FINAL);
      setMessage(
        "Recuerde estas palabras, ya que deberá repetirlas más tarde al final de la prueba."
      );
    }
  };

  // Avanzar al siguiente módulo
  const handleNext = () => {
    // Evaluar las respuestas y calcular el puntaje total
    let uniqueResponses = Array.from(new Set(responses));
    let score = 0;
    uniqueResponses.forEach((word) => {
      if (wordList.includes(word)) {
        score += 1;
      }
    });
    onComplete(score, { responses: uniqueResponses });
  };

  // Retornar a la etapa anterior
  const handlePreviousStage = () => {
    if (stage > STAGE_FIRST_READ) {
      setStage((prev) => prev - 1);
    }
  };

  // Reintentar al haber capturado mal la palabra
  const handleRetry = () => {
    setTranscript("");
    setShowConfirmation(false);
    handleStartRecall();
  };

  // Botón "Escuchar Instrucciones"
  const handleSpeakInstructions = () => {
    if (!ttsSupported) return;
    if (isSpeakingLocal) {
      window.speechSynthesis.cancel();
      setIsSpeakingLocal(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(
        "Prueba de memoria. Le leeré una lista de palabras que deberá recordar. Escuche y luego repita todas las que pueda."
      );
      utterance.lang = "es-ES";
      utterance.onend = () => {
        setIsSpeakingLocal(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeakingLocal(true);
    }
  };

  // Función para manejar el Enter en el input manual
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (manualWords.trim() && (stage === STAGE_FIRST_RECALL || stage === STAGE_SECOND_RECALL)) {
        handleAddManualWords();
      }
    }
  };

  return (
    <div className="module-container">
      <div className="d-flex align-items-center">
        <h4 className="mb-0">Memoria</h4>
        <Button
          variant="link"
          onClick={handleSpeakInstructions}
          disabled={isSpeakingLocal}
          className="ms-3 text-decoration-none d-flex align-items-center justify-content-center"
          style={{ whiteSpace: "nowrap", minWidth: "220px" }}
        >
          {isSpeakingLocal ? <FaStop /> : <FaPlay />} Escuchar Instrucciones
        </Button>
      </div>

      {/* Etapas de lectura de palabras */}
      {(stage === STAGE_FIRST_READ || stage === STAGE_SECOND_READ) && (
        <div className="text-center mt-3">
          <Spinner animation="grow" variant="primary" />
          <p className="mt-3">
            {stage === STAGE_FIRST_READ
              ? "Ésta es una prueba de memoria. Le voy a leer una lista de palabras que debe recordar."
              : "Repetiré la lista de palabras. Intente recordarlas."}
          </p>
        </div>
      )}

      {/* Etapas de recuerdo de palabras */}
      {(stage === STAGE_FIRST_RECALL || stage === STAGE_SECOND_RECALL) && !message && (
        <div className="text-center mt-3">
          <p>Dígame todas las palabras que recuerde.</p>

          {listening ? (
            <div>
              <Spinner animation="grow" variant="primary" />
              <p className="mt-2">Escuchando...</p>
              <Button
                variant="danger"
                onClick={handleStopListening}
                style={{ minWidth: "220px" }}
              >
                Detener
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={handleStartRecall}
              className="d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ minWidth: "220px" }}
            >
              <FaMicrophone className="me-2" />
              Hablar
            </Button>
          )}

          {showConfirmation && (
            <div className="mt-3">
              <Alert variant="secondary">
                <p>¿Es correcta su palabra?</p>
                <strong>"{transcript}"</strong>
              </Alert>
              <Row className="justify-content-center">
                <Col xs={6} className="d-flex justify-content-end">
                  <Button variant="warning" onClick={handleRetry}>
                    Reintentar
                  </Button>
                </Col>
                <Col xs={6} className="d-flex justify-content-start">
                  <Button variant="success" onClick={handleConfirmWord}>
                    Sí
                  </Button>
                </Col>
              </Row>
            </div>
          )}

          {/* Entrada manual */}
          <Form onSubmit={(e) => e.preventDefault()} className="mt-3 d-flex flex-column align-items-center">
            <Form.Group style={{ width: "100%", maxWidth: "400px" }}>
              <Form.Control
                type="text"
                placeholder="Escriba una o varias palabras separadas por comas"
                value={manualWords}
                onChange={(e) => setManualWords(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
              />
            </Form.Group>
            <Button
              variant="success"
              onClick={handleAddManualWords}
              className="mt-2"
              style={{ width: "220px" }}
              disabled={!manualWords.trim()}
            >
              Agregar
            </Button>
          </Form>

          {/* Lista de palabras recordadas */}
          <div className="mt-3">
            <p>Palabras recordadas:</p>
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {responses.map((word, index) => (
                <li key={index}>{word}</li>
              ))}
            </ul>
          </div>

          <Button
            variant="secondary"
            onClick={handleNoMoreWords}
            className="mt-3 mx-auto d-block"
            style={{ minWidth: "220px" }}
          >
            No recuerdo más
          </Button>
        </div>
      )}

      {/* Etapa de finalización del módulo */}
      {stage === STAGE_FINAL && (
        <div className="text-center mt-3">
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
            Regresar
          </Button>
        </div>
      )}
    </div>
  );
};

export default Memoria;
