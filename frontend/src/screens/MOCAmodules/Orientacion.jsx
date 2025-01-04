// src/screens/MOCAmodules/Orientacion.jsx

import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Form, Alert } from "react-bootstrap";
import { FaPlay, FaStop } from "react-icons/fa";

const Orientacion = ({ onComplete, onPrevious, isFirstModule }) => {
  const [stage, setStage] = useState(1); // Etapa actual de la prueba
  const [selectedDate, setSelectedDate] = useState({
    day: "",
    month: "",
    year: "",
  });
  const [selectedWeekday, setSelectedWeekday] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [scores, setScores] = useState({
    date: 0,
    weekday: 0,
    location: 0,
  }); // Puntajes obtenidos (1 punto cada uno si es correcto)

  // Control de TTS (instrucciones)
  const [ttsSupported, setTtsSupported] = useState(!!window.speechSynthesis);
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);

  // Ubicación correcta para puntaje
  const correctLocation = "Clínica";

  // Datos actuales para validación
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString("es-ES", { month: "long" });
  const currentYear = today.getFullYear();
  const currentWeekday = today.toLocaleString("es-ES", { weekday: "long" });

  const possibleLocations = ["Hospital", "Clínica", "Oficina", "Escuela"];

  // Estado para almacenar respuestas seleccionadas
  const [recordedAnswers, setRecordedAnswers] = useState({
    date: "",
    weekday: "",
    location: "",
  });

  // Inicializar SpeechRecognition
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [manualInput, setManualInput] = useState("");

  // Ref para evitar reproducción múltiple de instrucciones
  const hasSpokenInstructionsRef = useRef(false);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
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

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Evitar que las instrucciones se reproduzcan dos veces
  useEffect(() => {
    if (ttsSupported && stage !== 0 && !hasSpokenInstructionsRef.current) {
      speakInstructions(getInstructionsText(stage));
      hasSpokenInstructionsRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Función para obtener el texto de instrucciones según la etapa
  const getInstructionsText = (currentStage) => {
    switch (currentStage) {
      case 1:
        return "Dígame en qué día estamos hoy.";
      case 2:
        return "Dígame el día de la semana.";
      case 3:
        return "Dígame cómo se llama el lugar donde estamos ahora.";
      default:
        return "";
    }
  };

  // Función para hablar instrucciones
  const speakInstructions = (text) => {
    if (!ttsSupported) return;
    if (isSpeakingLocal) {
      window.speechSynthesis.cancel();
      setIsSpeakingLocal(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onend = () => {
        setIsSpeakingLocal(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeakingLocal(true);
    }
  };

  // Validar fecha seleccionada
  const validateDate = () => {
    const { day, month, year } = selectedDate;
    const monthLower = (month || "").toLowerCase();
    return (
      parseInt(day) === currentDay &&
      monthLower === currentMonth.toLowerCase() &&
      parseInt(year) === currentYear
    );
  };

  // Validar día de la semana
  const validateWeekday = () => {
    return selectedWeekday.toLowerCase() === currentWeekday.toLowerCase();
  };

  // Validar ubicación
  const validateLocation = () => {
    return selectedLocation === correctLocation;
  };

  // Manejar siguiente etapa
  const handleNextStage = () => {
    if (stage === 1) {
      if (validateDate()) {
        setScores((prev) => ({ ...prev, date: 1 }));
        setRecordedAnswers((prev) => ({
          ...prev,
          date: `${selectedDate.day}/${selectedDate.month}/${selectedDate.year}`,
        }));
      }
      setStage(2);
      hasSpokenInstructionsRef.current = false;
    }
  };

  // Manejar confirmar respuesta en la selección de día de la semana
  const handleWeekdaySelection = (day) => {
    setSelectedWeekday(day);
    if (validateWeekday()) {
      setScores((prev) => ({ ...prev, weekday: 1 }));
      setRecordedAnswers((prev) => ({
        ...prev,
        weekday: day.charAt(0).toUpperCase() + day.slice(1),
      }));
    }
    setStage(3);
    hasSpokenInstructionsRef.current = false;
  };

  // Manejar confirmar respuesta en la selección de ubicación
  const handleLocationSelection = (location) => {
    setSelectedLocation(location);
    if (validateLocation()) {
      setScores((prev) => ({ ...prev, location: 1 }));
      setRecordedAnswers((prev) => ({
        ...prev,
        location: location,
      }));
    }
    const totalScore = scores.date + scores.weekday + (validateLocation() ? 1 : 0);

    // Mostrar alerta de finalización
    alert("Ha finalizado la prueba de Orientación.");

    onComplete(totalScore, {
      date: selectedDate,
      weekday: selectedWeekday,
      location: selectedLocation,
    });
  };

  // Manejar etapa previa
  const handlePreviousStage = () => {
    if (stage > 1) setStage(stage - 1);
    hasSpokenInstructionsRef.current = false;
  };

  // Manejar cambios en la selección de fecha
  const handleDateChange = (field, value) => {
    setSelectedDate((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="module-container">
      {/* Título y Botón para escuchar instrucciones */}
      <div className="d-flex align-items-center mb-3">
        <h4 className="mb-0">Orientación</h4>
        <Button
          variant="link"
          onClick={() => speakInstructions(getInstructionsText(stage))}
          disabled={!ttsSupported ? true : isSpeakingLocal}
          className="ms-3 text-decoration-none custom-button"
          style={{ whiteSpace: "nowrap", minWidth: "220px" }}
        >
          {isSpeakingLocal ? <FaStop /> : <FaPlay />} Escuchar Instrucciones
        </Button>
      </div>

      {/* Mostrar respuestas seleccionadas */}
      {(recordedAnswers.date || recordedAnswers.weekday || recordedAnswers.location) && (
        <div className="mb-4">
          <h5>Respuestas seleccionadas:</h5>
          <ul>
            {recordedAnswers.date && (
              <li>
                <strong>Fecha:</strong> {recordedAnswers.date}
              </li>
            )}
            {recordedAnswers.weekday && (
              <li>
                <strong>Día de la semana:</strong> {recordedAnswers.weekday}
              </li>
            )}
            {recordedAnswers.location && (
              <li>
                <strong>Ubicación:</strong> {recordedAnswers.location}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Etapa 1: Seleccionar Fecha */}
      {stage === 1 && (
        <div>
          <p>Seleccione el día, mes y año de hoy.</p>
          <Form className="text-center">
            <Row className="justify-content-center">
              <Col xs={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Select
                    value={selectedDate.day}
                    onChange={(e) => handleDateChange("day", e.target.value)}
                    className="custom-select"
                  >
                    <option value="">Día</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Select
                    value={selectedDate.month}
                    onChange={(e) => handleDateChange("month", e.target.value)}
                    className="custom-select"
                  >
                    <option value="">Mes</option>
                    {[
                      "enero",
                      "febrero",
                      "marzo",
                      "abril",
                      "mayo",
                      "junio",
                      "julio",
                      "agosto",
                      "septiembre",
                      "octubre",
                      "noviembre",
                      "diciembre",
                    ].map((month) => (
                      <option key={month} value={month}>
                        {month.charAt(0).toUpperCase() + month.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Select
                    value={selectedDate.year}
                    onChange={(e) => handleDateChange("year", e.target.value)}
                    className="custom-select"
                  >
                    <option value="">Año</option>
                    {Array.from({ length: 5 }, (_, i) => (
                      <option key={currentYear - i} value={currentYear - i}>
                        {currentYear - i}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
          <div className="d-flex justify-content-center mt-3">
            <Button
              variant="primary"
              onClick={handleNextStage}
              disabled={
                !selectedDate.day || !selectedDate.month || !selectedDate.year
              }
              className="custom-button"
              style={{ minWidth: "220px" }}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* Etapa 2: Día de la semana */}
      {stage === 2 && (
        <div className="text-center">
          <p>Seleccione el día de la semana.</p>
          <Row className="justify-content-center">
            {[
              "lunes",
              "martes",
              "miércoles",
              "jueves",
              "viernes",
              "sábado",
              "domingo",
            ].map((day) => (
              <Col xs={6} md={3} className="mb-2" key={day}>
                <Button
                  onClick={() => handleWeekdaySelection(day)}
                  className="w-100 custom-button"
                  style={{
                    backgroundColor:
                      selectedWeekday.toLowerCase() === day.toLowerCase()
                        ? "#ff5722" // Color seleccionado personalizado
                        : "#f8f9fa", // Color no seleccionado personalizado
                    borderColor: "#ff5722",
                    color:
                      selectedWeekday.toLowerCase() === day.toLowerCase()
                        ? "#fff"
                        : "#000",
                  }}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Button>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Etapa 3: Ubicación */}
      {stage === 3 && (
        <div className="text-center">
          <p>Seleccione el lugar donde nos encontramos.</p>
          <Row className="justify-content-center">
            {possibleLocations.map((location) => (
              <Col xs={6} md={3} className="mb-2" key={location}>
                <Button
                  onClick={() => handleLocationSelection(location)}
                  className="w-100 custom-button"
                  style={{
                    backgroundColor:
                      selectedLocation.toLowerCase() === location.toLowerCase()
                        ? "#4caf50" // Color seleccionado personalizado
                        : "#f8f9fa", // Color no seleccionado personalizado
                    borderColor: "#4caf50",
                    color:
                      selectedLocation.toLowerCase() === location.toLowerCase()
                        ? "#fff"
                        : "#000",
                  }}
                >
                  {location}
                </Button>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Botones de Navegación */}
      {stage === 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Button
            variant="secondary"
            onClick={onPrevious}
            disabled={isFirstModule}
            className="me-3 custom-button"
            style={{ minWidth: "150px" }}
          >
            Regresar
          </Button>
        </div>
      )}

      {/* Estilos personalizados para botones */}
      <style jsx>{`
        .custom-button {
          transition: background-color 0.3s, color 0.3s;
          border-radius: 5px;
          border-width: 2px;
          font-weight: bold;
        }
        .custom-button:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default Orientacion;
