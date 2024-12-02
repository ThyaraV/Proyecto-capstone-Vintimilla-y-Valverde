// src/screens/MOCAmodules/Visuoespacial.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { FaPlay, FaStop } from 'react-icons/fa';

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

  const handleNext = () => {
    if (currentActivity < 2) {
      setCurrentActivity(currentActivity + 1);
    } else {
      const totalScore = (alternanciaScore || 0) + (cubeScore || 0) + (clockScore || 0);
      onComplete(
        totalScore,
        {
          alternancia: alternanciaScore,
          cube: cubeScore,
          clock: clockScore,
        }
      );
    }
  };

  const handlePrevious = () => {
    if (currentActivity > 0) {
      setCurrentActivity(currentActivity - 1);
    } else {
      onPrevious();
    }
  };

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

const AlternanciaConceptualActivity = ({ setAlternanciaScore, handleNext, handlePrevious, isSpeaking, speakInstructions, isFirstModule }) => {
  const labels = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];
  const svgSize = 450;

  // Corrected positions based on your requirements
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
      setConnections([...connections, { from: selectedMarker, to: index, dashed: false }]);
      setSelectedMarker(index);
    }
  };

  const handleReset = () => {
    setConnections(initialConnections);
    setSelectedMarker(2);
    setMousePosition(null);
    setScore(null);
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
        <Button variant="link" onClick={() => speakInstructions('Me gustaría que dibuje una línea alternando entre cifras y letras, respetando el orden numérico y el orden alfabético. Comience aquí, uno, y dibuje una línea hacia la letra A, y a continuación hacia el dos, etcétera. Termine aquí, E.')}>
          {isSpeaking ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>
        “Me gustaría que dibuje una línea alternando entre cifras y letras, respetando el orden numérico y el orden alfabético. Comience aquí (1) y dibuje una línea hacia la letra A, y a continuación hacia el 2, etc. Termine aquí (E).”
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

const CuboActivity = ({ cubeScore, setCubeScore, handleNext, handlePrevious, isSpeaking, speakInstructions, isFirstModule }) => {
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const canvasRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const rect = e.target.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setLines([...lines, [point]]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = e.target.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    let updatedLines = [...lines];
    updatedLines[updatedLines.length - 1] = [...updatedLines[updatedLines.length - 1], point];
    setLines(updatedLines);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    setLines([]);
  };

  const handleContinue = () => {
    // Here you can implement any evaluation logic if needed
    handleNext();
  };

  return (
    <div className="module-container">
      <div className="d-flex align-items-center">
        <h4>Capacidades visuoconstructivas (Cubo)</h4>
        <Button variant="link" onClick={() => speakInstructions('Me gustaría que copie este dibujo de la manera más precisa posible.')}>
          {isSpeaking ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>
        “Me gustaría que copie este dibujo de la manera más precisa posible”.
      </p>
      <div className="d-flex justify-content-center">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Imagen del cubo */}
          <img src="/path/to/cube_image.png" alt="Cubo" style={{ width: '300px', marginRight: '20px' }} />
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
      {/* Dibujar las líneas en el canvas */}
      {useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = '#000';
        context.lineWidth = 2;
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
      }, [lines])}
      <div className="d-flex justify-content-center mt-3">
        <Button variant="warning" onClick={handleClear} className="me-2">
          Borrar dibujo
        </Button>
        <Button
          variant="success"
          onClick={handleContinue}
        >
          Continuar
        </Button>
      </div>
      <div className="d-flex flex-column align-items-center mt-3">
        <Button
          variant={cubeScore === 1 ? 'success' : 'outline-success'}
          className={`toggle-button ${cubeScore === 1 ? 'active' : ''} mb-2`}
          onClick={() => setCubeScore(1)}
        >
          Completado correctamente +1
        </Button>
        <Button
          variant={cubeScore === 0 ? 'danger' : 'outline-danger'}
          className={`toggle-button ${cubeScore === 0 ? 'active' : ''}`}
          onClick={() => setCubeScore(0)}
        >
          No completado correctamente 0
        </Button>
      </div>
      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={handlePrevious}>
          Regresar
        </Button>
      </div>
    </div>
  );
};

const RelojActivity = ({ clockScore, setClockScore, handleNext, handlePrevious, isSpeaking, speakInstructions, isFirstModule }) => {
  return (
    <div className="module-container">
      <div className="d-flex align-items-center">
        <h4>Capacidades visuoconstructivas (Reloj)</h4>
        <Button variant="link" onClick={() => speakInstructions('Ahora me gustaría que dibuje un reloj, que incluya todos los números, y que marque las 11 y 10.')}>
          {isSpeaking ? <FaStop /> : <FaPlay />}
        </Button>
      </div>
      <p>
        “Ahora me gustaría que dibuje un reloj, que incluya todos los números, y que marque las 11 y 10”.
      </p>
      {/* Similar to the cube activity, you can implement a drawing area here */}
      <div className="d-flex flex-column align-items-center">
        <Button
          variant={clockScore === 3 ? 'success' : 'outline-success'}
          className={`toggle-button ${clockScore === 3 ? 'active' : ''} mb-2`}
          onClick={() => setClockScore(3)}
        >
          Dibujo correctamente todas las características +3
        </Button>
        <Button
          variant={clockScore === 2 ? 'primary' : 'outline-primary'}
          className={`toggle-button ${clockScore === 2 ? 'active' : ''} mb-2`}
          onClick={() => setClockScore(2)}
        >
          Dibujo correctamente dos de tres características +2
        </Button>
        <Button
          variant={clockScore === 1 ? 'warning' : 'outline-warning'}
          className={`toggle-button ${clockScore === 1 ? 'active' : ''} mb-2`}
          onClick={() => setClockScore(1)}
        >
          Dibujo correctamente solo una característica +1
        </Button>
        <Button
          variant={clockScore === 0 ? 'danger' : 'outline-danger'}
          className={`toggle-button ${clockScore === 0 ? 'active' : ''}`}
          onClick={() => setClockScore(0)}
        >
          Ninguna de las anteriores 0
        </Button>
      </div>
      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={handlePrevious}>
          Regresar
        </Button>
        <Button variant="success" onClick={handleNext} disabled={clockScore === null}>
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Visuoespacial;
