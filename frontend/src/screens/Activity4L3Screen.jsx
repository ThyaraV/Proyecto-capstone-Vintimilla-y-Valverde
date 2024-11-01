import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Importa las imágenes
import Image1a from '../images/monalisa1.png';
import Image1b from '../images/monalisa2.png';
import Image2a from '../images/nocheEstrellada1.png';
import Image2b from '../images/nocheEstrellada2.png';
import Image3a from '../images/pareja1.png';
import Image3b from '../images/pareja2.png';
import Image4a from '../images/desiertoTiempo1.png';
import Image4b from '../images/desiertoTiempo2.png';
import Image5a from '../images/mujer1.png';
import Image5b from '../images/mujer2.png';

// Define las diferencias de cada par de imágenes
const imagePairs = [
  {
    id: 1,
    image1: Image1a,
    image2: Image1b,
    differences: [
      { id: 1, name: 'dedo', x: 215, y: 390, width: 70, height: 60 },
      { id: 2, name: 'arboles', x: 68, y: 150, width: 85, height: 85 },
    ],
  },
  {
    id: 2,
    image1: Image2a,
    image2: Image2b,
    differences: [
      { id: 3, name: 'nube', x: 343, y: 157, width: 75, height: 75 },
      { id: 4, name: 'puerta', x: 248, y: 425, width: 75, height: 75 },
    ],
  },
  {
    id: 3,
    image1: Image3a,
    image2: Image3b,
    differences: [
      { id: 5, name: 'ropa', x: 20, y: 300, width: 60, height: 60 },
      { id: 6, name: 'palo', x: 410, y: 107, width: 70, height: 70 },
    ],
  },
  {
    id: 4,
    image1: Image4a,
    image2: Image4b,
    differences: [
      { id: 7, name: 'piedra', x: 376, y: 140, width: 60, height: 60 },
      { id: 8, name: 'lampara', x: 145, y: 165, width: 60, height: 60 },
    ],
  },
  {
    id: 5,
    image1: Image5a,
    image2: Image5b,
    differences: [
      { id: 9, name: 'tela', x: 360, y: 330, width: 70, height: 70 },
      { id: 10, name: 'pelo', x: 210, y: 10, width: 80, height: 55 },
    ],
  },
];

const ActivityScreen4 = () => {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
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
      }, 7000); // Redirige después de 7 segundos
      return () => clearTimeout(timeout);
    }
  }, [gameFinished, navigate]);

  const currentPair = imagePairs[currentPairIndex];
  const isLastPair = currentPairIndex === imagePairs.length - 1;

  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let clickedOnDifference = false;

    currentPair.differences.forEach((difference) => {
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
          setFeedbackMessage(`¡Correcto! Has encontrado una diferencia.`);

          if (selectedOptions.length + 1 === currentPair.differences.length && !isLastPair) {
            setTimeout(() => handleNextPair(), 500);
          }
        }
      }
    });

    if (!clickedOnDifference) {
      setIncorrectAnswers((prev) => prev + 1);
      setPoints((prev) => prev - 2);
      setFeedbackMessage('¡Incorrecto! Esa no es una diferencia.');
    }
  };

  const handleNextPair = () => {
    setSelectedOptions([]);
    setFeedbackMessage('');
    if (!isLastPair) {
      setCurrentPairIndex(currentPairIndex + 1);
    }
  };

  const handleSubmit = () => {
    if (isLastPair) {
      setGameFinished(true);
      saveActivity(correctAnswers, incorrectAnswers);
    } else if (differencesFound < 10) {
      setShowDialog(true);
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

  const saveActivity = async () => {
    const activityData = {
      name: 'Encuentra diferencias',
      description: 'Actividad para encontrar las diferencias entre dos imágenes.',
      type: 'diferencias_imagenes',
      correctAnswers,
      incorrectAnswers,
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
        <img src={currentPair.image1} alt="Imagen 1" style={{ width: '464px', height: '534px' }} />
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={currentPair.image2}
            alt="Imagen 2"
            style={{ width: '464px', height: '534px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {!gameFinished && (
        <div className="button-container">
          {!isLastPair && (
            <button onClick={handleNextPair} className="next-button" style={{ marginRight: '10px', padding: '10px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Siguiente Par</button>
          )}
          <button onClick={handleSubmit} className="submit-button" style={{ padding: '10px', fontSize: '16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Enviar Respuesta</button>
        </div>
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
            <button onClick={handleEndGame} style={{ marginRight: '10px', padding: '10px', fontSize: '16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Terminar</button>
            <button onClick={handleContinuePlaying} style={{ padding: '10px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Continuar Jugando</button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreen4;
