// src/screens/MOCAmodules/Visuoespacial.jsx

import React, { useState, useRef, useEffect } from "react";
import { Button, Row, Col, Spinner } from "react-bootstrap";
import { Stage, Layer, Line, Circle, Text } from "react-konva";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as tf from "@tensorflow/tfjs";

const Visuoespacial = ({ onComplete, onPrevious, isFirstModule }) => {
  // Estado para almacenar los puntajes de las actividades
  const [diagramScore, setDiagramScore] = useState(null);
  const [cubeScore, setCubeScore] = useState(null);
  const [clockScore, setClockScore] = useState(null);

  // Estado para el dibujo y la evaluación
  const [drawing, setDrawing] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Estado para rastrear las conexiones realizadas
  const [connections, setConnections] = useState([]);

  const stageRef = useRef(null);

  // Definir los marcadores con posiciones dispersas
  const markers = [
    { label: '1', x: 100, y: 100 },
    { label: 'A', x: 300, y: 80 },
    { label: '2', x: 500, y: 150 },
    { label: 'B', x: 700, y: 100 },
    { label: '3', x: 600, y: 300 },
    { label: 'C', x: 400, y: 250 },
    { label: '4', x: 200, y: 300 },
    { label: 'D', x: 350, y: 400 },
    { label: '5', x: 550, y: 350 },
    { label: 'E', x: 750, y: 350 },
  ];

  // Función para convertir una secuencia a vectores numéricos
  const encodeSequence = (sequence) => {
    const mapping = {
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      'A': 6,
      'B': 7,
      'C': 8,
      'D': 9,
      'E': 10,
    };
    
    // Map each label to its numeric representation
    return sequence.map(label => mapping[label] || 0);
  };

  // Generar datos de entrenamiento
  const generateTrainingData = () => {
    const correctSequence = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];
    const incorrectSequences = [
      ['1', 'A', '2', 'C', '3', 'B', '4', 'D', '5', 'E'], // Error en el paso 4
      ['A', '1', '2', 'B', '3', 'C', '4', 'D', '5', 'E'], // Inicio incorrecto
      ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5'],       // Faltan nodos
      ['1', 'A', '2', 'B', '4', 'C', '3', 'D', '5', 'E'], // Error en el paso 6
      // Agrega más secuencias incorrectas según sea necesario
    ];

    const sequences = [correctSequence, ...incorrectSequences];
    const labels = [1, ...Array(incorrectSequences.length).fill(0)];

    const encodedSequences = sequences.map(seq => encodeSequence(seq));

    return { encodedSequences, labels };
  };

  // Definir el modelo
  const createModel = () => {
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [10], units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({
      optimizer: tf.train.adam(),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  };

  // Función para entrenar el modelo
  const trainModel = async () => {
    const { encodedSequences, labels } = generateTrainingData();

    const xs = tf.tensor2d(encodedSequences, [encodedSequences.length, 10]);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    const model = createModel();

    await model.fit(xs, ys, {
      epochs: 100,
      batchSize: 2,
      shuffle: true,
      callbacks: tf.callbacks.earlyStopping({ monitor: 'loss', patience: 10 }),
    });

    // Guardar el modelo
    await model.save('localstorage://moca_diagram_model');
    console.log('Modelo entrenado y guardado en el almacenamiento local.');
  };

  // Cargar el modelo de IA
  const loadModel = async () => {
    try {
      const model = await tf.loadLayersModel('localstorage://moca_diagram_model');
      return model;
    } catch (error) {
      console.error('Error al cargar el modelo de IA:', error);
      toast.error('Error al cargar el modelo de evaluación.');
      return null;
    }
  };

  // Función para preprocesar el dibujo antes de la evaluación
  const preprocessDrawing = (connections) => {
    const sequence = connections.map(conn => conn.from);
    const inputSequence = [...sequence, connections[connections.length - 1].to || '']; // Completar el último nodo
    const encodedSequence = encodeSequence(inputSequence.slice(0, 10)); // Limitar a 10 elementos
    return tf.tensor2d([encodedSequence], [1, 10]);
  };

  // Función para evaluar el dibujo utilizando TensorFlow.js
  const evaluateDrawingWithAI = async (connections) => {
    const model = await loadModel();
    if (!model) return 0;

    const processedDrawing = preprocessDrawing(connections);

    const prediction = model.predict(processedDrawing);
    const score = (prediction.dataSync()[0] > 0.5) ? 1 : 0;

    return score;
  };

  // Función para evaluar el dibujo
  const evaluateDrawing = async () => {
    setIsEvaluating(true);

    try {
      // Verificar si todas las conexiones necesarias están realizadas
      if (connections.length === markers.length - 1) {
        // Evaluar la secuencia con IA
        const score = await evaluateDrawingWithAI(connections);
        setDiagramScore(score);

        if (score === 1) {
          toast.success('Evaluación completada: Correcto');
        } else {
          // Identificar el error
          const correctSequence = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];
          let userSequence = [];

          connections.forEach((conn) => {
            userSequence.push(conn.from);
            userSequence.push(conn.to);
          });

          // Remover duplicados consecutivos
          userSequence = userSequence.filter((item, index) => index === 0 || item !== userSequence[index - 1]);

          let error = "";
          for (let i = 0; i < correctSequence.length; i++) {
            if (userSequence[i] !== correctSequence[i]) {
              error = `Error en el paso ${i + 1}: Se esperaba "${correctSequence[i]}" pero se obtuvo "${userSequence[i] || 'Ninguno'}".`;
              break;
            }
          }

          toast.error(`Evaluación completada: Incorrecto. ${error}`);
        }
      } else {
        toast.warn('Aún no has conectado todos los nodos.');
      }

      /*
      // Evaluación con IA (descomentar cuando el modelo esté disponible)
      const score = await evaluateDrawingWithAI(drawing);
      setDiagramScore(score);

      if (score === 1) {
        toast.success('Evaluación completada: Correcto');
      } else {
        toast.error('Evaluación completada: Incorrecto');
      }
      */
    } catch (error) {
      console.error('Error al evaluar el dibujo:', error);
      toast.error('Hubo un problema al evaluar el dibujo.');
      setDiagramScore(0); // Asignar puntaje 0 en caso de error
    } finally {
      setIsEvaluating(false);
    }
  };

  // Función para manejar el inicio de una conexión
  const handleStartConnection = (label) => {
    setConnections([...connections, { from: label, to: null }]);
  };

  // Función para manejar la finalización de una conexión
  const handleEndConnection = (label) => {
    const lastConnection = connections[connections.length - 1];
    if (lastConnection && lastConnection.to === null) {
      // Evitar conexiones duplicadas
      if (lastConnection.from !== label) {
        setConnections(connections.slice(0, -1).concat({ ...lastConnection, to: label }));
      }
    }
  };

  // Entrenar el modelo al montar el componente
  useEffect(() => {
    trainModel();
  }, []);

  // Función para manejar el puntaje y avanzar al siguiente módulo
  const handleNext = () => {
    // Calcular el puntaje total del módulo sumando los puntajes de las actividades
    const totalScore = (diagramScore || 0) + (cubeScore || 0) + (clockScore || 0);

    // Enviar puntajes individuales y puntaje total al componente padre
    onComplete(
      totalScore, // Puntaje total del módulo
      {
        diagram: diagramScore,
        cube: cubeScore,
        clock: clockScore,
      }
    );
  };

  return (
    <div className="module-container">
      {/* Actividad 1: Diagrama */}
      <Row className="justify-content-center mt-3">
        <Col md={12} className="d-flex flex-column align-items-center">
          <p className="instructions-text">
            <strong>Administración:</strong> El examinador da las instrucciones siguientes, indicando el lugar adecuado en la hoja: “Me gustaría que dibuje una línea alternando entre cifras y letras, respetando el orden numérico y el orden alfabético. Comience aquí (señale el 1) y dibuje una línea hacia la letra A, y a continuación hacia el 2, etc. Termine aquí (señale la E).
          </p>
          <Button
            variant="warning"
            className="mb-3"
            onClick={() => {
              setDrawing([]);
              setConnections([]);
              setDiagramScore(null);
              toast.info('Dibujo y conexiones reseteados. Intenta nuevamente.');
            }}
          >
            Resetear Dibujo y Conexiones
          </Button>
          <Stage
            width={1000} // Aumenta el ancho para acomodar todos los marcadores
            height={400} // Aumenta la altura para mayor espacio de dibujo
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            ref={stageRef}
            style={{ border: '2px solid #000', marginBottom: '10px' }}
          >
            <Layer>
              {/* Líneas Guía */}
              {markers.map((marker, index) => {
                if (index === 0) return null; // No dibujar línea para el primer marcador
                const previousMarker = markers[index - 1];
                return (
                  <React.Fragment key={index}>
                    <Line
                      points={[previousMarker.x, previousMarker.y, marker.x, marker.y]}
                      stroke="#00ff00"
                      strokeWidth={1}
                      dash={[4, 4]}
                    />
                  </React.Fragment>
                );
              })}

              {/* Conexiones del usuario */}
              {connections.map((conn, index) => {
                if (!conn.to) return null;
                const fromMarker = markers.find(m => m.label === conn.from);
                const toMarker = markers.find(m => m.label === conn.to);
                if (!fromMarker || !toMarker) return null;
                return (
                  <Line
                    key={index}
                    points={[fromMarker.x, fromMarker.y, toMarker.x, toMarker.y]}
                    stroke="#0000ff"
                    strokeWidth={2}
                  />
                );
              })}

              {/* Dibujo del usuario */}
              {drawing.map((line, i) => (
                <Line
                  key={i}
                  points={line}
                  stroke="#000"
                  strokeWidth={2}
                  tension={0.5}
                  lineCap="round"
                  globalCompositeOperation="source-over"
                />
              ))}

              {/* Marcadores */}
              {markers.map((marker, index) => (
                <React.Fragment key={index}>
                  <Circle
                    x={marker.x}
                    y={marker.y}
                    radius={15}
                    fill={connections.some(conn => conn.from === marker.label || conn.to === marker.label) ? "#00ff00" : "#ff0000"}
                    onClick={() => {
                      if (connections.length === 0 || connections[connections.length - 1].to !== null) {
                        handleStartConnection(marker.label);
                      } else {
                        handleEndConnection(marker.label);
                      }
                    }}
                  />
                  <Text
                    x={marker.x - 5}
                    y={marker.y - 8}
                    text={marker.label}
                    fontSize={14}
                    fill="#ffffff"
                  />
                </React.Fragment>
              ))}
            </Layer>
          </Stage>
          {isEvaluating && <Spinner animation="border" variant="primary" />}
          {diagramScore !== null && (
            <p className={`score-text ${diagramScore === 1 ? 'text-success' : 'text-danger'}`}>
              Puntaje: {diagramScore === 1 ? '1' : '0'}
            </p>
          )}
        </Col>
      </Row>

      {/* Actividad 2: Copiar el cubo */}
      <Row className="justify-content-center mt-4">
        <Col md={8} className="d-flex flex-column">
          <p className="instructions-text">Pida al paciente que copie el cubo</p>
          <Button
            variant={cubeScore === 1 ? "success" : "outline-success"}
            className={`toggle-button ${cubeScore === 1 ? "active" : ""} mb-2`}
            onClick={() => setCubeScore(1)}
          >
            Completado correctamente +1
          </Button>
          <Button
            variant={cubeScore === 0 ? "danger" : "outline-danger"}
            className={`toggle-button ${cubeScore === 0 ? "active" : ""}`}
            onClick={() => setCubeScore(0)}
          >
            No completado correctamente 0
          </Button>
        </Col>
      </Row>

      {/* Actividad 3: Dibujo del reloj */}
      <Row className="justify-content-center mt-4">
        <Col md={8} className="d-flex flex-column">
          <p className="instructions-text">
            Pida al paciente que dibuje un reloj (diez y diez)
          </p>
          <Button
            variant={clockScore === 3 ? "success" : "outline-success"}
            className={`toggle-button ${clockScore === 3 ? "active" : ""} mb-2`}
            onClick={() => setClockScore(3)}
          >
            Dibujo correctamente todas las características +3
          </Button>
          <Button
            variant={clockScore === 2 ? "primary" : "outline-primary"}
            className={`toggle-button ${clockScore === 2 ? "active" : ""} mb-2`}
            onClick={() => setClockScore(2)}
          >
            Dibujo correctamente dos de tres características +2
          </Button>
          <Button
            variant={clockScore === 1 ? "warning" : "outline-warning"}
            className={`toggle-button ${clockScore === 1 ? "active" : ""} mb-2`}
            onClick={() => setClockScore(1)}
          >
            Dibujo correctamente solo una característica +1
          </Button>
          <Button
            variant={clockScore === 0 ? "danger" : "outline-danger"}
            className={`toggle-button ${clockScore === 0 ? "active" : ""}`}
            onClick={() => setClockScore(0)}
          >
            Ninguna de las anteriores 0
          </Button>
        </Col>
      </Row>

      {/* Botones para continuar y regresar */}
      <div className="d-flex justify-content-between mt-4">
        {/* Botón de Regresar */}
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={isFirstModule}
        >
          Regresar
        </Button>

        {/* Botón de Continuar */}
        <Button
          variant="success"
          onClick={handleNext}
          disabled={
            diagramScore === null ||
            cubeScore === null ||
            clockScore === null ||
            isEvaluating
          }
        >
          Continuar
        </Button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Visuoespacial;
