import React, { useState, useEffect, useRef } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { FaPlay, FaStop } from 'react-icons/fa';
import cubo from '../../images/cubo_image.jpg';

const Visuoespacial = ({ onComplete, onPrevious, isFirstModule }) => {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [alternanciaScore, setAlternanciaScore] = useState(null);
  const [cubeScore, setCubeScore] = useState(null);
  const [clockScore, setClockScore] = useState(null);

  // State for TTS
  const [ttsSupported, setTtsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setTtsSupported(false);
    }
  }, []);

  // Function to speak instructions
  const speakInstructions = (text) => {
    if (!ttsSupported) {
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Avanzar de actividad o terminar módulo
  const handleNext = () => {
    if (currentActivity < 2) {
      setCurrentActivity(currentActivity + 1);
    } else {
      const totalScore =
        (alternanciaScore || 0) + (cubeScore || 0) + (clockScore || 0);
      onComplete(totalScore, {
        alternancia: alternanciaScore,
        cube: cubeScore,
        clock: clockScore,
      });
    }
  };

  // Retroceder de actividad
  const handlePrevious = () => {
    if (currentActivity > 0) {
      setCurrentActivity(currentActivity - 1);
    } else {
      onPrevious();
    }
  };

  // Seleccionar manualmente actividad (debugging)
  const handleSelectActivity = (activityIndex) => {
    setCurrentActivity(activityIndex);
  };

  return (
    <div className="module-container">
      {currentActivity === 0 && (
        <AlternanciaConceptualActivity
          setAlternanciaScore={setAlternanciaScore}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          isSpeaking={isSpeaking}
          speakInstructions={speakInstructions}
          isFirstModule={isFirstModule}
        />
      )}
      {currentActivity === 1 && (
        <CuboActivity
          cubeScore={cubeScore}
          setCubeScore={setCubeScore}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          isSpeaking={isSpeaking}
          speakInstructions={speakInstructions}
          isFirstModule={isFirstModule}
        />
      )}
      {currentActivity === 2 && (
        <RelojActivity
          clockScore={clockScore}
          setClockScore={setClockScore}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          isSpeaking={isSpeaking}
          speakInstructions={speakInstructions}
          isFirstModule={isFirstModule}
        />
      )}

      {/* Botones para seleccionar actividad (Debugging) */}
      <div className="d-flex justify-content-center mt-4">
        <Button variant="secondary" onClick={() => handleSelectActivity(0)} className="me-2">
          Actividad 1
        </Button>
        <Button variant="secondary" onClick={() => handleSelectActivity(1)} className="me-2">
          Actividad 2
        </Button>
        <Button variant="secondary" onClick={() => handleSelectActivity(2)}>
          Actividad 3
        </Button>
      </div>
    </div>
  );
};

const AlternanciaConceptualActivity = ({
  setAlternanciaScore,
  handleNext,
  handlePrevious,
  isSpeaking,
  speakInstructions,
  isFirstModule
}) => {
  const labels = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];
  const svgSize = 450;

  // Puntos fijos
  const fixedMarkers = [
    { label: '1', x: 50, y: 225 },
    { label: 'A', x: 150, y: 50 },
    { label: '2', x: 300, y: 225 },
    { label: 'B', x: 400, y: 50 },
    { label: '3', x: 400, y: 400 },
    { label: 'C', x: 300, y: 350 },
    { label: '4', x: 150, y: 400 },
    { label: 'D', x: 50, y: 350 },
    { label: '5', x: 200, y: 275 },
    { label: 'E', x: 250, y: 125 },
  ];

  const initialConnections = [
    { from: 0, to: 1, dashed: true },
    { from: 1, to: 2, dashed: true },
  ];

  const [markers] = useState(fixedMarkers);
  const [connections, setConnections] = useState(initialConnections);
  const [selectedMarker, setSelectedMarker] = useState(2);
  const [mousePosition, setMousePosition] = useState(null);
  const [score, setScore] = useState(null);

  const handleMarkerClick = (index) => {
    if (selectedMarker !== null && selectedMarker !== index) {
      setConnections((prev) => [...prev, { from: selectedMarker, to: index, dashed: false }]);
      setSelectedMarker(index);
    }
  };

  const handleReset = () => {
    setConnections(initialConnections);
    setSelectedMarker(2);
    setMousePosition(null);
    setScore(null);
    setAlternanciaScore(null);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const evaluateSequence = () => {
    const correctSequence = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];
    const userSequence = connections.map((conn) => markers[conn.from]?.label);
    userSequence.push(markers[connections[connections.length - 1]?.to]?.label);

    const isCorrect =
      correctSequence.length === userSequence.length &&
      correctSequence.every((label, index) => label === userSequence[index]);

    const calculatedScore = isCorrect ? 1 : 0;
    setScore(calculatedScore);
    setAlternanciaScore(calculatedScore);
  };

  const handleContinue = () => {
    if (score === null) {
      evaluateSequence();
    }
    handleNext();
  };

  return (
    <div className="module-container">
      <div className="d-flex align-items-center">
        <h4>Alternancia conceptual</h4>
        <Button
          variant="link"
          onClick={() =>
            speakInstructions(
              'Me gustaría que dibuje una línea alternando entre cifras y letras, ' +
                'respetando el orden numérico y el orden alfabético. Comience aquí, uno, y dibuje ' +
                'una línea hacia la letra A, y a continuación hacia el dos, etcétera. Termine aquí, E.'
            )
          }
        >
          {isSpeaking ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>
        “Me gustaría que dibuje una línea alternando entre cifras y letras, respetando el orden numérico
        y el orden alfabético. Comience aquí (1) y dibuje una línea hacia la letra A, y a continuación
        hacia el 2, etc. Termine aquí (E).”
      </p>
      <div className="d-flex justify-content-center">
        <svg
          width={svgSize}
          height={svgSize}
          style={{ border: '2px solid black', backgroundColor: '#f9f9f9' }}
          onMouseMove={handleMouseMove}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="blue" />
            </marker>
          </defs>

          {connections.map((conn, idx) => {
            const fromMarker = markers[conn.from];
            const toMarker = markers[conn.to];
            if (!fromMarker || !toMarker) return null;
            return (
              <line
                key={idx}
                x1={fromMarker.x}
                y1={fromMarker.y}
                x2={toMarker.x}
                y2={toMarker.y}
                stroke="blue"
                strokeWidth="2"
                strokeDasharray={conn.dashed ? '5,5' : '0'}
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          {selectedMarker !== null && mousePosition && (
            <line
              x1={markers[selectedMarker].x}
              y1={markers[selectedMarker].y}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke="gray"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          )}

          {markers.map((marker, idx) => (
            <g
              key={idx}
              onClick={() => handleMarkerClick(idx)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={marker.x}
                cy={marker.y}
                r="30"
                fill="white"
                stroke="black"
                strokeWidth="2"
              />
              <text
                x={marker.x}
                y={marker.y + 8}
                textAnchor="middle"
                fontSize="24"
                fill="black"
              >
                {marker.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="d-flex justify-content-center mt-4">
        <Button variant="warning" onClick={handleReset} className="me-2">
          Reiniciar
        </Button>
        <Button
          variant="success"
          onClick={handleContinue}
          disabled={connections.length < labels.length - 1}
        >
          Continuar
        </Button>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={handlePrevious} disabled={isFirstModule}>
          Regresar
        </Button>
      </div>
    </div>
  );
};

const CuboActivity = ({
  cubeScore,
  setCubeScore,
  handleNext,
  handlePrevious,
  isSpeaking,
  speakInstructions,
  isFirstModule
}) => {
  // Estado de dibujo
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  
  // Historial de líneas para deshacer/rehacer
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const canvasRef = useRef(null);

  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para el Alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');

  // ======== EVENTOS DE DIBUJO EN EL CANVAS ========
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const rect = e.target.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    // Iniciar nueva línea; push a lines
    setLines((prev) => [...prev, [point]]);
    // Cada vez que empezamos a dibujar, vaciamos el redoStack
    setRedoStack([]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = e.target.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    setLines((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = [...updated[updated.length - 1], point];
      return updated;
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    // Podemos guardar en undoStack la fotografía del array actual
    // para permitir un "paso atrás" en el futuro
    // aunque en esta lógica, no es estrictamente necesario aquí
  };

  // ======== BOTÓN DE BORRAR DIBUJO ========
  const handleClear = () => {
    setLines([]);
    setUndoStack([]);
    setRedoStack([]);
    setCubeScore(null);
    setShowAlert(false);
    setError(null);
  };

  // ======== DIBUJAR EN EL CANVAS AL CAMBIAR 'lines' ========
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    // Limpiar el canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo blanco
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar las líneas
    context.strokeStyle = '#000';
    context.lineWidth = 5;
    lines.forEach((line) => {
      context.beginPath();
      line.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      context.stroke();
    });
  }, [lines]);

  // ======== FUNCIÓN DE DESHACER (UNDO) ========
  const handleUndo = () => {
    if (lines.length === 0) return; // No hay nada que deshacer
    // Tomamos la última línea
    const lastLine = lines[lines.length - 1];
    // La movemos al redoStack
    setRedoStack((prev) => [...prev, lastLine]);
    // Quitamos esa línea de lines
    setLines((prev) => prev.slice(0, prev.length - 1));
  };

  // ======== FUNCIÓN DE REHACER (REDO) ========
  const handleRedo = () => {
    if (redoStack.length === 0) return; // No hay nada que rehacer
    // Tomamos la última línea del redoStack
    const lineToRestore = redoStack[redoStack.length - 1];
    // La añadimos a lines
    setLines((prev) => [...prev, lineToRestore]);
    // La quitamos del redoStack
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
  };

  // ======== FUNCIÓN PRINCIPAL: EVALUAR CON BACKEND ========
  const handleEvaluate = async () => {
    setIsLoading(true);
    setError(null);

    const canvas = canvasRef.current;
    if (!canvas) {
      setAlertMessage("No se encontró el canvas.");
      setAlertVariant('danger');
      setShowAlert(true);
      setIsLoading(false);
      return;
    }

    try {
      // Convertir a Base64
      const imageData = canvas.toDataURL("image/png");
      console.log("imageData:", imageData);

      // Llamar a nuestro endpoint
      const response = await fetch('/api/evaluate-cube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.statusText}`);
      }

      // Parsear la respuesta
      const data = await response.json();
      console.log("Respuesta del backend:", data);

      // Actualizar el score en el estado global
      setCubeScore(data.score); // 0 ó 1

      // Mensajes sin la probabilidad
      if (data.score === 1) {
        // score = 1 => +1 punto
        setAlertMessage('¡Buen trabajo! Has completado correctamente el cubo (+1 Punto).');
        setAlertVariant('success');
      } else {
        // score = 0 => no completado
        setAlertMessage('Lo siento, no has completado correctamente el cubo (0 Puntos).');
        setAlertVariant('danger');
      }

      setShowAlert(true);
      return { score: data.score };

    } catch (err) {
      console.error("Error al evaluar el cubo:", err);
      setError("Hubo un problema al evaluar el cubo. Por favor, intenta nuevamente.");
      setAlertMessage("Hubo un problema al evaluar el cubo. Por favor, intenta nuevamente.");
      setAlertVariant('danger');
      setShowAlert(true);
      return { score: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  // ======== EVALUAR Y LUEGO CONTINUAR AL SIGUIENTE MÓDULO ========
  const handleAutoContinue = async () => {
    // Llamamos a handleEvaluate y esperamos el resultado
    const result = await handleEvaluate();
    // Lógica para avanzar
    if (result.score === 1) {
      handleNext();
    } else {
      // Puedes decidir si permitir continuar o no
      handleNext();
    }
  };

  return (
    <div className="module-container">
      <div className="d-flex align-items-center">
        <h4>Capacidades Visuoconstructivas (Cubo)</h4>
        <Button
          variant="link"
          onClick={() =>
            speakInstructions('Me gustaría que copie este dibujo de la manera más precisa posible.')
          }
        >
          {isSpeaking ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>“Me gustaría que copie este dibujo de la manera más precisa posible”.</p>

      <div className="d-flex justify-content-center">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Imagen de referencia del cubo */}
          <img
            src={cubo}
            alt="Cubo"
            style={{ width: '300px', marginRight: '20px' }}
          />
          {/* Canvas para dibujar */}
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            style={{ border: '1px solid black', backgroundColor: '#fff' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>

      {/* Botones de Deshacer y Rehacer */}
      <div className="d-flex justify-content-center mt-3">
        <Button variant="outline-secondary" onClick={handleUndo} className="me-2">
          Deshacer
        </Button>
        <Button variant="outline-secondary" onClick={handleRedo}>
          Rehacer
        </Button>
      </div>

      {/* Mostrar el Alert */}
      {showAlert && (
        <Alert
          variant={alertVariant}
          onClose={() => setShowAlert(false)}
          dismissible
          className="mt-3"
        >
          {alertMessage}
        </Alert>
      )}

      <div className="d-flex justify-content-center mt-3">
        <Button variant="warning" onClick={handleClear} className="me-2">
          Borrar dibujo
        </Button>

        {/* Botón "Continuar" */}
        <Button
          variant="success"
          onClick={handleAutoContinue}
          disabled={isLoading || lines.length === 0}
          className="me-2"
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Evaluando...
            </>
          ) : (
            "Continuar"
          )}
        </Button>

        {/* Botón "Evaluar" manual */}
        <Button
          variant="primary"
          onClick={handleEvaluate}
          disabled={isLoading || lines.length === 0}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Evaluando...
            </>
          ) : (
            "Evaluar"
          )}
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}

      <div className="d-flex flex-column align-items-center mt-3">
        {/* Mostrar el puntaje obtenido (si quieres que se vea aparte) */}
        {cubeScore !== null && (
          <div>
            <Button
              variant={cubeScore === 1 ? 'success' : 'danger'}
              className={`toggle-button ${cubeScore === 1 ? 'active' : ''} mb-2`}
              disabled
            >
              {cubeScore === 1
                ? 'Completado correctamente +1'
                : 'No completado correctamente 0'}
            </Button>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={handlePrevious} disabled={isFirstModule}>
          Regresar
        </Button>
      </div>
    </div>
  );
};

const RelojActivity = ({
  clockScore,
  setClockScore,
  handleNext,
  handlePrevious,
  isSpeaking,
  speakInstructions,
  isFirstModule
}) => {
  // Estado de dibujo
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]);

  // Historial para deshacer/rehacer
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const canvasRef = useRef(null);

  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para el Alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');

  // ======== EVENTOS DE DIBUJO EN EL CANVAS ========
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const rect = e.target.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    // Iniciar nueva línea
    setLines((prev) => [...prev, [point]]);
    setRedoStack([]); // Limpiar el redoStack al iniciar un nuevo trazo
    console.log("Nueva línea iniciada:", point);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = e.target.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    setLines((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = [...updated[updated.length - 1], point];
      return updated;
    });
    console.log("Punto agregado a la línea:", point);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    console.log("Finalizó el trazo.");
  };

  // ======== BOTÓN DE BORRAR DIBUJO ========
  const handleClear = () => {
    setLines([]);
    setUndoStack([]);
    setRedoStack([]);
    setClockScore(null);
    setShowAlert(false);
    setError(null);
    console.log("Canvas limpiado.");
  };

  // ======== FUNCIÓN DE DESHACER (UNDO) ========
  const handleUndo = () => {
    if (lines.length === 0) return;
    const lastLine = lines[lines.length - 1];
    setRedoStack((prev) => [...prev, lastLine]);
    setLines((prev) => prev.slice(0, prev.length - 1));
    console.log("Deshacer: Última línea removida.");
  };

  // ======== FUNCIÓN DE REHACER (REDO) ========
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const lineToRestore = redoStack[redoStack.length - 1];
    setLines((prev) => [...prev, lineToRestore]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    console.log("Rehacer: Última línea restaurada.");
  };

  // ======== DIBUJAR EN EL CANVAS AL CAMBIAR 'lines' ========
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    // Limpiar el canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo blanco
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar las líneas
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    lines.forEach((line, idx) => {
      context.beginPath();
      line.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      context.stroke();
      console.log(`Línea ${idx + 1} dibujada con ${line.length} puntos.`);
    });
  }, [lines]);

  // ======== FUNCIÓN PRINCIPAL: EVALUAR CON BACKEND ========
  const handleEvaluate = async () => {
    setIsLoading(true);
    setError(null);

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Error: No se encontró el canvas.");
      setAlertMessage("No se encontró el canvas.");
      setAlertVariant('danger');
      setShowAlert(true);
      setIsLoading(false);
      return;
    }

    try {
      // Convertir canvas a imagen Base64
      const imageData = canvas.toDataURL("image/png");
      console.log("Evaluando el reloj: Imagen convertida a Base64.");

      // Llamar al endpoint /api/evaluate-clock
      const response = await fetch('http://localhost:5001/api/evaluate-clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });

      console.log("Solicitud enviada a /api/evaluate-clock");

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.statusText}`);
      }

      // Parsear respuesta del backend
      // En handleEvaluate (frontend):
const data = await response.json();
console.log("Respuesta del backend (reloj):", data);

// data.score es un entero 0..3
// data.detail = { contorno, numeros, agujas }

if (typeof data.score === 'number') {
  setClockScore(data.score);

  // Mensaje con desglose
  if (data.score === 3) {
    setAlertMessage('¡Perfecto! Contorno, números y agujas correctos. +3 Puntos');
    setAlertVariant('success');
  } else {
    const { contorno, numeros, agujas } = data.detail;
    setAlertMessage(`Puntaje: ${data.score} / 3
    Contorno: ${contorno}
    Números: ${numeros}
    Agujas: ${agujas}`);
    setAlertVariant('warning'); 
  }
  setShowAlert(true);
}

      console.log("Evaluación completada.");
    } catch (err) {
      console.error("Error al evaluar el reloj:", err);
      setError("Hubo un problema al evaluar el reloj. Por favor, intenta nuevamente.");
      setAlertMessage("Hubo un problema al evaluar el reloj. Por favor, intenta nuevamente.");
      setAlertVariant('danger');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ======== EVALUAR Y LUEGO CONTINUAR ========
  const handleAutoContinue = async () => {
    await handleEvaluate();
    handleNext(); // Avanzar al siguiente módulo
    console.log("Auto-continue: Avanzando al siguiente módulo.");
  };

  return (
    <div className="module-container">
      <div className="d-flex align-items-center">
        <h4>Capacidades Visuoconstructivas (Reloj)</h4>
        <Button
          variant="link"
          onClick={() =>
            speakInstructions(
              'Ahora me gustaría que dibuje un reloj, que incluya todos los números y marque las 11 y 10.'
            )
          }
        >
          {isSpeaking ? <FaStop /> : <FaPlay />}
        </Button>
      </div>

      <p>“Ahora me gustaría que dibuje un reloj, que incluya todos los números, y que marque las 11 y 10.”</p>

      <div className="d-flex justify-content-center">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Imagen de referencia del reloj */}
          
          {/* Canvas para dibujar */}
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            style={{ border: '1px solid black', backgroundColor: '#fff' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>

      {/* Botones de Deshacer y Rehacer */}
      <div className="d-flex justify-content-center mt-3">
        <Button variant="outline-secondary" onClick={handleUndo} className="me-2">
          Deshacer
        </Button>
        <Button variant="outline-secondary" onClick={handleRedo}>
          Rehacer
        </Button>
      </div>

      {/* Mostrar el Alert */}
      {showAlert && (
        <Alert
          variant={alertVariant}
          onClose={() => setShowAlert(false)}
          dismissible
          className="mt-3"
        >
          {alertMessage}
        </Alert>
      )}

      <div className="d-flex justify-content-center mt-3">
        <Button variant="warning" onClick={handleClear} className="me-2">
          Borrar dibujo
        </Button>
        <Button
          variant="success"
          onClick={handleAutoContinue}
          disabled={isLoading || lines.length === 0}
          className="me-2"
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Evaluando...
            </>
          ) : (
            "Continuar"
          )}
        </Button>
        <Button
          variant="primary"
          onClick={handleEvaluate}
          disabled={isLoading || lines.length === 0}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Evaluando...
            </>
          ) : (
            "Evaluar"
          )}
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}

      <div className="d-flex flex-column align-items-center mt-3">
        {clockScore !== null && (
          <div>
            <Button
              variant={clockScore === 1 ? 'success' : 'danger'}
              className={`toggle-button ${clockScore === 1 ? 'active' : ''} mb-2`}
              disabled
            >
              {clockScore === 1
                ? 'Dibujado correctamente +1'
                : 'No dibujado correctamente 0'}
            </Button>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={handlePrevious} disabled={isFirstModule}>
          Regresar
        </Button>
      </div>
    </div>
  );
};

export default Visuoespacial;
