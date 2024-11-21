// src/screens/ActivityScreen2.jsx

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 
import { useRecordActivityMutation, useGetActiveTreatmentQuery } from '../slices/treatmentSlice'; // Importa los hooks
import { useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';

const photos = [
  { _id: '673902d3d166bf9105cdf757', src: require('../images/pizza.jpg'), name: 'Pizza' },
  { _id: '673902d3d166bf9105cdf758', src: require('../images/cafe.jpg'), name: 'Café' },
  { _id: '673902d3d166bf9105cdf759', src: require('../images/mariposa.jpg'), name: 'Mariposa' },
  { _id: '673902d3d166bf9105cdf760', src: require('../images/oso.jpg'), name: 'Oso' },
  { _id: '673902d3d166bf9105cdf761', src: require('../images/ensalada.jpg'), name: 'Ensalada' }
];

const shuffle = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const ActivityScreen2 = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.auth.userInfo);
  const userId = userInfo?._id;

  // Obtener el tratamiento activo
  const { data: activeTreatment, isLoading: isTreatmentLoading, error: treatmentError } = useGetActiveTreatmentQuery(userId, {
    skip: !userId, // Omitir la consulta si no hay userId
  });

  // Hooks de la mutación
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  const [photoQueue, setPhotoQueue] = useState([]); // Lista barajada de fotos
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [answeredPhotos, setAnsweredPhotos] = useState(0);
  const [message, setMessage] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [activitySaved, setActivitySaved] = useState(false); // Bloqueo para evitar guardado doble

  useEffect(() => {
    // Barajar las imágenes al inicio
    setPhotoQueue(shuffle([...photos]));
  }, []);

  useEffect(() => {
    if (answeredPhotos < 5 && !gameFinished && photoQueue.length > 0) {
      const nextPhoto = photoQueue[answeredPhotos];
      const randomOptions = shuffleOptions(nextPhoto);
      setCurrentPhoto(nextPhoto);
      setOptions(randomOptions);
    }
  }, [answeredPhotos, gameFinished, photoQueue]);

  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  const shuffleOptions = (correctPhoto) => {
    const randomNames = photos.map((photo) => photo.name).filter((name) => name !== correctPhoto.name);
    const wrongOptions = shuffle(randomNames).slice(0, 2);
    return shuffle([correctPhoto.name, ...wrongOptions]);
  };

  const handleOptionClick = (selectedName) => {
    if (answeredPhotos >= 5 || gameFinished) return;

    let newScore = score;
    if (selectedName === currentPhoto.name) {
      newScore += 5;
      setMessage('¡Correcto! Has ganado 5 puntos.');
    } else {
      newScore -= 2;
      setMessage(`Incorrecto. La respuesta correcta es ${currentPhoto.name}. Has perdido 2 puntos.`);
    }

    setScore(newScore);
    setShowAnswer(true);

    setTimeout(() => {
      setShowAnswer(false);

      setAnsweredPhotos((prevAnswered) => {
        const newAnswered = prevAnswered + 1;

        if (newAnswered === 5 && !gameFinished) { // Verificar que el juego no haya terminado
          setGameFinished(true);
        }

        return newAnswered;
      });
    }, 3000); // Mostrar el mensaje por 3 segundos antes de pasar a la siguiente imagen
  };

  // Guardar actividad solo cuando el juego ha terminado
  useEffect(() => {
    if (gameFinished && !activitySaved && activeTreatment) {
      saveActivity(score, activeTreatment._id);
      setActivitySaved(true);
    }
  }, [gameFinished, activitySaved, score, activeTreatment]);

  const saveActivity = async (finalScore, treatmentId) => {
    if (!userInfo) {
      toast.error('Usuario no autenticado');
      return;
    }

    // Asegúrate de que cada foto tiene un _id
    const activityData = {
      activityId: currentPhoto?._id || null, // ID de la actividad (foto)
      scoreObtained: finalScore,
      timeUsed: timer, 
      progress: 'mejorando',
      observations: 'El paciente completó la actividad de asociación de fotos.',
    };

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación
      await recordActivity({ treatmentId, activityData }).unwrap();

      toast.success('Actividad guardada correctamente');
      setTimeout(() => {
          navigate('/activities'); // Redirige a la lista de actividades después de mostrar el toast
        }, 6000);
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      const errorMessage = error?.data?.message || error.message || 'Error desconocido';
      toast.error(`Hubo un problema al guardar la actividad: ${errorMessage}`);
    }
  };

  return (
    <div className="photo-association-game">
      <h1>Juego de Asociación de Fotos</h1>
      <p>Puntaje: {score}</p>
      <p>Tiempo: {timer} segundos</p>

      {isRecording && <p>Guardando actividad...</p>}
      {isTreatmentLoading && <p>Cargando tratamiento activo...</p>}
      {treatmentError && <p>Error: {treatmentError.message}</p>}

      {gameFinished ? (
        <div className="game-finished">
          <h2>¡Juego terminado!</h2>
          <p>Tiempo total: {timer} segundos</p>
          <p>Puntaje final: {score}</p>
        </div>
      ) : (
        <>
          {currentPhoto && (
            <div className="photo-container">
              <img src={currentPhoto.src} alt="Imagen actual" style={{ width: '300px', height: '300px' }} />
            </div>
          )}

          <div className="options-container">
            {options.map((option, index) => (
              <button key={index} onClick={() => handleOptionClick(option)} className="option-button">
                {option}
              </button>
            ))}
          </div>

          {showAnswer && (
            <div className="answer-message">
              <p>{message}</p>
            </div>
          )}
        </>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreen2;
