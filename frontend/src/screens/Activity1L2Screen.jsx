import React, { useState, useEffect } from 'react';
import { createBoard } from '../utils/createBoard2.js';
import Cell from '../components/Activity 1/Cell';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const Activity1L2Screen = () => {
  const [board, setBoard] = useState(() => createBoard(2)); // Nivel 2
  const [gamesToWin, setGamesToWin] = useState(5);
  const [timer, setTimer] = useState(0);
  const miliseconds = (timer / 10).toFixed(2);
  const navigate = useNavigate();

  useEffect(() => {
    if (gamesToWin > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gamesToWin]);

  const saveActivity = async () => {
    try {
      const activityData = {
        name: 'Búsqueda de Letras',
        description: 'Encuentra la letra correcta en un tablero mediano.',
        type: 'memoria',
        scoreObtained: 100,
        timeUsed: miliseconds,
        difficultyLevel: 2,
        observations: 'El paciente completó la actividad satisfactoriamente.',
        progress: 'mejorando',
        image: 'image_url',
        patientId: 'somePatientId',
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
        setTimeout(() => navigate('/activities'), 6000);
      } else {
        toast.error('Error al guardar la actividad');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad');
    }
  };

  const handleClick = (row, col) => {
    if (board[row][col].isHidden) {
      setGamesToWin(gamesToWin - 1);

      if (gamesToWin > 1) {
        setTimeout(() => setBoard(createBoard(2)), 500);
      } else if (gamesToWin === 1) {
        saveActivity(); 
      }
    }
  };

  return (
    <div className='activity-screen'>
      <h1>Encuentra la letra (Nivel 2)</h1>
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

export default Activity1L2Screen;
