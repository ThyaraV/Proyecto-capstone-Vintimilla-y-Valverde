import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Form, Alert, Spinner } from "react-bootstrap";
import { FaPlay, FaStop, FaMicrophone } from "react-icons/fa";

/**
 * Actividad 1: Secuencia Numérica
 * El usuario escucha una serie de números y debe repetirlos (orden normal e inverso).
 */
const NumberSequenceActivity = ({
  onComplete,
  onPrevious,
  isFirstModule,
}) => {
  const STAGE_FIRST_SEQUENCE_READ = 1;
  const STAGE_FIRST_SEQUENCE_RECALL = 2;
  const STAGE_SECOND_SEQUENCE_READ = 3;
  const STAGE_SECOND_SEQUENCE_RECALL = 4;
  const STAGE_FINAL = 5;

  const firstSequence = ["5", "3", "8", "1", "6"];
  const secondSequence = ["2", "4", "7"];

  const [stage, setStage] = useState(STAGE_FIRST_SEQUENCE_READ);
  const [responses, setResponses] = useState({ first: [], second: [] });
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [ttsSupported, setTtsSupported] = useState(true);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [showButtons, setShowButtons] = useState(false);
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  const [message, setMessage] = useState("");
  const [manualInputValue, setManualInputValue] = useState("");

  const recognitionRef = useRef(null);

  // Verificar TTS y SpeechRecognition
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

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Manejo de etapas
  useEffect(() => {
    const handleStage = async () => {
      if (
        stage === STAGE_FIRST_SEQUENCE_READ ||
        stage === STAGE_SECOND_SEQUENCE_READ
      ) {
        let instructions;
        if (stage === STAGE_FIRST_SEQUENCE_READ) {
          instructions =
            "Le voy a leer una serie de números, y cuando termine, repítalos en el mismo orden.";
        } else {
          instructions =
            "Ahora le voy a leer otra serie de números. Repítalos en orden inverso.";
        }
        await speakText(instructions);
        await readSequence();
      }
    };
    handleStage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

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

  const readSequence = () => {
    return new Promise((resolve) => {
      if (!ttsSupported) {
        setStage((prev) => prev + 1);
        resolve();
        return;
      }
      const sequence =
        stage === STAGE_FIRST_SEQUENCE_READ ? firstSequence : secondSequence;
      let index = 0;
      const readNext = () => {
        if (index < sequence.length) {
          const utterance = new SpeechSynthesisUtterance(sequence[index]);
          utterance.lang = "es-ES";
          utterance.onend = () => {
            index++;
            setTimeout(() => {
              readNext();
            }, 700);
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

  const speakInstructions = () => {
    if (!ttsSupported) return;
    if (isSpeakingLocal) {
      window.speechSynthesis.cancel();
      setIsSpeakingLocal(false);
    } else {
      const text =
        "Módulo de Atención, Actividad 1. Escuche una serie de números y repítalos.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onend = () => setIsSpeakingLocal(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingLocal(true);
    }
  };

  const handleStartRecall = () => {
    if (!recognitionSupported) {
      alert("El reconocimiento de voz no está disponible.");
      return;
    }
    setListening(true);
    setTranscript("");
    setShowButtons(false);
    recognitionRef.current.start();
  };

  const handleStopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
    setShowButtons(false);
  };

  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].toLowerCase() !== b[i].toLowerCase()) return false;
    }
    return true;
  };

  const handleConfirmResponse = () => {
    const number = transcript.trim();
    if (number) {
      setResponses((prev) => {
        const updated = { ...prev };
        if (stage === STAGE_FIRST_SEQUENCE_RECALL) {
          updated.first.push(number);
        } else if (stage === STAGE_SECOND_SEQUENCE_RECALL) {
          updated.second.push(number);
        }
        return updated;
      });
    }
    setTranscript("");
    setShowButtons(false);
  };

  const handleAddManualSequence = () => {
    if (!manualInputValue.trim()) return;
    const splitted = manualInputValue
      .split(/[\s,]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (splitted.length > 0) {
      setResponses((prev) => {
        const updated = { ...prev };
        if (stage === STAGE_FIRST_SEQUENCE_RECALL) {
          updated.first.push(...splitted);
        } else if (stage === STAGE_SECOND_SEQUENCE_RECALL) {
          updated.second.push(...splitted);
        }
        return updated;
      });
    }
    setManualInputValue("");
  };

  const handleManualKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddManualSequence();
    }
  };

  const handleNoMoreWords = () => {
    if (stage === STAGE_FIRST_SEQUENCE_RECALL) {
      setStage(STAGE_SECOND_SEQUENCE_READ);
    } else if (stage === STAGE_SECOND_SEQUENCE_RECALL) {
      setStage(STAGE_FINAL);
      setMessage("Ha completado la Actividad 1 de Atención.");
    }
  };

  const handleNext = () => {
    const { first, second } = responses;
    let score = 0;
    if (arraysEqual(first, firstSequence)) {
      score += 1;
    }
    const expectedSecond = [...secondSequence].reverse();
    if (arraysEqual(second, expectedSecond)) {
      score += 1;
    }
    onComplete(score, { ...responses });
  };

  return (
    <div className="module-container">
      <div className="d-flex align-items-center mb-2">
        <h5 className="mb-0">Actividad 1: Secuencia Numérica</h5>
        <Button
          variant="link"
          onClick={speakInstructions}
          disabled={isSpeakingLocal}
          className="ms-3 text-decoration-none"
          style={{ whiteSpace: "nowrap", minWidth: "180px" }}
        >
          {isSpeakingLocal ? <FaStop /> : <FaPlay />} Escuchar Instrucciones
        </Button>
      </div>

      {(stage === STAGE_FIRST_SEQUENCE_READ ||
        stage === STAGE_SECOND_SEQUENCE_READ) && (
        <div className="text-center mt-3">
          <Spinner animation="grow" variant="primary" />
          <p className="mt-3">
            {stage === STAGE_FIRST_SEQUENCE_READ
              ? "Le leeré una serie de números, repítalos en el mismo orden."
              : "Le leeré otra serie de números, repítalos en orden inverso."}
          </p>
        </div>
      )}

      {(stage === STAGE_FIRST_SEQUENCE_RECALL ||
        stage === STAGE_SECOND_SEQUENCE_RECALL) &&
        !message && (
          <div className="text-center mt-3">
            <p>
              {stage === STAGE_FIRST_SEQUENCE_RECALL
                ? "Repita los números en el mismo orden."
                : "Repita los números en orden inverso."}
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
              <Button
                variant="primary"
                onClick={handleStartRecall}
                className="d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ minWidth: "150px" }}
              >
                <FaMicrophone className="me-2" />
                Hablar
              </Button>
            )}

            {showButtons && (
              <div className="mt-3">
                <Alert variant="secondary">
                  <p>¿Es correcta su respuesta?</p>
                  <strong>{transcript}</strong>
                </Alert>
                <Row>
                  <Col className="d-flex justify-content-start">
                    <Button
                      variant="warning"
                      onClick={() => setTranscript("")}
                    >
                      Reintentar
                    </Button>
                  </Col>
                  <Col className="d-flex justify-content-end">
                    <Button
                      variant="success"
                      onClick={handleConfirmResponse}
                    >
                      Sí
                    </Button>
                  </Col>
                </Row>
              </div>
            )}

            {/* Entrada manual */}
            <Form
              onSubmit={(e) => e.preventDefault()}
              className="mt-3 d-flex flex-column align-items-center"
            >
              <Form.Control
                type="text"
                placeholder="Escriba los números separados por espacios o comas"
                value={manualInputValue}
                onChange={(e) => setManualInputValue(e.target.value)}
                onKeyPress={handleManualKeyPress}
                style={{ maxWidth: "350px" }}
              />
              <Button
                variant="success"
                onClick={handleAddManualSequence}
                className="mt-2"
              >
                Agregar
              </Button>
            </Form>

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

            <Button
              variant="secondary"
              onClick={handleNoMoreWords}
              className="mt-3 mx-auto d-block"
              style={{ minWidth: "200px" }}
            >
              No recuerdo más
            </Button>
          </div>
        )}

      {stage === STAGE_FINAL && (
        <div className="text-center mt-3">
          {message && <Alert variant="info">{message}</Alert>}
          <Button variant="success" onClick={handleNext}>
            Continuar
          </Button>
        </div>
      )}

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

/**
 * Actividad 2: Concentración (letras)
 * El usuario escucha una serie de letras (A, B, C, etc.) a un ritmo de una por segundo.
 * Debe presionar la barra espaciadora (o un botón "Golpe") cada vez que escuche la letra 'A'.
 * Si comete más de un error => 0 puntos, si comete 0 o 1 error => 1 punto
 */
const ConcentracionActivity = ({
  onComplete,
  onPrevious,
  isFirstModule,
}) => {
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [hits, setHits] = useState([]);
  const [letters] = useState(["F", "B", "A", "C", "C", "A", "D", "A", "G"]); // Ejemplo
  const intervalRef = useRef(null);

  // Al montar
  useEffect(() => {
    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }
    // Listener para la barra espaciadora
    const handleKeydown = (e) => {
      if (playing && e.code === "Space") {
        e.preventDefault();
        handleGolpe();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      stopSequence();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [playing]);

  const speakInstructions = () => {
    if (!ttsSupported) return;
    if (isSpeakingLocal) {
      window.speechSynthesis.cancel();
      setIsSpeakingLocal(false);
    } else {
      const text =
        "Voy a leerle una serie de letras. Cada vez que diga la letra A, presione la barra espaciadora o el botón de 'Golpe'. Si la letra no es A, no haga nada.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onend = () => setIsSpeakingLocal(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingLocal(true);
    }
  };

  const startSequence = () => {
    setPlaying(true);
    setCurrentIndex(0);
    setErrors(0);
    setHits([]);
    intervalRef.current = setInterval(() => {
      // Avanzar la secuencia
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        if (newIndex >= letters.length) {
          stopSequence();
        }
        return newIndex;
      });
    }, 1000);
  };

  const stopSequence = () => {
    setPlaying(false);
    clearInterval(intervalRef.current);
  };

  // Cada vez que la letra sea 'A' => presionar golpe
  // Si presiona cuando no es 'A', es error
  const handleGolpe = () => {
    const currentLetter = letters[currentIndex];
    if (currentLetter === "A") {
      setHits((prev) => [...prev, currentIndex]);
    } else {
      setErrors((prev) => prev + 1);
    }
  };

  const handleFinish = () => {
    stopSequence();
    // Calcular puntaje
    // 0 => si comete más de 1 error. 1 => si 0 o 1 error.
    const score = errors > 1 ? 0 : 1;
    onComplete(score, { hits, errors });
  };

  return (
    <div className="module-container">
      <div className="d-flex align-items-center mb-2">
        <h5 className="mb-0">Actividad 2: Concentración (Letras)</h5>
        <Button
          variant="link"
          onClick={speakInstructions}
          disabled={isSpeakingLocal}
          className="ms-3 text-decoration-none"
          style={{ whiteSpace: "nowrap", minWidth: "180px" }}
        >
          {isSpeakingLocal ? <FaStop /> : <FaPlay />} Escuchar Instrucciones
        </Button>
      </div>
      <p className="mt-3">
        Voy a leer una serie de letras a un ritmo de una por segundo. Cada vez que la letra sea 'A', presione "Golpe" o la barra espaciadora.
      </p>

      {!playing ? (
        <Button variant="primary" onClick={startSequence} className="mb-3">
          Iniciar Lectura de Letras
        </Button>
      ) : (
        <>
          <h5>Letra actual:</h5>
          <p style={{ fontSize: "2rem" }}>
            {letters[currentIndex] || "--"}
          </p>
          <Button variant="danger" onClick={stopSequence} className="mb-3">
            Detener
          </Button>
        </>
      )}

      <Button
        variant="success"
        onClick={handleGolpe}
        className="d-block mx-auto mb-3"
        style={{ minWidth: "150px" }}
        disabled={!playing}
      >
        Golpe
      </Button>

      <div className="mt-3">
        <p>
          Errores: <strong>{errors}</strong>
        </p>
        <p>
          Golpes acertados: <strong>{hits.length}</strong>
        </p>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={isFirstModule}
        >
          Regresar
        </Button>
        <Button variant="success" onClick={handleFinish}>
          Continuar
        </Button>
      </div>
    </div>
  );
};

/**
 * Actividad 3: Substracción en secuencia de 7
 * Se pide al usuario restar 7 sucesivamente desde 100, 5 veces.
 * Puntuación:
 *  - 0 si ninguna sustracción es correcta
 *  - 1 si 1 sustracción correcta
 *  - 2 si 2 o 3 correctas
 *  - 3 si 4 o 5 correctas
 * Nota: Si se equivoca en la primera pero sigue restando 7 correctamente => se cuentan como correctas
 */
const Sub7Activity = ({
  onComplete,
  onPrevious,
  isFirstModule,
}) => {
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [steps, setSteps] = useState([]);  // Para almacenar entradas del usuario
  const correctSequence = [93, 86, 79, 72, 65]; // 5 sustracciones

  useEffect(() => {
    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }
  }, []);

  const speakInstructions = () => {
    if (!ttsSupported) return;
    if (isSpeakingLocal) {
      window.speechSynthesis.cancel();
      setIsSpeakingLocal(false);
    } else {
      const text =
        "Ahora me gustaría que calcule 100 menos 7, y así sucesivamente. Continúe restando 7 a la cifra anterior.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onend = () => setIsSpeakingLocal(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingLocal(true);
    }
  };

  // Manejo manual
  const [manualInput, setManualInput] = useState("");

  const handleAddStep = () => {
    if (!manualInput.trim()) return;
    const val = parseInt(manualInput, 10);
    if (!isNaN(val)) {
      setSteps((prev) => [...prev, val]);
    }
    setManualInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddStep();
    }
  };

  const handleNext = () => {
    // Calcular #correctas. "Si el usuario se equivoca en la 1, pero luego resta 7 correctamente..."
    // Es decir, si step[i] = step[i-1] - 7, se considera correcto.
    // Empezamos en 100, steps are [X1, X2, X3, X4, X5]
    // i=0 => compare with 93
    // i=1 => compare with step[i-1] - 7
    let correctCount = 0;
    let previousValue = 100;
    for (let i = 0; i < steps.length && i < 5; i++) {
      const expected = previousValue - 7;
      if (steps[i] === expected) {
        correctCount++;
        previousValue = steps[i];
      } else {
        // Si falló, el nuevo 'previousValue' es steps[i]
        // pero si sigue restando 7 correctamente, cuenta.
        previousValue = steps[i];
      }
    }

    let score = 0;
    switch (correctCount) {
      case 0:
        score = 0;
        break;
      case 1:
        score = 1;
        break;
      case 2:
      case 3:
        score = 2;
        break;
      default:
        // 4 o 5
        score = 3;
        break;
    }
    onComplete(score, { steps });
  };

  return (
    <div className="module-container">
      <div className="d-flex align-items-center mb-2">
        <h5 className="mb-0">Actividad 3: Substracción en secuencia de 7</h5>
        <Button
          variant="link"
          onClick={speakInstructions}
          disabled={isSpeakingLocal}
          className="ms-3 text-decoration-none"
          style={{ whiteSpace: "nowrap", minWidth: "180px" }}
        >
          {isSpeakingLocal ? <FaStop /> : <FaPlay />} Escuchar Instrucciones
        </Button>
      </div>

      <p>
        “Ahora me gustaría que calcule 100 menos 7, y así sucesivamente:
        continúe restando 7 a la cifra de su respuesta anterior, hasta que le
        pida que pare.” Escriba o hable los resultados.
      </p>

      <div className="text-center mb-3">
        <h6>Comience en 100</h6>
      </div>

      {/* Entrada manual */}
      <Form
        onSubmit={(e) => e.preventDefault()}
        className="mt-3 d-flex flex-column align-items-center"
      >
        <Form.Control
          type="text"
          placeholder="Escriba la cifra resultante"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ maxWidth: "350px" }}
        />
        <Button
          variant="success"
          onClick={handleAddStep}
          className="mt-2"
        >
          Agregar
        </Button>
      </Form>

      <div className="mt-3">
        <p>Números ingresados:</p>
        <ul>
          {steps.map((num, index) => (
            <li key={index}>{num}</li>
          ))}
        </ul>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          onClick={onPrevious}
          // Podría estar deshabilitado si es la primera.
          disabled={isFirstModule}
        >
          Regresar
        </Button>
        <Button variant="success" onClick={handleNext}>
          Continuar
        </Button>
      </div>
    </div>
  );
};

