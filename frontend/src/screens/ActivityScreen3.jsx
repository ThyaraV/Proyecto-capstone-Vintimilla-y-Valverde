// src/screens/ActivityScreen3.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Función para generar ecuaciones de suma o resta
const generateEquation = (type) => {
  const num1 = Math.floor(Math.random() * 50);  // Números pequeños para nivel 1
  const num2 = Math.floor(Math.random() * 50);

  if (type === 'sum') {
    return { equation: `${num1} + ${num2}`, correctAnswer: num1 + num2, num1, num2, operator: '+' };
  } else {
    return { equation: `${num1} - ${num2}`, correctAnswer: num1 - num2, num1, num2, operator: '-' };
  }
};

const ActivityScreen3 = ({ activity, treatmentId }) => { // Recibe 'activity' y 'treatmentId' como props
  const [equations, setEquations] = useState([]); // Lista de ecuaciones generadas
  const [currentEquationIndex, setCurrentEquationIndex] = useState(0); // Índice de la ecuación actual
  const [userAnswer, setUserAnswer] = useState(''); // Respuesta del usuario
  const [score, setScore] = useState(0); // Puntaje del usuario
  const [timer, setTimer] = useState(0); // Tiempo transcurrido
  const [gameFinished, setGameFinished] = useState(false); // Estado del juego
  const [activitySaved, setActivitySaved] = useState(false); // Estado de guardado de la actividad
  const [message, setMessage] = useState(''); // Mensaje de retroalimentación
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.auth.userInfo); // Información del usuario autenticado

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  // Generar las ecuaciones al montar el componente
  useEffect(() => {
    const generatedEquations = [
      generateEquation('sum'),
      generateEquation('sum'),
      generateEquation('sub'),
      generateEquation('sub'),
      generateEquation('sub'),
    ];
    setEquations(generatedEquations);
  }, []);

  // Iniciar el temporizador al montar el componente
  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  // Guardar la actividad una vez que el juego haya terminado y la actividad no haya sido guardada
  useEffect(() => {
    if (gameFinished && !activitySaved) {
      saveActivity(score);
      setActivitySaved(true);

      setTimeout(() => {
        navigate('/api/treatments/activities');
      }, 6000);
    }
  }, [gameFinished, activitySaved, score, navigate]);

  // Manejar el envío de la respuesta del usuario
  const handleSubmitAnswer = () => {
    const currentEquation = equations[currentEquationIndex];
    const correctAnswer = currentEquation.correctAnswer;

    if (parseInt(userAnswer) === correctAnswer) {
      setScore((prevScore) => prevScore + 5);
      setMessage('¡Correcto! Ganaste 5 puntos.');
    } else {
      setScore((prevScore) => prevScore - 2);
      setMessage(`Incorrecto. La respuesta correcta es ${correctAnswer}. Perdiste 2 puntos.`);
    }

    setUserAnswer('');
    setTimeout(() => processNextStep(), 3000);
  };

  // Procesar el siguiente paso después de responder una ecuación
  const processNextStep = () => {
    const nextEquationIndex = currentEquationIndex + 1;

    if (nextEquationIndex === equations.length) {
      setGameFinished(true);
    } else {
      setCurrentEquationIndex(nextEquationIndex);
      setMessage('');
    }
  };

  // Función para guardar la actividad en el backend dentro del tratamiento correspondiente
  const saveActivity = async (finalScore) => {
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
      timeUsed: timer, 
      progress: 'mejorando',
      observations: 'El paciente completó la actividad de sumas y restas en nivel básico.',
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
    <div className="game-screen">
      <h1>Juego de Sumas y Restas - Nivel 1</h1>
      <p style={{ fontWeight: 'bold' }}>Puntaje: {score}</p>
      <p style={{ fontWeight: 'bold' }}>Tiempo: {timer} segundos</p>

      {/* Mostrar estado de guardado de la actividad */}
      {isRecording && <p>Guardando actividad...</p>}
      {recordError && <p>Error: {recordError?.data?.message || recordError.message}</p>}

      {/* Mostrar contenido del juego o mensaje de finalización */}
      {gameFinished ? (
        <div className="game-finished">
          <h2 style={{ fontWeight: 'bold' }}>¡Juego terminado!</h2>
          <p>Tiempo total: {timer} segundos</p>
          <p>Puntaje final: {score}</p>
        </div>
      ) : (
        <>
          <div className="equation" style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold' }}>
            <div style={{ marginBottom: '10px' }}>
              <div>{equations[currentEquationIndex]?.num1}</div>
              <div>{equations[currentEquationIndex]?.operator} {equations[currentEquationIndex]?.num2}</div>
              <hr style={{ width: '50px', margin: '10px auto' }} />
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="?"
                style={{ fontSize: '32px', textAlign: 'center', width: '80px', height: '50px' }}
                disabled={gameFinished}
              />
            </div>
            <button onClick={handleSubmitAnswer} disabled={gameFinished} style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Responder
            </button>
          </div>

          {/* Mostrar mensaje de retroalimentación */}
          {message && (
            <div className="message-box" style={{ marginTop: '20px', fontSize: '22px', color: 'black', fontWeight: 'bold' }}>
              <p>{message}</p>
            </div>
          )}
        </>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreen3;
