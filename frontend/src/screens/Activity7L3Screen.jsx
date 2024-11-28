// src/screens/ActivityScreenLevel3.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';

// Definición de imágenes de nivel 3
const imagesLevel3 = [
  { id: 1, src: require('../images/canguil.jpg') },
  { id: 2, src: require('../images/dona.jpg') },
  { id: 3, src: require('../images/cafe2.jpg') },
  { id: 4, src: require('../images/jugo.jpg') },
  { id: 5, src: require('../images/nachos.jpg') },
  { id: 6, src: require('../images/nuggets.jpg') },
  { id: 7, src: require('../images/hamburguesa.jpg') },
  { id: 8, src: require('../images/pizza2.jpg') },
  { id: 9, src: require('../images/bebida.jpg') },
  { id: 10, src: require('../images/helado.jpg') },
  { id: 11, src: require('../images/pastel.jpg') },
  { id: 12, src: require('../images/taco.jpg') },
  { id: 13, src: require('../images/burrito.jpg') },
  { id: 14, src: require('../images/papas.jpg') },
  { id: 15, src: require('../images/hotdog.jpg') }
];

// Función para barajar las cartas
const shuffle = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const ActivityScreenLevel3 = () => {
  const { treatmentId, activityId } = useParams(); // Extrae treatmentId y activityId de la ruta
  const [cards, setCards] = useState(shuffle([...imagesLevel3, ...imagesLevel3])); // Duplicar y mezclar las imágenes
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  // Obtener información del usuario autenticado desde el estado de Redux
  const userInfo = useSelector((state) => state.auth.userInfo);
  const patientId = userInfo?._id;

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  // Iniciar el temporizador
  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  // Manejar errores de la mutación
  useEffect(() => {
    if (recordError) {
      toast.error(`Error al guardar la actividad: ${recordError.data?.message || recordError.message}`);
    }
  }, [recordError]);

  // Verificar si el juego ha finalizado y guardar la actividad
  useEffect(() => {
    if (matchedCards.length === imagesLevel3.length * 2) {
      setGameFinished(true);
      toast.success('¡Juego Terminado!');
      saveActivity();

      // Navegar de regreso después de 6 segundos
      const timeout = setTimeout(() => {
        navigate('/api/treatments/activities'); // Asegúrate de que esta ruta sea correcta
      }, 6000);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedCards, navigate]);

  // Manejar el clic en una carta
  const handleCardClick = (index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(index)) {
      return;
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
        }, 1000);
      }
    }
  };

  // Función para guardar la actividad utilizando RTK Query
  const saveActivity = async () => {
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
      correctAnswers: matchedCards.length / 2, // Cada par correcto cuenta como una respuesta correcta
      incorrectAnswers: (cards.length / 2) - (matchedCards.length / 2), // Total de pares - correctos
      timeUsed: timer,
      scoreObtained: parseFloat(score.toFixed(2)), // Asegurar que es un número decimal
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: 'El paciente completó el juego de memoria de nivel avanzado.',
      patientId, // ID del paciente desde el estado de Redux
      difficultyLevel: 3, // Nivel de dificultad
      image: '', // No hay imagen asociada en esta actividad
    };

    console.log('Guardando actividad con los siguientes datos:', activityData);

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación
      await recordActivity({ treatmentId, activityData }).unwrap();

      console.log('Actividad guardada correctamente');
      toast.success('Actividad guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      // El error será manejado por el useEffect anterior
    }
  };

  return (
    <div className="memory-game-container">
      <h1>Juego de Memoria - Nivel 3</h1>
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

      {/* Eliminar el botón "Enviar Respuesta" */}
      {/* 
      {!gameFinished && (
        <button onClick={() => { /* No necesitas `checkAnswers` aquí ya que el juego se verifica automáticamente */ /* }} className="submit-button">
          Enviar Respuesta
        </button>
      )}
      */}

      {gameFinished && (
        <div className="memory-results">
          <h2>¡Juego Terminado!</h2>
          <p>Respuestas correctas: {matchedCards.length / 2} de {imagesLevel3.length}</p>
          <p>Respuestas incorrectas: {(cards.length / 2) - (matchedCards.length / 2)} de {imagesLevel3.length}</p>
          <p>Tiempo total: {timer} segundos</p>
          <p>Puntuación final: {score}</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreenLevel3;
