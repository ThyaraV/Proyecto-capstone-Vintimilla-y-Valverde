import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// Listas de validaciones específicas
const validFruitsP = ['piña', 'pera', 'papaya', 'plátano', 'paraguayo'];
const validAnimalsT = ['tiburón', 'tortuga', 'tapir', 'ternero','toro', 'tarantula'];
const validCitiesM = ['madrid', 'manta', 'montevideo', 'miami', 'monpiche', 'muisne', 'manabi'];

const instructions = [
  { 
    id: 1, 
    type: 'input', 
    prompt: 'Escribe una palabra que empiece por la letra A', 
    validator: (response) => response.trim().toLowerCase().startsWith('a') 
  },
  { 
    id: 2, 
    type: 'input', 
    prompt: 'Escribe una ciudad que empiece con la letra M', 
    validator: (response) => validCitiesM.includes(response.trim().toLowerCase()) 
  },
  { 
    id: 3, 
    type: 'multiple', 
    prompt: '¿Cuál de estas es un color?', 
    options: ['Perro', 'Rojo', 'Mesa'], 
    correctAnswer: 'Rojo' 
  },
  { 
    id: 4, 
    type: 'multiple', 
    prompt: '¿Cuál de estos es un animal acuático?', 
    options: ['Pez', 'Gato', 'Elefante'], 
    correctAnswer: 'Pez' 
  },
  { 
    id: 5, 
    type: 'multiple', 
    prompt: '¿Cuál de estas es una fruta roja?', 
    options: ['Manzana', 'Banana', 'Kiwi'], 
    correctAnswer: 'Manzana' 
  },
  { 
    id: 6, 
    type: 'input', 
    prompt: 'Escribe una palabra que empiece con la letra S', 
    validator: (response) => response.trim().toLowerCase().startsWith('s') 
  },
  { 
    id: 7, 
    type: 'multiple', 
    prompt: '¿Cuál de estas es una estación del año?', 
    options: ['Invierno', 'Marzo', 'Casa'], 
    correctAnswer: 'Invierno' 
  },
  { 
    id: 8, 
    type: 'input', 
    prompt: 'Escribe un animal que comience con la letra T', 
    validator: (response) => validAnimalsT.includes(response.trim().toLowerCase()) 
  },
  { 
    id: 9, 
    type: 'multiple', 
    prompt: '¿Cuál de estas opciones es un día de la semana?', 
    options: ['Martes', 'Abril', 'Plato'], 
    correctAnswer: 'Martes' 
  },
  { 
    id: 10, 
    type: 'input', 
    prompt: 'Escribe una fruta que empiece con la letra P', 
    validator: (response) => validFruitsP.includes(response.trim().toLowerCase()) 
  }
];

const ActivityScreen9 = () => {
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  // Mover la página directamente al inicio sin animación
  useEffect(() => {
    window.scrollTo(0, 0); // Colocar la página en la parte superior al cargar
  }, []);

  // Temporizador
  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => setTimer((prevTimer) => prevTimer + 0.1), 100);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  // Redirigir después de 6 segundos de haber finalizado el juego
  useEffect(() => {
    if (gameFinished) {
      const timeout = setTimeout(() => {
        navigate('/activities'); // Navegar a /activities después de 6 segundos
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [gameFinished, navigate]);

  const handleChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    let finalScore = 0;

    instructions.forEach((instruction) => {
      const userResponse = responses[instruction.id] || ''; // Asegura que no sea undefined

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
      name: 'Seguir Instrucciones',
      description: 'Juego de seguir instrucciones con respuestas mixtas.',
      type: 'seguir_instrucciones',
      scoreObtained: finalScore,
      timeUsed: parseFloat(timeUsed),
      difficultyLevel: 1,
      observations: 'El usuario completó la actividad satisfactoriamente.',
      progress: 'mejorando',
      patientId: 'somePatientId' // Reemplazar con el ID real del paciente
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
      <h1>Juego de Seguir Instrucciones</h1>
      <p className="timer-text">Tiempo: {timer.toFixed(2)} segundos</p>

      <div className="instructions-container">
        {instructions.map((instruction) => (
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
                    className={`option-button ${
                      responses[instruction.id] === option ? 'selected' : ''
                    }`}
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

export default ActivityScreen9;