/**
 * Módulo principal de Atención, con 3 actividades:
 * 1) NumberSequenceActivity (Secuencia Numérica)
 * 2) ConcentracionActivity (letras)
 * 3) Sub7Activity (resta 7 sucesivamente)
 */
const Atencion = ({ onComplete, onPrevious, isFirstModule }) => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [activity1Score, setActivity1Score] = useState(null);
  const [activity2Score, setActivity2Score] = useState(null);
  const [activity3Score, setActivity3Score] = useState(null);

  const handleActivity1Complete = (score, data) => {
    setActivity1Score(score);
    setCurrentActivityIndex(1);
  };

  const handleActivity2Complete = (score, data) => {
    setActivity2Score(score);
    setCurrentActivityIndex(2);
  };

  const handleActivity3Complete = (score, data) => {
    setActivity3Score(score);
    handleNext();
  };

  const handleNext = () => {
    const total = (activity1Score || 0) + (activity2Score || 0) + (activity3Score || 0);
    onComplete(total, {
      activity1: activity1Score,
      activity2: activity2Score,
      activity3: activity3Score,
    });
  };

  return (
    <div className="module-container">
      {currentActivityIndex === 0 && (
        <NumberSequenceActivity
          onComplete={handleActivity1Complete}
          onPrevious={onPrevious}
          isFirstModule={isFirstModule}
        />
      )}
      {currentActivityIndex === 1 && (
        <ConcentracionActivity
          onComplete={handleActivity2Complete}
          onPrevious={onPrevious}
          isFirstModule={isFirstModule}
        />
      )}
      {currentActivityIndex === 2 && (
        <Sub7Activity
          onComplete={handleActivity3Complete}
          onPrevious={onPrevious}
          isFirstModule={isFirstModule}
        />
      )}

      {/* Botones para saltar entre actividades (Debug / Pruebas) */}
      <div className="d-flex justify-content-center mt-4">
        <Button
          variant="info"
          onClick={() => setCurrentActivityIndex(0)}
          className="me-2"
        >
          Ir a Actividad 1
        </Button>
        <Button
          variant="info"
          onClick={() => setCurrentActivityIndex(1)}
          className="me-2"
        >
          Ir a Actividad 2
        </Button>
        <Button
          variant="info"
          onClick={() => setCurrentActivityIndex(2)}
        >
          Ir a Actividad 3
        </Button>
      </div>
    </div>
  );
};

export default Atencion;
