import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const fuseOptions = { includeScore: true, threshold: 0.4 };
const validColors = ['rojo', 'azul', 'verde', 'amarillo', 'morado'];
const validProfessions = ['doctor', 'ingeniero', 'arquitecto', 'profesor', 'científico'];
const validVehicles = ['coche', 'camioneta', 'bicicleta', 'motocicleta', 'avión'];

const colorFuse = new Fuse(validColors, fuseOptions);
const professionFuse = new Fuse(validProfessions, fuseOptions);
const vehicleFuse = new Fuse(validVehicles, fuseOptions);

const instructionsLevel2 = [
  { 
    id: 1, 
    type: 'input', 
    prompt: 'Escribe una profesión que termine en la letra O', 
    validator: (response) => professionFuse.search(response.trim().toLowerCase()).length > 0 
  },
  { 
    id: 2, 
    type: 'input', 
    prompt: 'Escribe un color que empiece con la letra A', 
    validator: (response) => colorFuse.search(response.trim().toLowerCase()).length > 0 
  },
  { 
    id: 3, 
    type: 'multiple', 
    prompt: '¿Cuál de estos elementos puede encontrarse en el espacio?', 
    options: ['Asteroide', 'Montaña', 'Perro'], 
    correctAnswer: 'Asteroide' 
  },
  { 
    id: 4, 
    type: 'multiple', 
    prompt: '¿Cuál de estos es un animal que puede volar?', 
    options: ['Águila', 'Pez', 'Gato'], 
    correctAnswer: 'Águila' 
  },
  { 
    id: 5, 
    type: 'input', 
    prompt: 'Escribe una fruta que tenga un color amarillo', 
    validator: (response) => ['piña', 'plátano'].includes(response.trim().toLowerCase())
  },
  { 
    id: 6, 
    type: 'input', 
    prompt: 'Escribe un vehículo que tenga dos ruedas', 
    validator: (response) => vehicleFuse.search(response.trim().toLowerCase()).some(result => ['bicicleta', 'motocicleta'].includes(result.item)) 
  },
  { 
    id: 7, 
    type: 'multiple', 
    prompt: '¿Cuál de estos animales es un mamífero?', 
    options: ['Delfín', 'Loro', 'Sardina'], 
    correctAnswer: 'Delfín' 
  },
  { 
    id: 8, 
    type: 'multiple', 
    prompt: '¿Cuál de estas es una estación del año?', 
    options: ['Primavera', 'Enero', 'Coche'], 
    correctAnswer: 'Primavera' 
  },
  { 
    id: 9, 
    type: 'input', 
    prompt: 'Escribe un objeto que se encuentre en la cocina y contenga la letra "t"', 
    validator: (response) => response.includes('t') 
  },
  { 
    id: 10, 
    type: 'input', 
    prompt: 'Escribe un país de América del Sur que empiece con la letra C', 
    validator: (response) => ['chile', 'colombia'].includes(response.trim().toLowerCase()) 
  }
];

const ActivityScreenLevel2 = () => {
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []);

  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => setTimer((prevTimer) => prevTimer + 0.1), 100);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  useEffect(() => {
    if (gameFinished) {
      const timeout = setTimeout(() => {
        navigate('/activities'); 
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [gameFinished, navigate]);

  const handleChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    let finalScore = 0;

    instructionsLevel2.forEach((instruction) => {
      const userResponse = responses[instruction.id] || ''; 

      if (instruction.type === 'input' && instruction.validator(userResponse)) {
        finalScore += 0.50;
      } else if (instruction.type === 'multiple' && userResponse.toLowerCase() === instruction.correctAnswer.toLowerCase()) {
        finalScore += 0.50;
      }
    });

    setScore(finalScore);
    setGameFinished(true);
    toast.success('Juego terminado. ¡Revisa tus resultados!');
    saveActivity(finalScore, timer.toFixed(2));
  };

  const saveActivity = async (finalScore, timeUsed) => {
    const activityData = {
      name: 'Seguir Instrucciones - Nivel 2',
      description: 'Juego de seguir instrucciones con respuestas mixtas - Nivel 2.',
      type: 'seguir_instrucciones',
      scoreObtained: finalScore,
      timeUsed: parseFloat(timeUsed),
      difficultyLevel: 2,
      observations: 'El usuario completó la actividad satisfactoriamente.',
      progress: 'mejorando',
      patientId: 'somePatientId' 
    };

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (response.ok) {
        toast.success('Actividad guardada correctamente.');
      } else {
        toast.error('Error al guardar la actividad.');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad.');
    }
  };

  return (
    <div className="follow-instructions-container">
      <h1>Juego de Seguir Instrucciones - Nivel 2</h1>
      <p className="timer-text">Tiempo: {timer.toFixed(2)} segundos</p>

      <div className="instructions-container">
        {instructionsLevel2.map((instruction) => (
          <div key={instruction.id} className="instruction">
            <p>{instruction.prompt}</p>
            {instruction.type === 'input' ? (
              <input
                type="text"
                value={responses[instruction.id] || ''}
                onChange={(e) => handleChange(instruction.id, e.target.value)}
                disabled={gameFinished}
                className="instruction-input"
                placeholder="Escribe tu respuesta"
              />
            ) : (
              <div className="options-group">
                {instruction.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleChange(instruction.id, option)}
                    className={`option-button ${responses[instruction.id] === option ? 'selected' : ''}`}
                    disabled={gameFinished}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {!gameFinished ? (
        <button onClick={handleSubmit} className="submit-button">
          Enviar Respuestas
        </button>
      ) : (
        <div className="results">
          <h2>¡Juego Terminado!</h2>
          <p>Puntuación final: {score.toFixed(2)} / 5</p>
          <p>Tiempo total: {timer.toFixed(2)} segundos</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreenLevel2;
