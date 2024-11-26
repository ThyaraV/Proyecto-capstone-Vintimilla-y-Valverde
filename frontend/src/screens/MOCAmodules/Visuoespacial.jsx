// frontend/src/screens/MOCAmodules/Visuoespacial.jsx
import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Spinner } from "react-bootstrap";
import { Stage, Layer, Circle, Text, Line } from "react-konva";
import * as tf from "@tensorflow/tfjs";

const Visuoespacial = ({ onComplete, onPrevious, isFirstModule }) => {
  // Estados para puntajes
  const [diagramScore, setDiagramScore] = useState(null);
  const [cubeScore, setCubeScore] = useState(null);
  const [clockScore, setClockScore] = useState(null);

  // Estados para nodos y conexiones
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);

  // Estado para el modelo de IA
  const [model, setModel] = useState(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [evaluated, setEvaluated] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Referencia para Stage
  const stageRef = useRef(null);

  // Secuencia correcta
  const correctSequence = ["1", "A", "2", "B", "3", "C", "4", "D", "5", "E"];

  // Inicializar nodos
  useEffect(() => {
    const initialNodes = [
      { id: "1", x: 100, y: 100 },
      { id: "A", x: 200, y: 100 },
      { id: "2", x: 300, y: 100 },
      { id: "B", x: 400, y: 100 },
      { id: "3", x: 500, y: 100 },
      { id: "C", x: 600, y: 100 },
      { id: "4", x: 700, y: 100 },
      { id: "D", x: 800, y: 100 },
      { id: "5", x: 900, y: 100 },
      { id: "E", x: 1000, y: 100 },
    ];
    setNodes(initialNodes);
  }, []);

  // Cargar el modelo de IA al montar el componente
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Iniciando la carga y entrenamiento del modelo...");

        // Definir un modelo simple de TensorFlow.js
        const model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [10], units: 16, activation: "relu" }));
        model.add(tf.layers.dense({ units: 2, activation: "softmax" }));

        // Instanciar el optimizador Adam con una tasa de aprendizaje de 0.001
        const optimizer = tf.train.adam(0.001);

        // Compilar el modelo con el optimizador instanciado
        model.compile({
          optimizer: optimizer,
          loss: "categoricalCrossentropy",
          metrics: ["accuracy"],
        });

        // Definir datos de entrenamiento
        const xsData = [
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Correct
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Incorrect
          [1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // Incorrect
          [1, 1, 0, 1, 1, 1, 1, 1, 1, 1], // Incorrect
          [1, 1, 1, 0, 1, 1, 1, 1, 1, 1], // Incorrect
          [1, 1, 1, 1, 0, 1, 1, 1, 1, 1], // Incorrect
          [1, 1, 1, 1, 1, 0, 1, 1, 1, 1], // Incorrect
          [1, 1, 1, 1, 1, 1, 0, 1, 1, 1], // Incorrect
          [1, 1, 1, 1, 1, 1, 1, 0, 1, 1], // Incorrect
          [1, 1, 1, 1, 1, 1, 1, 1, 0, 1], // Incorrect
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // Incorrect
        ];
        const ysData = [
          [1, 0], // Correct
          [0, 1], // Incorrect
          [0, 1], // Incorrect
          [0, 1], // Incorrect
          [0, 1], // Incorrect
          [0, 1], // Incorrect
          [0, 1], // Incorrect
          [0, 1], // Incorrect
          [0, 1], // Incorrect
          [0, 1], // Incorrect
          [0, 1], // Incorrect
        ];

        console.log("Datos de Entrenamiento (xs):", xsData);
        console.log("Etiquetas de Entrenamiento (ys):", ysData);

        // Verificar cada valor
        xsData.forEach((row, i) => {
          row.forEach((value, j) => {
            if (typeof value !== 'number') {
              console.error(`Valor inválido en xsData[${i}][${j}]:`, value);
            }
          });
        });

        ysData.forEach((row, i) => {
          row.forEach((value, j) => {
            if (typeof value !== 'number') {
              console.error(`Valor inválido en ysData[${i}][${j}]:`, value);
            }
          });
        });

        // Convertir datos a tensores
        const xs = tf.tensor2d(xsData);
        const ys = tf.tensor2d(ysData);

        console.log("xs tensor:", xs);
        console.log("ys tensor:", ys);

        console.log("Entrenando el modelo...");
        await model.fit(xs, ys, {
          epochs: 50, // Puedes aumentar las épocas para un mejor entrenamiento
          verbose: 1,
        });

        console.log("Modelo entrenado correctamente.");
        setModel(model);
        setLoadingModel(false);
      } catch (error) {
        console.error("Error al cargar o entrenar el modelo de IA:", error);
        setLoadingModel(false);
      }
    };

    loadModel();
  }, []);

  // Manejar clic en un nodo
  const handleNodeClick = (nodeId) => {
    if (evaluated) return; // Evitar cambios después de evaluación

    if (selectedNodes.includes(nodeId)) return; // Evitar seleccionar el mismo nodo varias veces

    const newSelectedNodes = [...selectedNodes, nodeId];
    setSelectedNodes(newSelectedNodes);

    if (newSelectedNodes.length > 1) {
      const from = newSelectedNodes[newSelectedNodes.length - 2];
      const to = nodeId;
      setConnections([...connections, { from, to }]);
    }

    // Si se ha completado la secuencia, evaluar
    if (newSelectedNodes.length === correctSequence.length) {
      evaluateSequence(newSelectedNodes);
    }
  };

  // Evaluar la secuencia usando el modelo de IA
  const evaluateSequence = async (sequence) => {
    if (!model) {
      console.error("Modelo no cargado");
      return;
    }

    tf.tidy(() => {
      // Convertir la secuencia en un vector de características
      const inputVector = correctSequence.map((item, index) => (sequence[index] === item ? 1 : 0));
      const inputTensor = tf.tensor2d([inputVector]);

      // Hacer la predicción
      const prediction = model.predict(inputTensor);
      const predictedClass = prediction.argMax(-1).dataSync()[0]; // 0: Correct, 1: Incorrect

      // Asignar puntaje basado en la predicción
      if (predictedClass === 0) {
        setDiagramScore(1);
        setEvaluationResult("Correcto");
      } else {
        setDiagramScore(0);
        setEvaluationResult("Incorrecto");
      }

      setEvaluated(true);
    });
  };

  // Renderizar nodos
  const renderNodes = () => {
    return nodes.map((node) => (
      <React.Fragment key={node.id}>
        <Circle
          x={node.x}
          y={node.y}
          radius={20}
          fill={selectedNodes.includes(node.id) ? "green" : "lightblue"}
          stroke="black"
          strokeWidth={2}
          onClick={() => handleNodeClick(node.id)}
        />
        <Text
          x={node.x - 5}
          y={node.y - 10}
          text={node.id}
          fontSize={20}
          fill="black"
        />
      </React.Fragment>
    ));
  };

  // Renderizar líneas de conexión
  const renderConnections = () => {
    return connections.map((conn, index) => {
      const fromNode = nodes.find((node) => node.id === conn.from);
      const toNode = nodes.find((node) => node.id === conn.to);
      return (
        <Line
          key={index}
          points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
          stroke="black"
          strokeWidth={2}
        />
      );
    });
  };

  // Manejar el botón de Continuar
  const handleNext = () => {
    // Calcular el puntaje total sumando los puntajes de las actividades
    const totalScore = (diagramScore || 0) + (cubeScore || 0) + (clockScore || 0);

    // Enviar puntajes individuales y total
    onComplete(totalScore, {
      diagram: diagramScore,
      cube: cubeScore,
      clock: clockScore,
    });
  };

  return (
    <div className="module-container">
      {/* Actividad 1: Diagrama */}
      <Row className="justify-content-center mt-3">
        <Col md={10} className="d-flex flex-column align-items-center">
          <p className="instructions-text">
            Pida al paciente que trace el diagrama en orden | Seguimiento visual | Precisión
          </p>
          <div
            className="diagram-container mb-3"
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              width: "1000px",
              height: "200px",
              position: "relative",
            }}
          >
            <Stage width={1000} height={200} ref={stageRef}>
              <Layer>
                {renderConnections()}
                {renderNodes()}
              </Layer>
            </Stage>
          </div>
          {!loadingModel ? (
            evaluated ? (
              <p>
                Resultado de la evaluación: <strong>{evaluationResult}</strong>
              </p>
            ) : (
              <p>Seleccione los nodos en el orden correcto.</p>
            )
          ) : (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando modelo...</span>
            </Spinner>
          )}
          {evaluated && (
            <div className="d-flex mt-2">
              <Button
                variant={diagramScore === 1 ? "success" : "danger"}
                className="me-2"
                disabled
              >
                {diagramScore === 1 ? "Completado correctamente +1" : "No completado correctamente 0"}
              </Button>
            </div>
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
          disabled={diagramScore === null || cubeScore === null || clockScore === null}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Visuoespacial;
