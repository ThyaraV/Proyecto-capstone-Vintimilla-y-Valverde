import React, { useState, useEffect } from 'react'; 
import { createBoard } from '../utils/createBoard';
import Cell from '../components/Activity 1/Cell';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const ActivityScreen1 = () => {
  const [board, setBoard] = useState(() => createBoard(1)); // Nivel 1
  const [gamesToWin, setGamesToWin] = useState(5); // 5 tableros por nivel
  const [timer, setTimer] = useState(0);
  const miliseconds = (timer / 10).toFixed(2);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

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
      if (!userInfo) {
        toast.error('Usuario no autenticado');
        return;
      }

      const assignmentData = {
        activity: '672bd009a0ad0a5aca7d7d7a', // Reemplaza con el ID real de la actividad
        completionDate: new Date(),
        scoreObtained: 100,
        timeUsed: parseFloat(miliseconds),
        progress: 'mejorando',
        observations: 'El paciente completó la actividad satisfactoriamente.',
      };

      console.log('Assignment Data:', assignmentData);

      const token = localStorage.getItem('token');
      console.log('Token:', token);

      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la actividad');
      }

      toast.success('Actividad guardada correctamente');
      setTimeout(() => navigate('/activities'), 6000);
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      toast.error(`Hubo un problema al guardar la actividad: ${error.message}`);
    }
  };

  const handleClick = (row, col) => {
    if (board[row][col].isHidden) {
      setGamesToWin(gamesToWin - 1);

      if (gamesToWin > 1) {
        setTimeout(() => setBoard(createBoard(1)), 500);
      } else if (gamesToWin === 1) {
        saveActivity(); // Guardar al completar el último tablero
      }
    }
  };

  return (
    <div className='activity-screen'>
      <h1>Encuentra la letra (Nivel 1)</h1>
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
