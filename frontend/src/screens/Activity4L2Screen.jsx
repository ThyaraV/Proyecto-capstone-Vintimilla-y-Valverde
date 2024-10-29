import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importa las imágenes
import Image1 from '../images/imagen1.png'; 
import Image2 from '../images/imagen2.png'; 

const differences = [
  { id: 1, name: 'Ala gallo', x: 150, y: 290, width: 70, height: 70 },
  { id: 2, name: 'Gato', x: 67, y: 40, width: 50, height: 80 },
  { id: 3, name: 'Cola gallo', x: 103, y: 320, width: 50, height: 50 },
  { id: 4, name: 'Cerca', x: 120, y: 100, width: 50, height: 60 },
  { id: 5, name: 'Ramas de un árbol', x: 365, y: 34, width: 75, height: 75 },
  { id: 6, name: 'Cuello ganzo', x: 265, y: 210, width: 65, height: 65 },
  { id: 7, name: 'Cesped', x: 95, y: 450, width: 60, height: 60 },
  { id: 8, name: 'Flores de arbusto', x: 400, y: 210, width: 80, height: 180 },
  { id: 9, name: 'Patas del ganzo', x: 250, y: 400, width: 150, height: 60 },
  { id: 10, name: 'Flor', x: 210, y: 450, width: 60, height: 60 }
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
          setFeedbackMessage(`¡Correcto! Has encontrado una diferencia. Diferencias encontradas: ${differencesFound + 1} de 10`);
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
    if (selectedOptions.length < 10) {
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
      <h1>Encuentra las 10 diferencias</h1>
      <p>Tiempo: {timer} segundos</p>
      <p>Puntaje: {points}</p>
      <p>Diferencias encontradas: {differencesFound} de 10</p>
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
            <p>Has encontrado {differencesFound} de 10 diferencias.</p>
            <p>¿Quieres terminar el juego o continuar buscando?</p>
            <button onClick={handleEndGame}>Terminar</button>
            <button onClick={handleContinuePlaying}>Continuar Jugando</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityScreen4;
