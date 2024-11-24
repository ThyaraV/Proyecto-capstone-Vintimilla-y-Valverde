// src/screens/ActivityScreen9.jsx

import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';

// Listas de validaciones específicas
const validFruitsP = ['piña', 'pera', 'papaya', 'plátano', 'paraguayo'];
const validAnimalsT = ['tiburón', 'tortuga', 'tapir', 'ternero', 'toro', 'tarantula'];
const validCitiesM = ['madrid', 'manta', 'montevideo', 'miami', 'monpiche', 'muisne', 'manabi'];

// Configuración de Fuse.js para coincidencias aproximadas
const fuseOptions = { includeScore: true, threshold: 0.4 };

// Instancias de Fuse para cada lista
const fruitFuse = new Fuse(validFruitsP, fuseOptions);
const animalFuse = new Fuse(validAnimalsT, fuseOptions);
const cityFuse = new Fuse(validCitiesM, fuseOptions);

// Instrucciones del juego
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
    validator: (response) => cityFuse.search(response.trim().toLowerCase()).length > 0 
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
    validator: (response) => animalFuse.search(response.trim().toLowerCase()).length > 0 
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
    validator: (response) => fruitFuse.search(response.trim().toLowerCase()).length > 0 
  }
];

const ActivityScreen9 = ({ activity, treatmentId }) => { // Recibe 'activity' y 'treatmentId' como props
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  
  // Obtener información del usuario autenticado
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

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
        navigate('/api/treatments/activities'); 
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

  // Función para guardar la actividad en el backend dentro del tratamiento correspondiente
  const saveActivity = async (finalScore, timeUsed) => {
    // Validar que el usuario está autenticado
    if (!userInfo) {
      toast.error('Usuario no autenticado');
      return;
    }

    // Validar que treatmentId está definido
    if (!treatmentId) {
      toast.error('Tratamiento no identificado. No se puede guardar la actividad.');
      return;
    }

    // Construir el objeto de datos de la actividad
    const activityData = {
      activityId: activity._id, // ID de la actividad principal
      scoreObtained: finalScore,
      timeUsed: parseFloat(timeUsed),
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: 'El usuario completó la actividad de seguir instrucciones.',
      // Puedes agregar más campos si es necesario
    };

    console.log('Guardando actividad con los siguientes datos:', activityData);

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación
      await recordActivity({ treatmentId, activityData }).unwrap();

      console.log('Actividad guardada correctamente');
      toast.success('Actividad guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      const errorMessage = error?.data?.message || error.message || 'Error desconocido';
      toast.error(`Hubo un problema al guardar la actividad: ${errorMessage}`);
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

      {/* Mostrar estado de guardado de la actividad */}
      {isRecording && <p>Guardando actividad...</p>}
      {recordError && <p>Error: {recordError?.data?.message || recordError.message}</p>}
      
      <ToastContainer />
    </div>
  );
};

export default ActivityScreen9;
