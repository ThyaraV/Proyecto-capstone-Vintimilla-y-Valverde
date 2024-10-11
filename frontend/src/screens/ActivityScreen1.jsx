// src/screens/ActivityScreen1.jsx
import React, { useState, useEffect } from 'react';
import { createBoard } from '../utils/createBoard';
import Cell from '../components/Activity 1/Cell';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const ActivityScreen1 = () => {
  const [board, setBoard] = useState(() => createBoard());
  const [gamesToWin, setGamesToWin] = useState(4);
  const [timer, setTimer] = useState(0);
  const miliseconds = (timer / 10).toFixed(2); // Convierte el tiempo en milisegundos
  const navigate = useNavigate();

  // Incrementa el temporizador mientras haya juegos pendientes
  useEffect(() => {
    if (gamesToWin > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1); // Incrementa correctamente el timer
      }, 100); // 100ms = 0.1 segundos
      return () => clearInterval(interval);
    }
  }, [gamesToWin]);

  // Guarda la actividad incluyendo el tiempo usado
  const saveActivity = async () => {
    try {
      const activityData = {
        name: 'Búsqueda de letras',
        description: 'Actividad para encontrar la letra correcta en un tablero.',
        type: 'memoria',
        scoreObtained: 5,
        timeUsed: miliseconds, // Pasa el tiempo usado en milisegundos
        difficultyLevel: 1,
        observations: 'El paciente completó la actividad satisfactoriamente.',
        progress: 'mejorando',
        image: 'image_url',
        patientId: 'somePatientId', // Reemplaza con el ID real del paciente
      };

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (response.ok) {
        toast.success('Actividad guardada correctamente');

        // Espera 3 segundos para que el mensaje de éxito sea visible antes de redirigir
        setTimeout(() => {
          navigate('/activities'); // Redirige a la lista de actividades después de mostrar el toast
        }, 3000); // Espera 3 segundos antes de redirigir
      } else {
        toast.error('Error al guardar la actividad');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad');
    }
  };

  // Maneja el clic en las celdas del juego
  const handleClick = (row, col) => {
    if (board[row][col].isHidden) {
      setGamesToWin(gamesToWin - 1);

      setTimeout(() => {
        setBoard(createBoard());
      }, 500);

      // Cuando solo queda un juego, guarda la actividad
      if (gamesToWin === 1) {
        saveActivity(); // Ya no necesitas pasar `timer` como argumento, lo usas directamente
      }
    }
  };

  return (
    <div className='activity-screen'>
      <h1>Encuentra la letra</h1>
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

export default ActivityScreen1;
