// src/screens/ActivityScreenLevel2.jsx

import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación RTK Query
import { useSelector } from 'react-redux';

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
  const { treatmentId, activityId } = useParams(); // Extrae treatmentId y activityId de la ruta
  const navigate = useNavigate();

  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);

  const userInfo = useSelector((state) => state.auth.userInfo); // Obtiene la información del usuario desde Redux
  const patientId = userInfo?._id;

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  // Scroll al inicio al montar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Iniciar el temporizador
  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => setTimer((prevTimer) => prevTimer + 0.1), 100);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  // Manejar errores de la mutación
  useEffect(() => {
    if (recordError) {
      toast.error(`Error al guardar la actividad: ${recordError.data?.message || recordError.message}`);
    }
  }, [recordError]);

  // Verificar si el juego ha finalizado y guardar la actividad
  useEffect(() => {
    if (gameFinished) {
      toast.success('Juego terminado. ¡Revisa tus resultados!');
      saveActivity();

      // Navegar de regreso después de 6 segundos
      const timeout = setTimeout(() => {
        navigate('/api/treatments/activities'); // Asegúrate de que esta ruta sea correcta
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [gameFinished, navigate]);

  const handleChange = (id, value) => {
    if (gameFinished) return; // Evitar cambiar respuestas después de finalizar el juego

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
  };

  // Función para guardar la actividad utilizando RTK Query
  const saveActivity = async () => {
    // Validar que el usuario está autenticado
    if (!userInfo) {
      toast.error('Usuario no autenticado');
      return;
    }

    // Validar que treatmentId y activityId están definidos
    if (!treatmentId || !activityId) {
      toast.error('Tratamiento o actividad no identificado. No se puede guardar la actividad.');
      return;
    }

    // Calcula respuestas correctas e incorrectas
    const correctAnswers = instructionsLevel2.filter(
      (instruction) => {
        const userResponse = responses[instruction.id] || '';
        if (instruction.type === 'input') {
          return instruction.validator(userResponse);
        } else if (instruction.type === 'multiple') {
          return userResponse.toLowerCase() === instruction.correctAnswer.toLowerCase();
        }
        return false;
      }
    ).length;

    const incorrectAnswers = instructionsLevel2.length - correctAnswers;

    // Construir el objeto de datos de la actividad
    const activityData = {
      activityId, // ID de la actividad principal desde los parámetros de la ruta
      correctAnswers, // Número de respuestas correctas
      incorrectAnswers, // Número de respuestas incorrectas
      timeUsed: timer,
      scoreObtained: parseFloat(score.toFixed(2)), // Asegurar que es un número decimal
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: 'El usuario completó la actividad satisfactoriamente.',
      patientId, // ID del paciente desde el estado de Redux
      difficultyLevel: 2, // Nivel de dificultad
      image: '', // No hay imagen asociada en esta actividad
    };

    console.log('Guardando actividad con los siguientes datos:', activityData);

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación RTK Query
      await recordActivity({ treatmentId, activityData }).unwrap();

      console.log('Actividad guardada correctamente');
      toast.success('Actividad guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      // El error será manejado por el useEffect anterior
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
          <p>Puntuación final: {score.toFixed(2)} / {instructionsLevel2.length * 0.5}</p>
          <p>Tiempo total: {timer.toFixed(2)} segundos</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreenLevel2;
