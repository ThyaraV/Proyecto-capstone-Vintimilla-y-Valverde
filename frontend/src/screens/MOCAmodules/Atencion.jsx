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
 * ACTIVIDAD: CONCENTRACIÓN (LETRAS)
 * El sistema lee una serie de letras (lettersSequence) secuencialmente, sin intervalos fijos.
 * Cada letra:
 *   1. Se muestra en pantalla.
 *   2. Se pronuncia por TTS.
 *   3. Al finalizar la locución de la letra, se espera 1 segundo y se avanza a la siguiente.
 * El usuario debe presionar "Golpe" sólo si la letra actual es 'A'.
 *   - Más de un error => puntaje = 0
 *   - 0 o 1 error => puntaje = 1
 */
export const ConcentracionActivity = ({
  onComplete,
  onPrevious,
  isFirstModule,
}) => {
  // TTS
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);

  // Estado de actividad
  const [playing, setPlaying] = useState(false);   // Indica si se está reproduciendo la secuencia
  const [currentLetter, setCurrentLetter] = useState("--");
  const [currentIndex, setCurrentIndex] = useState(-1); // Índice de la letra actual
  const [errors, setErrors] = useState(0);
  const [hits, setHits] = useState([]);            // Índices donde el usuario golpeó con la letra 'A'
  const [showContinue, setShowContinue] = useState(false);

  // Secuencia de letras
  const lettersSequence = [
    "F", "B", "A", "C", "M", "N", "A", "A",
    "J", "K", "L", "B", "A", "F", "A", "K",
    "D", "E", "A", "A", "A", "J", "A", "M",
    "O", "F", "A", "A", "B"
  ];

  useEffect(() => {
    // Verificar TTS
    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }
    // Cleanup
    return () => {
      stopSequence();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /**
   * Leer instrucciones por TTS, sin iniciar automáticamente la secuencia.
   */
  const speakInstructions = () => {
    if (!ttsSupported) return;
    if (isSpeakingLocal) {
      // Cancelar cualquier locución en curso
      window.speechSynthesis.cancel();
      setIsSpeakingLocal(false);
    } else {
      const instructions =
        "Actividad de Concentración con Letras. Se leerá una serie de letras una por una. Presione el botón Golpe únicamente cuando la letra sea A. Si se comete más de un error, la puntuación será cero.";
      const utterance = new SpeechSynthesisUtterance(instructions);
      utterance.lang = "es-ES";
      utterance.onend = () => {
        setIsSpeakingLocal(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeakingLocal(true);
    }
  };

  /**
   * Inicia la secuencia de forma secuencial:
   *   - currentIndex avanza letra a letra
   *   - Para cada letra, se llama a readLetter -> TTS -> al terminar TTS se espera 1s -> next
   */
  const startSequence = () => {
    setPlaying(true);
    setErrors(0);
    setHits([]);
    setShowContinue(false);

    // Comenzar desde la primera letra
    readAllLetters(0);
  };

  /**
   * Función recursiva que lee una letra y, tras acabar la locución + 1s,
   * pasa a la siguiente.
   */
  const readAllLetters = (index) => {
    if (!ttsSupported) return;
    if (index >= lettersSequence.length) {
      // Fin de la secuencia
      setPlaying(false);
      setCurrentLetter("--");
      setShowContinue(true);
      return;
    }

    const letter = lettersSequence[index];
    setCurrentLetter(letter);
    setCurrentIndex(index);

    // Hablar la letra
    const utterance = new SpeechSynthesisUtterance(letter);
    utterance.lang = "es-ES";
    utterance.onend = () => {
      // Al terminar de pronunciar la letra, esperar 1 segundo y pasar a la siguiente
      setTimeout(() => {
        readAllLetters(index + 1);
      }, 1000);
    };
    window.speechSynthesis.speak(utterance);
  };

  /**
   * Detener secuencia manualmente (por si se desea).
   */
  const stopSequence = () => {
    setPlaying(false);
    setCurrentLetter("--");
    window.speechSynthesis.cancel();
  };

  /**
   * Manejador del botón "Golpe": si la letra actual es 'A' => acierto, sino => error.
   */
  const handleGolpe = () => {
    if (!playing) return; // Sólo válido si se está reproduciendo
    if (currentIndex < 0 || currentIndex >= lettersSequence.length) return;

    const expectedLetter = lettersSequence[currentIndex];
    if (expectedLetter === "A") {
      setHits((prev) => [...prev, currentIndex]);
    } else {
      setErrors((prev) => {
        const newErrors = prev + 1;
        // Si se supera 1 error, se detiene y finaliza
        if (newErrors > 1) {
          stopSequence();
          setShowContinue(true);
        }
        return newErrors;
      });
    }
  };

  /**
   * Al presionar "Continuar", se calcula el puntaje y se llama onComplete.
   */
  const handleContinue = () => {
    const score = errors > 1 ? 0 : 1;
    onComplete(score, { hits, errors });
  };

  return (
    <div className="module-container">
      {/* Título y botón de instrucciones */}
      <div className="d-flex align-items-center mb-2">
        <h5 className="mb-0">Actividad 2: Concentración (Letras)</h5>
        <Button
          variant="link"
          onClick={speakInstructions}
          // Deshabilitar mientras habla o mientras reproduce la secuencia
          disabled={isSpeakingLocal || playing}
          className="ms-3 text-decoration-none"
          style={{ whiteSpace: "nowrap", minWidth: "220px" }}
        >
          {isSpeakingLocal ? <FaStop /> : <FaPlay />} Escuchar Instrucciones
        </Button>
      </div>

      <p>
        Se leerá una serie de letras de una en una. Cuando la letra sea "A", presione "Golpe". Más de 1 error ⇒ 0 pts.
      </p>

      {/* Botón para iniciar la lectura */}
      {!playing && !showContinue && (
        <Button
          variant="primary"
          onClick={startSequence}
          className="d-block mx-auto mb-3"
          style={{ minWidth: "180px" }}
        >
          Iniciar Lectura
        </Button>
      )}

      {/* Mostrar estado de la secuencia */}
      {playing && (
        <div className="text-center mt-3">
          <Spinner animation="grow" variant="primary" />
          <p className="mt-2">
            Leyendo letra: <strong>{currentLetter}</strong>
          </p>
        </div>
      )}

      {/* Botón Golpe */}
      <Button
        variant="success"
        onClick={handleGolpe}
        className="d-block mx-auto mb-3"
        style={{ minWidth: "200px", textDecoration: "none" }}
        disabled={!playing}
      >
        Golpe
      </Button>

      {/* Errores y Aciertos */}
      <div className="mt-3 text-center">
        <p>Errores: {errors}</p>
        <p>Golpes acertados: {hits.length}</p>
      </div>

      {/* Al terminar secuencia => mostrar puntaje */}
      {showContinue && (
        <div className="text-center mt-3">
          <Alert variant={errors > 1 ? "danger" : "success"}>
            {errors > 1
              ? "Has cometido más de un error. Puntaje: 0."
              : "Puntaje: 1."}
          </Alert>
          <Button
            variant="success"
            onClick={handleContinue}
            className="mt-2"
            style={{ minWidth: "150px" }}
          >
            Continuar
          </Button>
        </div>
      )}

      {/* Botón para regresar al módulo anterior, sólo si aún no finaliza */}
      {!showContinue && (
        <div className="d-flex justify-content-center mt-4">
          <Button
            variant="secondary"
            onClick={onPrevious}
            disabled={isFirstModule}
            style={{ minWidth: "150px" }}
          >
            Regresar
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * ACTIVIDAD 3: SUBSTRACCIÓN EN SECUENCIA DE 7
 * El usuario empieza en 100 y resta 7 sucesivamente, 5 veces.
 * Puntuación:
 *   0 => ninguna sustracción correcta
 *   1 => 1 sustracción correcta
 *   2 => 2 o 3 correctas
 *   3 => 4 o 5 correctas
 * Nota: Si se equivoca en la primera pero luego resta 7 correctamente, se cuentan las siguientes como correctas.
 */

export const Sub7Activity = ({
  onComplete,
  onPrevious,
  isFirstModule,
}) => {
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [steps, setSteps] = useState([]); // Guardar las entradas del usuario
  const [manualInput, setManualInput] = useState("");
  const [currentNumber, setCurrentNumber] = useState(100);
  const [showFinalButtons, setShowFinalButtons] = useState(false);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Función para leer instrucciones
  const speakInstructions = () => {
    if (!ttsSupported) return;
    if (isSpeakingLocal) {
      window.speechSynthesis.cancel();
      setIsSpeakingLocal(false);
    } else {
      const text =
        "Actividad de Substracción en Secuencia de 7. Comience con el número 100 y reste 7 sucesivamente. Ingrese cada resultado en el campo de texto a continuación. Presione 'Continuar' para finalizar y calcular su puntaje o 'Terminar' para finalizar la actividad sin puntaje.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onend = () => {
        setIsSpeakingLocal(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeakingLocal(true);
    }
  };

  // Función para manejar la entrada manual
  const handleAddStep = () => {
    if (!manualInput.trim()) return;
    const val = parseInt(manualInput, 10);
    if (isNaN(val)) {
      alert("Por favor, ingrese un número válido.");
      return;
    }

    // Validar sustracción
    const expected = currentNumber - 7;
    const isCorrect = val === expected;
    setSteps((prev) => [...prev, { value: val, correct: isCorrect }]);
    setCurrentNumber(val);
    setManualInput("");
  };

  // Manejar presionar Enter en el campo de texto
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddStep();
    }
  };

  // Función para calcular el puntaje
  const calculateScore = () => {
    let correctCount = 0;
    let previousValue = 100;

    for (let i = 0; i < steps.length && i < 5; i++) {
      const expected = previousValue - 7;
      if (steps[i].value === expected) {
        correctCount += 1;
        previousValue = steps[i].value;
      } else {
        previousValue = steps[i].value;
      }
    }

    let score = 0;
    if (correctCount === 1) score = 1;
    else if (correctCount === 2 || correctCount === 3) score = 2;
    else if (correctCount === 4 || correctCount === 5) score = 3;

    onComplete(score, { steps });
  };

  // Función para terminar la actividad sin puntaje
  const handleTerminate = () => {
    onComplete(0, { steps });
  };

  return (
    <div className="module-container">
      <div className="d-flex align-items-center mb-2">
        <h5 className="mb-0">Actividad 3: Substracción en Secuencia de 7</h5>
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
        Comience con el número <strong>100</strong> y reste 7 sucesivamente.
        Ingrese cada resultado en el campo de texto a continuación.
      </p>

      {/* Mostrar el número actual */}
      <div className="text-center my-4">
        <h2>{currentNumber}</h2>
      </div>

      {/* Entrada manual */}
      {!showFinalButtons && (
        <Form
          onSubmit={(e) => e.preventDefault()}
          className="d-flex flex-column align-items-center"
        >
          <Form.Control
            type="number"
            placeholder="Ingrese el siguiente número"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ maxWidth: "300px" }}
          />
          <Button
            variant="success"
            onClick={handleAddStep}
            className="mt-2"
            style={{ minWidth: "150px" }}
          >
            Agregar
          </Button>
        </Form>
      )}

      {/* Lista de números ingresados */}
      <div className="mt-3">
        <p>Números ingresados:</p>
        <ul>
          {steps.map((step, index) => (
            <li key={index} style={{ color: step.correct ? "green" : "red" }}>
              {step.value} {step.correct ? "✔️" : "❌"}
            </li>
          ))}
        </ul>
      </div>

      {/* Botones para continuar o terminar */}
      {!showFinalButtons && steps.length > 0 && (
        <div className="d-flex justify-content-center mt-4">
          <Button
            variant="success"
            onClick={calculateScore}
            className="me-2"
            style={{ minWidth: "150px" }}
          >
            Continuar
          </Button>
          <Button
            variant="danger"
            onClick={handleTerminate}
            style={{ minWidth: "150px" }}
          >
            Terminar
          </Button>
        </div>
      )}

      {/* Mostrar puntaje y botón para continuar */}
      {showFinalButtons && (
        <div className="text-center mt-3">
          <Alert variant="info">
            {steps.length === 0
              ? "No se han ingresado sustracciones."
              : `Puntaje obtenido: ${
                  steps.filter(step => step.correct).length > 1
                    ? steps.filter(step => step.correct).length <= 3
                      ? 2
                      : 3
                    : steps.filter(step => step.correct).length
                }`}
          </Alert>
          <Button
            variant="success"
            onClick={calculateScore}
            className="mt-2"
            style={{ minWidth: "150px" }}
          >
            Continuar
          </Button>
        </div>
      )}

      {/* Botón para regresar al módulo anterior */}
      {!showFinalButtons && (
        <div className="d-flex justify-content-center mt-4">
          <Button
            variant="secondary"
            onClick={onPrevious}
            disabled={isFirstModule}
            style={{ minWidth: "150px" }}
          >
            Regresar
          </Button>
        </div>
      )}
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
