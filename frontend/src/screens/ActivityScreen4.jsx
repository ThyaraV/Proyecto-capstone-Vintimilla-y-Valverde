import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importa las imágenes
import Image1 from '../images/Encontrar7diferenciasp1.png'; 
import Image2 from '../images/Encontrar7diferenciasp2.png'; 

const differences = [
  { id: 1, name: 'Expresión del niño', x: 228, y: 255, width: 50, height: 50 },
  { id: 2, name: 'Luz de la lámpara', x: 105, y: 185, width: 40, height: 40 },
  { id: 3, name: 'Triángulo en la pared', x: 336, y: 203, width: 60, height: 60 },
  { id: 4, name: 'Círculo detrás de la lámpara', x: 20, y: 233, width: 60, height: 60 },
  { id: 5, name: 'Color del tablero de la pared', x: 355, y: 70, width: 50, height: 50 },
  { id: 6, name: 'Círculo del libro', x: 384, y: 345, width: 60, height: 50 },
  { id: 7, name: 'Color dentro del libro', x: 75, y: 375, width: 50, height: 50 },
];

const ActivityScreen4 = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [points, setPoints] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [gameFinished, setGameFinished] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [timer, setTimer] = useState(0);
  const [differencesFound, setDifferencesFound] = useState(0); 
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
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

  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let clickedOnDifference = false;

    differences.forEach((difference) => {
      if (
        x >= difference.x &&
        x <= difference.x + difference.width &&
        y >= difference.y &&
        y <= difference.y + difference.height
      ) {
        clickedOnDifference = true;
        if (!selectedOptions.includes(difference.id)) {
          setSelectedOptions([...selectedOptions, difference.id]);
          setCorrectAnswers((prev) => prev + 1);
          setPoints((prev) => prev + 5);
          setDifferencesFound((prev) => prev + 1);
          setFeedbackMessage(`¡Correcto! Has encontrado una diferencia. Diferencias encontradas: ${differencesFound + 1} de 7`);
        }
      }
    });

    if (!clickedOnDifference) {
      setIncorrectAnswers((prev) => prev + 1);
      setPoints((prev) => prev - 2);
      setFeedbackMessage('¡Incorrecto! Esa no es una diferencia.');
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length < 7) {
      setShowDialog(true);
    } else {
      setGameFinished(true);
      saveActivity(correctAnswers, incorrectAnswers);
    }
  };

  const handleContinuePlaying = () => {
    setShowDialog(false);
  };

  const handleEndGame = () => {
    setShowDialog(false);
    setGameFinished(true);
    saveActivity(correctAnswers, incorrectAnswers);
  };

  const saveActivity = async (correct, incorrect) => {
    const activityData = {
      name: 'Encuentra diferencias',
      description: 'Actividad para encontrar las diferencias entre dos imágenes.',
      type: 'diferencias_imagenes',
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      timeUsed: timer,
      scoreObtained: points,
      patientId: 'somePatientId',
    };

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        setFeedbackMessage('Error al guardar la actividad');
      }
    } catch (error) {
      setFeedbackMessage('Hubo un problema al guardar la actividad');
    }
  };

  return (
    <div className="find-differences-game">
      <h1>Encuentra las 7 diferencias</h1>
      <p>Tiempo: {timer} segundos</p>
      <p>Puntaje: {points}</p>
      <p>Diferencias encontradas: {differencesFound} de 7</p>
      <p>{feedbackMessage}</p>

      <div className="images-container" style={{ position: 'relative' }} onClick={handleImageClick}>
        <img src={Image1} alt="Imagen 1" style={{ width: '464px', height: '534px' }} />
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={Image2}
            alt="Imagen 2"
            style={{ width: '464px', height: '534px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {!gameFinished && (
        <button onClick={handleSubmit} className="submit-button">Enviar Respuesta</button>
      )}

      {gameFinished && (
        <div className="results">
          <p>Correctas: {correctAnswers}</p>
          <p>Incorrectas: {incorrectAnswers}</p>
          <p>Tiempo total: {timer} segundos</p>
          <p>Puntaje final: {points}</p>
        </div>
      )}

      {showDialog && (
        <div className="dialog-box-overlay">
          <div className="dialog-box">
            <p>Has encontrado {differencesFound} de 7 diferencias.</p>
            <p>¿Quieres terminar el juego o continuar buscando?</p>
            <button onClick={handleEndGame}>Terminar</button>
            <button onClick={handleContinuePlaying}>Continuar Jugando</button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreen4;
