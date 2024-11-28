// src/screens/Activity1L3Screen.jsx

import React, { useState, useEffect } from 'react';
import { createBoard } from '../utils/createBoard3.js';
import Cell from '../components/Activity 1/Cell';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';

const Activity1L3Screen = () => {
  const { treatmentId, activityId } = useParams(); // Extrae treatmentId y activityId de la ruta
  const [board, setBoard] = useState(() => createBoard(3)); // Nivel 3
  const [gamesToWin, setGamesToWin] = useState(5);
  const [timer, setTimer] = useState(0);
  const miliseconds = (timer / 10).toFixed(2);
  const navigate = useNavigate();

  // Obtener información del usuario autenticado desde el estado de Redux
  const userInfo = useSelector((state) => state.auth.userInfo);
  const patientId = userInfo?._id;

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  useEffect(() => {
    let interval;
    if (gamesToWin > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gamesToWin]);

  // Desplazar al inicio de la página cuando el juego inicia
  useEffect(() => {
    window.scrollTo(0, 0); // Desplazar al tope cuando se carga el componente
  }, []);

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
      activityId, // ID de la actividad principal desde los parámetros de la ruta
      scoreObtained: finalScore,
      timeUsed: parseFloat(timeUsed),
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: 'El paciente completó la actividad satisfactoriamente.',
      patientId, // ID del paciente desde el estado de Redux
      difficultyLevel: 3, // Nivel de dificultad
      image: 'image_url', // Reemplazar con la URL real de la imagen si es necesario
    };

    console.log('Guardando actividad con los siguientes datos:', activityData);

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación
      await recordActivity({ treatmentId, activityData }).unwrap();

      console.log('Actividad guardada correctamente');
      toast.success('Actividad guardada correctamente');
      setTimeout(() => navigate('/api/treatments/activities'), 6000); // Redirigir después de 6 segundos
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      const errorMessage = error?.data?.message || error.message || 'Error desconocido';
      toast.error(`Hubo un problema al guardar la actividad: ${errorMessage}`);
    }
  };

  const handleClick = (row, col) => {
    if (board[row][col].isHidden) {
      setGamesToWin(gamesToWin - 1);

      if (gamesToWin > 1) {
        setTimeout(() => setBoard(createBoard(3)), 500);
      } else if (gamesToWin === 1) {
        // Calcular el puntaje final
        const finalScore = 5; // Ajusta esta lógica según tus necesidades

        saveActivity(finalScore, miliseconds); // Guardar la actividad con el puntaje actualizado
      }
    }
  };

  return (
    <div className='activity-screen'>
      <h1>Encuentra la letra (Nivel 3)</h1>
      {gamesToWin > 0 && <p>Tiempo: {miliseconds} segundos</p>}
      {gamesToWin === 0 ? (
        <p>Felicidades, tu tiempo fue: {miliseconds} segundos</p>
      ) : (
        <p>Juegos restantes: {gamesToWin}</p>
      )}
      {gamesToWin > 0 && (
        <div className='board'>
          {board.map((row, rowIdx) => (
            <div key={rowIdx} className='row'>
              {row.map((letter, letterIdx) => (
                <Cell key={letterIdx} handleClick={handleClick} {...letter} />
              ))}
            </div>
          ))}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Activity1L3Screen;
