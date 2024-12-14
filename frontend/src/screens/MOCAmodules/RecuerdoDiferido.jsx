// src/screens/MOCAmodules/RecuerdoDiferido.jsx

import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Alert, Form, Spinner } from "react-bootstrap";
import { FaPlay, FaStop } from "react-icons/fa";

const RecuerdoDiferido = ({ onComplete, onPrevious, isFirstModule }) => {
  const words = ["ROSTRO", "SEDA", "IGLESIA", "CLAVEL", "ROJO"];

  // Estado para el puntaje (única actividad)
  const [activityScore, setActivityScore] = useState(null);

  // Estado para manejar el flujo
  const [useVoice, setUseVoice] = useState(true);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Fases: 
  // 0: Intento espontáneo
  // 1: Pistas de categoría
  // 2: Opción múltiple
  // Final: Calcular puntaje
  const [phase, setPhase] = useState(0);

  // Palabras recordadas espontáneamente
  const [spontaneousAnswers, setSpontaneousAnswers] = useState([]);
  const [manualInput, setManualInput] = useState("");
  const [transcript, setTranscript] = useState("");

  const [confirmation, setConfirmation] = useState(false);
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);

  // Palabras no recordadas espontáneamente
  const [missedWords, setMissedWords] = useState(words);

  // Pistas de categoría
  const categoryClues = {
    ROSTRO: "parte del cuerpo",
    SEDA: "tela",
    IGLESIA: "edificio",
    CLAVEL: "flor",
    ROJO: "color"
  };

  // Opción múltiple
  const multipleChoice = {
    ROSTRO: ["nariz", "rostro", "mano"],
    SEDA: ["lana", "algodon", "seda"],
    IGLESIA: ["iglesia", "escuela", "hospital"],
    CLAVEL: ["rosa", "clavel", "tulipan"],
    ROJO: ["rojo", "azul", "verde"]
  };

  const [categoryAnswers, setCategoryAnswers] = useState({});
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState({});

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
      const result = event.results[0][0].transcript.toLowerCase().trim();
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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "")
      .trim();
  };

  const handleAddSpontaneous = (word) => {
    const nWord = normalizeText(word);
    if (words.map((w) => normalizeText(w)).includes(nWord)) {
      setSpontaneousAnswers((prev) => {
        if (!prev.includes(nWord)) {
          return [...prev, nWord];
        }
        return prev;
      });
    }
  };

  const handleConfirm = () => {
    // Confirmar la respuesta ingresada por voz o texto
    if (manualInput.trim() !== "") {
      manualInput
        .split(",")
        .map((x) => x.trim())
        .forEach((w) => handleAddSpontaneous(w));
    } else if (transcript.trim() !== "") {
      transcript
        .split(" ")
        .map((x) => x.trim())
        .forEach((w) => handleAddSpontaneous(w));
    }

    setManualInput("");
    setTranscript("");
    setConfirmation(false);

    if (phase === 0) {
      // Sigue intentando espontáneamente hasta que presione "Continuar espontáneo"
    } else if (phase === 1) {
      // Confirmación en fase de pistas de categoría
      // Asignar en categoryAnswers
    } else if (phase === 2) {
      // Confirmación en fase de opción múltiple
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

  const handleContinueSpontaneous = () => {
    // Al terminar fase espontánea, calcular qué palabras faltan
    const missing = words.filter(
      (w) => !spontaneousAnswers.includes(normalizeText(w))
    );
    setMissedWords(missing);
    setPhase(1);
  };

  const handleCategoryPhaseConfirm = () => {
    // Usuario ha intentado recordar con pistas de categoría (sin puntos)
    // Calcular qué palabras faltan ahora
    const missingAfterCategory = missedWords.filter((w) => {
      const norm = normalizeText(w);
      return !(
        spontaneousAnswers.includes(norm) ||
        (categoryAnswers[norm] && categoryAnswers[norm] === norm)
      );
    });
    setMissedWords(missingAfterCategory);
    setPhase(2);
  };

  const handleMultipleChoiceConfirm = () => {
    // Última fase, no da puntos, pero registra las seleccionadas
    // Calcular puntaje final
    const spontScore = spontaneousAnswers.filter((ans) =>
      words.map((w) => normalizeText(w)).includes(ans)
    ).length;

    setActivityScore(spontScore); 
  };

  const handleCategoryInputChange = (word, val) => {
    const nVal = normalizeText(val);
    setCategoryAnswers((prev) => ({ ...prev, [normalizeText(word)]: nVal }));
  };

  const handleMultipleChoiceChange = (word, val) => {
    setMultipleChoiceAnswers((prev) => ({ ...prev, [normalizeText(word)]: val }));
  };

  const handleNext = () => {
    // Calcular puntaje final
    const spontScore = activityScore || 0;
    onComplete(spontScore, { spontaneousScore: spontScore });
  };

  const allDone = activityScore !== null;

  return (
    <div className="module-container">
      <div className="d-flex align-items-center">
        <h4>Recuerdo Diferido</h4>
        <Button
          variant="link"
          onClick={() =>
            speakInstructions(
              "Antes le leí una serie de palabras. Dígame ahora todas las palabras de las que se acuerde."
            )
          }
          disabled={isSpeakingLocal}
        >
          {isSpeakingLocal ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>
        “Antes le leí una serie de palabras, dígame ahora todas las que recuerde.”
      </p>

      {phase === 0 && (
        <>
          <p>
            Intente recordar las palabras espontáneamente. Puede hablar o escribir las palabras separadas por comas.
          </p>
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
              <Button variant="primary" onClick={handleListen} className="me-3">
                Hablar
              </Button>
            )
          )}
          <Form onSubmit={(e) => e.preventDefault()} className="d-flex mt-3">
            <Form.Control
              type="text"
              placeholder="Escriba las palabras separadas por comas"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              variant="success"
              onClick={() => setConfirmation(true)}
              className="ms-2"
              disabled={!manualInput.trim()}
            >
              Confirmar
            </Button>
          </Form>

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
          <div className="mt-3">
            <Button variant="info" onClick={handleContinueSpontaneous}>
              Continuar a las pistas de categoría
            </Button>
          </div>
        </>
      )}

      {phase === 1 && (
        <>
          <p>Ahora le daré una pista de categoría para cada palabra que no recordó espontáneamente. Intente recordarlas ahora. Sin puntos por esta fase.</p>
          {missedWords.map((w) => (
            <div key={w} className="mt-3">
              <p><strong>{w}</strong>: pista de categoría: {categoryClues[w]}</p>
              <Form onSubmit={(e) => e.preventDefault()} className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Respuesta"
                  value={categoryAnswers[normalizeText(w)] || ""}
                  onChange={(e) => handleCategoryInputChange(w, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                />
              </Form>
            </div>
          ))}
          <div className="mt-3">
            <Button variant="info" onClick={handleCategoryPhaseConfirm}>
              Continuar a la opción múltiple
            </Button>
          </div>
        </>
      )}

      {phase === 2 && (
        <>
          <p>Ahora le daré opciones múltiples para las palabras que aún no recordó. Escoja la correcta. Sin puntos por esta fase.</p>
          {missedWords.map((w) => (
            <div key={w} className="mt-3">
              <p><strong>{w}</strong>: Escoja la correcta</p>
              {multipleChoice[w].map((opt) => (
                <div key={opt} className="d-flex align-items-center mb-2">
                  <Form.Check
                    type="radio"
                    name={normalizeText(w)}
                    id={normalizeText(w) + normalizeText(opt)}
                    label={opt}
                    onChange={() => handleMultipleChoiceChange(w, opt)}
                  />
                </div>
              ))}
            </div>
          ))}
          <div className="mt-3">
            <Button variant="info" onClick={() => {
              const spontWords = normalizeTextWords(spontaneousAnswers);
              const spontScore = spontWords.filter((sw) => words.map((x) => normalizeText(x)).includes(sw)).length;
              setActivityScore(spontScore);
            }}>
              Finalizar Evaluación
            </Button>
          </div>
        </>
      )}

      {activityScore !== null && (
        <div className="mt-3">
          <p>Ha finalizado la prueba de recuerdo diferido.</p>
          <p>Puntaje (solo por recuerdos espontáneos): {activityScore}</p>
        </div>
      )}

      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={onPrevious} disabled={isFirstModule}>
          Regresar
        </Button>
        <Button
          variant="success"
          onClick={() => onComplete(activityScore || 0, { spontaneousScore: activityScore || 0 })}
          disabled={activityScore === null}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

// Función auxiliar para normalizar listas de palabras ya guardadas
function normalizeTextWords(list) {
  return list.map((w) =>
    w
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "")
      .trim()
  );
}

export default RecuerdoDiferido;
