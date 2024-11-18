// src/screens/ActivityScreen1.jsx
import React, { useState, useEffect } from 'react'; 
import { createBoard } from '../utils/createBoard';
import Cell from '../components/Activity 1/Cell';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Asegúrate de importar desde treatmentApiSlice
import { useSelector } from 'react-redux';

const ActivityScreen1 = () => {
  const [board, setBoard] = useState(() => createBoard(1)); // Nivel 1
  const [gamesToWin, setGamesToWin] = useState(5); // 5 tableros por nivel
  const [timer, setTimer] = useState(0);
  const miliseconds = (timer / 10).toFixed(2);
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Suponiendo que el paciente está asociado a un tratamiento activo
  const activeTreatmentId = useSelector((state) => state.treatment.activeTreatmentId); // Asegúrate de tener este estado

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

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

      if (!activeTreatmentId) {
        toast.error('No hay tratamiento activo asociado');
        return;
      }

      const activityData = {
        activityId: '673902d3d166bf9105cdf757', // Reemplaza con el ID real de la actividad asignada
        scoreObtained: 100,
        timeUsed: parseFloat(miliseconds),
        progress: 'mejorando',
        observations: 'El paciente completó la actividad satisfactoriamente.',
      };

      console.log('Actividad a registrar:', activityData);

      // Registrar la actividad dentro del tratamiento
      const response = await recordActivity({ treatmentId: activeTreatmentId, activityData }).unwrap();

      toast.success('Actividad guardada correctamente');
      setTimeout(() => navigate('/activities'), 6000);
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      toast.error(`Hubo un problema al guardar la actividad: ${error.data?.message || error.message}`);
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
      {isRecording && <p>Guardando actividad...</p>}
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
