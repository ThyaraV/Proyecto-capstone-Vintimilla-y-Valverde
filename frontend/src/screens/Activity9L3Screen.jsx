import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const validFruits = ['papaya', 'plátano', 'paraguayo', 'piña', 'pera', 'pomelo'];
const validAnimals = ['tigre', 'tiburón', 'tapir', 'toro', 'tarántula', 'tortuga'];
const validCitiesL = ['lima', 'londres', 'lisboa', 'león', 'la paz', 'laredo'];
const colors = ['azul', 'verde', 'rojo', 'amarillo', 'morado'];

const instructionsLevel3 = [
  {
    id: 1,
    type: 'input',
    prompt: 'Escribe el nombre de una ciudad que comience con la letra L',
    validator: (response) => validCitiesL.includes(response.trim().toLowerCase())
  },
  {
    id: 2,
    type: 'input',
    prompt: 'Escribe una palabra que termine en "mente"',
    validator: (response) => response.trim().toLowerCase().endsWith('mente')
  },
  {
    id: 3,
    type: 'multiple',
    prompt: '¿Cuál de estas opciones es un color?',
    options: ['Mesa', 'Rojo', 'Camisa', 'Tijera', 'Marzo'],
    correctAnswer: 'Rojo'
  },
  {
    id: 4,
    type: 'input',
    prompt: 'Escribe el nombre de un animal que comience con la letra T',
    validator: (response) => validAnimals.includes(response.trim().toLowerCase())
  },
  {
    id: 5,
    type: 'multiple',
    prompt: '¿Cuál de estas es una fruta cítrica?',
    options: ['Manzana', 'Sandía', 'Pomelo', 'Uva', 'Plátano'],
    correctAnswer: 'Pomelo'
  },
  {
    id: 6,
    type: 'input',
    prompt: 'Escribe una palabra que contenga la letra "z"',
    validator: (response) => response.trim().toLowerCase().includes('z')
  },
  {
    id: 7,
    type: 'multiple',
    prompt: '¿Cuál de estas es una bebida?',
    options: ['Jugo', 'Camisa', 'Libro', 'Computadora', 'Flor'],
    correctAnswer: 'Jugo'
  },
  {
    id: 8,
    type: 'input',
    prompt: 'Escribe el nombre de una fruta que comience con la letra P',
    validator: (response) => validFruits.includes(response.trim().toLowerCase())
  },
  {
    id: 9,
    type: 'multiple',
    prompt: '¿Cuál de estas es una emoción?',
    options: ['Enojo', 'Lápiz', 'Mesa', 'Agua', 'Planeta'],
    correctAnswer: 'Enojo'
  },
  {
    id: 10,
    type: 'input',
    prompt: 'Escribe un color que tenga al menos cuatro letras',
    validator: (response) => colors.includes(response.trim().toLowerCase())
  }
];

const ActivityScreenLevel3 = () => {
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
    instructionsLevel3.forEach((instruction) => {
      const userResponse = responses[instruction.id] || '';
      if (instruction.type === 'input' && instruction.validator(userResponse)) {
        finalScore += 0.50;
      } else if (instruction.type === 'multiple' && userResponse === instruction.correctAnswer) {
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
      name: 'Seguir Instrucciones - Nivel 3',
      description: 'Juego de seguir instrucciones con preguntas complejas.',
      type: 'seguir_instrucciones',
      scoreObtained: finalScore,
      timeUsed: parseFloat(timeUsed),
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
      <h1>Juego de Seguir Instrucciones - Nivel 3</h1>
      <p className="timer-text">Tiempo: {timer.toFixed(2)} segundos</p>
      <div className="instructions-container">
        {instructionsLevel3.map((instruction) => (
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

export default ActivityScreenLevel3;
