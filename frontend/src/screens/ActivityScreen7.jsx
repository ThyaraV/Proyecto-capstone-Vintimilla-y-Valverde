import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const ActivityScreen7 = () => {
  const [cards, setCards] = useState(shuffle([...images, ...images])); // Duplicar y mezclar las imágenes
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
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
    if (matchedCards.length === images.length * 2) {
      setGameFinished(true);
      toast.success('¡Juego Terminado!');
      saveActivity(score, timer); // Guardar la actividad cuando el juego termina

      // Redirigir a la pantalla de inicio 5 segundos después
      setTimeout(() => {
        navigate('/activities');
      }, 8000);
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
    const activityData = {
      name: 'Juego de Memoria',
      description: 'Actividad de memoria para encontrar pares de imágenes.',
      type: 'memoria',
      scoreObtained: finalScore,
      timeUsed: timeUsed,
      patientId: 'somePatientId', // Reemplaza con el ID real del paciente
    };

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (response.ok) {
        toast.success('Actividad guardada correctamente');
      } else {
        toast.error('Error al guardar la actividad');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad');
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

      <ToastContainer />
    </div>
  );
};

export default ActivityScreen7;

