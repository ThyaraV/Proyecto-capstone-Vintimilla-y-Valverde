import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice';
import { useSelector } from 'react-redux';
import styles from '../assets/styles/ActivityScreen7.module.css';

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
  { id: 15, src: require('../images/hotdog.jpg') },
];

const shuffle = (array) => array.sort(() => Math.random() - 0.5);

const ActivityScreenLevel3 = () => {
  const { treatmentId, activityId } = useParams();
  const [cards, setCards] = useState(shuffle([...imagesLevel3, ...imagesLevel3]));
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  const userInfo = useSelector((state) => state.auth.userInfo);

  const [recordActivity, { isLoading: isRecording, error: recordError }] =
    useRecordActivityMutation();

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
    if (recordError) {
      toast.error(`Error al guardar la actividad: ${recordError.data?.message || recordError.message}`);
    }
  }, [recordError]);

  useEffect(() => {
    if (matchedCards.length === imagesLevel3.length * 2) {
      setGameFinished(true);
      toast.success('¡Juego Terminado!');
      saveActivity();

      const timeout = setTimeout(() => {
        navigate('/api/treatments/activities');
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [matchedCards, navigate]);

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

  const saveActivity = async () => {
    if (!userInfo) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (!treatmentId) {
      toast.error('Tratamiento no identificado. No se puede guardar la actividad.');
      return;
    }

    const activityData = {
      activityId,
      correctAnswers: matchedCards.length / 2,
      incorrectAnswers: cards.length / 2 - matchedCards.length / 2,
      timeUsed: timer,
      scoreObtained: parseFloat(score.toFixed(2)),
      progress: 'mejorando',
      observations: 'El paciente completó el juego de memoria de nivel avanzado.',
      patientId: userInfo._id,
      difficultyLevel: 3,
    };

    try {
      await recordActivity({ treatmentId, activityData }).unwrap();
      toast.success('Actividad guardada correctamente');
    } catch (error) {
      const errorMessage = error?.data?.message || error.message || 'Error desconocido';
      toast.error(`Error al guardar la actividad: ${errorMessage}`);
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <h1 className={styles.title}>Juego de Memoria - Nivel 3</h1>
        <div className={styles.infoContainer}>
          <div className={styles.infoBox}>
            <span>Puntuación:</span>
            <span className={styles.score}>{score}</span>
          </div>
          <div className={styles.infoBox}>
            <span>Tiempo:</span>
            <span className={styles.timer}>{timer} segundos</span>
          </div>
        </div>

        {!gameFinished ? (
          <div className={styles.memoryCardsContainer}>
            {cards.map((card, index) => (
              <div
                key={index}
                className={`${styles.memoryCard} ${
                  flippedCards.includes(index) || matchedCards.includes(index) ? styles.flipped : ''
                }`}
                onClick={() => handleCardClick(index)}
              >
                <div className={styles.memoryCardInner}>
                  <div className={styles.memoryCardBack}></div>
                  <div className={styles.memoryCardFront}>
                    <img src={card.src} alt={`Card ${card.id}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.gameFinished}>
            <h2 className={styles.gameTitle}>¡Juego Terminado!</h2>
            <p>Tiempo total: {timer} segundos</p>
            <p>Puntuación final: {score}</p>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default ActivityScreenLevel3;
