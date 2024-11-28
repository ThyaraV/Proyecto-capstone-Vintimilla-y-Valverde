import React, { useState, useEffect } from "react";
import { Button, Row, Col, Form } from "react-bootstrap";

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
  }); // Puntajes obtenidos

  // Variable para la ubicación correcta
  const correctLocation = "Clínica";

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString("es-ES", { month: "long" });
  const currentYear = today.getFullYear();
  const currentWeekday = today.toLocaleString("es-ES", { weekday: "long" });

  const possibleLocations = ["Hospital", "Clínica", "Oficina", "Escuela"];

  // Hablar las instrucciones
  const speakInstructions = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (stage === 1) {
      speakInstructions("Dígame en qué día estamos hoy.");
    } else if (stage === 2) {
      speakInstructions("Dígame el día de la semana.");
    } else if (stage === 3) {
      speakInstructions("Dígame cómo se llama el lugar donde estamos ahora.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Validar fecha seleccionada
  const validateDate = () => {
    const { day, month, year } = selectedDate;
    return (
      parseInt(day) === currentDay &&
      month.toLowerCase() === currentMonth.toLowerCase() &&
      parseInt(year) === currentYear
    );
  };

  // Validar día de la semana seleccionado
  const validateWeekday = () => {
    return selectedWeekday.toLowerCase() === currentWeekday.toLowerCase();
  };

  // Validar ubicación seleccionada
  const validateLocation = () => {
    return selectedLocation === correctLocation;
  };

  // Manejar siguiente etapa
  const handleNextStage = () => {
    if (stage === 1) {
      if (validateDate()) {
        setScores((prev) => ({ ...prev, date: 1 }));
      }
      setStage(2);
    } else if (stage === 2) {
      if (validateWeekday()) {
        setScores((prev) => ({ ...prev, weekday: 1 }));
      }
      setStage(3);
    } else if (stage === 3) {
      if (validateLocation()) {
        setScores((prev) => ({ ...prev, location: 1 }));
      }
      const totalScore = scores.date + scores.weekday + scores.location;
      onComplete(totalScore, {
        date: selectedDate,
        weekday: selectedWeekday,
        location: selectedLocation,
      });
    }
  };

  // Manejar etapa previa
  const handlePreviousStage = () => {
    if (stage > 1) setStage(stage - 1);
  };

  // Manejar cambios en la selección de fecha
  const handleDateChange = (field, value) => {
    setSelectedDate((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="module-container">
      <h4>Orientación</h4>

      {stage === 1 && (
        <div>
          <p>Seleccione el día, mes y año.</p>
          <Form className="text-center">
            <Row className="justify-content-center">
              <Col xs={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Control
                    as="select"
                    value={selectedDate.day}
                    onChange={(e) => handleDateChange("day", e.target.value)}
                  >
                    <option value="">Día</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col xs={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Control
                    as="select"
                    value={selectedDate.month}
                    onChange={(e) => handleDateChange("month", e.target.value)}
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
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col xs={6} md={3} className="mb-3">
                <Form.Group>
                  <Form.Control
                    as="select"
                    value={selectedDate.year}
                    onChange={(e) => handleDateChange("year", e.target.value)}
                  >
                    <option value="">Año</option>
                    {Array.from({ length: 5 }, (_, i) => (
                      <option key={currentYear - i} value={currentYear - i}>
                        {currentYear - i}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </div>
      )}

      {stage === 2 && (
        <div className="text-center">
          <p>Seleccione el día de la semana.</p>
          <Row className="justify-content-center">
            {["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"].map((day) => (
              <Col xs={6} md={3} className="mb-3" key={day}>
                <Button
                  variant={selectedWeekday === day ? "primary" : "outline-primary"}
                  onClick={() => setSelectedWeekday(day)}
                  className="w-100"
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Button>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {stage === 3 && (
        <div className="text-center">
          <p>Seleccione el lugar donde nos encontramos.</p>
          <Row className="justify-content-center">
            {possibleLocations.map((location) => (
              <Col xs={6} md={3} className="mb-3" key={location}>
                <Button
                  variant={selectedLocation === location ? "primary" : "outline-primary"}
                  onClick={() => setSelectedLocation(location)}
                  className="w-100"
                >
                  {location}
                </Button>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={onPrevious} disabled={isFirstModule}>
          Regresar
        </Button>
        <Button
          variant="success"
          onClick={handleNextStage}
          disabled={
            (stage === 1 &&
              (!selectedDate.day || !selectedDate.month || !selectedDate.year)) ||
            (stage === 2 && !selectedWeekday) ||
            (stage === 3 && !selectedLocation)
          }
        >
          {stage < 3 ? "Siguiente" : "Finalizar"}
        </Button>
      </div>
    </div>
  );
};

export default Orientacion;
