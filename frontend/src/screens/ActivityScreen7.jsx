// src/screens/ActivityScreen7.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';

const images = [
  { id: 1, src: require('../images/fresa.jpg') },
  { id: 2, src: require('../images/arandanos.jpg') },
  { id: 3, src: require('../images/Kywi.jpg') },
  { id: 4, src: require('../images/limon.jpg') },
  { id: 5, src: require('../images/mango.jpg') }
];

const shuffle = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const ActivityScreen7 = ({ activity, treatmentId }) => { // Recibe 'activity' y 'treatmentId' como props
  const [cards, setCards] = useState(shuffle([...images, ...images])); // Duplicar y mezclar las imágenes
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  const userInfo = useSelector((state) => state.auth.userInfo); // Obtener información del usuario autenticado

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

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
    if (matchedCards.length === images.length * 2) {
      setGameFinished(true);
      toast.success('¡Juego Terminado!');
      saveActivity(score, timer); // Guardar la actividad cuando el juego termina

      // Redirigir a la pantalla de inicio 6 segundos después
      setTimeout(() => {
        navigate('/api/treatments/activities');
      }, 6000);
    }
  }, [matchedCards, navigate, score, timer]);

  const handleCardClick = (index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(index)) {
      return; // No permitir más de dos cartas volteadas o cartas ya volteadas
    }

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [firstIndex, secondIndex] = newFlippedCards;
      if (cards[firstIndex].src === cards[secondIndex].src) {
        setMatchedCards((prev) => [...prev, firstIndex, secondIndex]);
        setScore((prevScore) => prevScore + 5);
        setFlippedCards([]);
        toast.success('¡Correcto! +5 puntos');
      } else {
        setScore((prevScore) => prevScore - 2);
        toast.error('Incorrecto. -2 puntos');
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000); // Voltear las cartas después de 1 segundo
      }
    }
  };

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
      activityId: activity._id, // ID de la actividad principal
      scoreObtained: finalScore,
      timeUsed: timeUsed,
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: `El paciente completó el Juego de Memoria con una puntuación de ${finalScore} y tiempo de ${timeUsed} segundos.`,
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
    <div className="memory-game-container">
      <h1>Juego de Memoria</h1>
      <p>Tiempo: {timer} segundos</p>
      <p>Puntuación: {score}</p>

      <div className="memory-cards-container">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`memory-card ${flippedCards.includes(index) || matchedCards.includes(index) ? 'flipped' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="memory-card-inner">
              <div className="memory-card-front">
                <img src={card.src} alt="Card" />
              </div>
              <div className="memory-card-back"></div>
            </div>
          </div>
        ))}
      </div>

      {gameFinished && (
        <div className="memory-results">
          <h2>¡Juego Terminado!</h2>
          <p>Tiempo total: {timer} segundos</p>
          <p>Puntuación final: {score}</p>
        </div>
      )}

      {/* Mostrar estado de guardado de la actividad */}
      {isRecording && <p>Guardando actividad...</p>}
      {recordError && <p>Error: {recordError?.data?.message || recordError.message}</p>}
      
      <ToastContainer />
    </div>
  );
};

export default ActivityScreen7;
