// src/screens/ActivityScreen2.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook
import { useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';

// Importa las imágenes al inicio para evitar usar require dentro del componente
import pizzaImg from '../images/pizza.jpg';
import cafeImg from '../images/cafe.jpg';
import mariposaImg from '../images/mariposa.jpg';
import osoImg from '../images/oso.jpg';
import ensaladaImg from '../images/ensalada.jpg';

const shuffle = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const ActivityScreen2 = ({ activity, treatmentId }) => { // Recibe 'treatmentId' como prop
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.auth.userInfo);

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
  // Removido 'activitySaved'

  // Memorizar 'photos' para evitar que cambie en cada renderizado
  const photos = useMemo(() => {
    return activity.photos || [
      { _id: '673902d3d166bf9105cdf757', src: pizzaImg, name: 'Pizza' },
      { _id: '673902d3d166bf9105cdf758', src: cafeImg, name: 'Café' },
      { _id: '673902d3d166bf9105cdf759', src: mariposaImg, name: 'Mariposa' },
      { _id: '673902d3d166bf9105cdf760', src: osoImg, name: 'Oso' },
      { _id: '673902d3d166bf9105cdf761', src: ensaladaImg, name: 'Ensalada' }
    ];
  }, [activity.photos]);

  // Inicializar la cola de fotos barajadas
  useEffect(() => {
    console.log('Objeto activity recibido:', activity);
    console.log('ID de la actividad:', activity?._id);
    console.log('Received treatmentId:', treatmentId); // Verificar que treatmentId no es undefined

    if (!activity || !activity._id) {
      toast.error('Actividad inválida o no encontrada');
      navigate('/api/treatments/activities'); // Redirige si la actividad no es válida
      return;
    }

    // Barajar las imágenes al inicio
    setPhotoQueue(shuffle([...photos]));
  }, [activity, photos, navigate, treatmentId]);

  // Seleccionar la siguiente foto y opciones
  useEffect(() => {
    if (answeredPhotos < 5 && !gameFinished && photoQueue.length > 0) {
      const nextPhoto = photoQueue[answeredPhotos];
      const randomOptions = shuffleOptions(nextPhoto);
      setCurrentPhoto(nextPhoto);
      setOptions(randomOptions);
    }
  }, [answeredPhotos, gameFinished, photoQueue]);

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

  // Función para barajar las opciones
  const shuffleOptions = (correctPhoto) => {
    const randomNames = photos.map((photo) => photo.name).filter((name) => name !== correctPhoto.name);
    const wrongOptions = shuffle(randomNames).slice(0, 2);
    return shuffle([correctPhoto.name, ...wrongOptions]);
  };

  // Manejar el clic en una opción
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
          // Llamar a saveActivity aquí directamente
          if (treatmentId) { // Verificar que treatmentId está definido
            saveActivity(newScore, treatmentId);
          } else {
            console.error('treatmentId no está definido. No se puede guardar la actividad.');
            toast.error('Error: treatmentId no está definido.');
          }
        }

        return newAnswered;
      });
    }, 3000); // Mostrar el mensaje por 3 segundos antes de pasar a la siguiente imagen
  };

  // Función para guardar la actividad en el backend
  const saveActivity = async (finalScore, treatmentId) => {
    if (!userInfo) {
      toast.error('Usuario no autenticado');
      return;
    }

    const activityData = {
      activityId: activity._id, // ID de la actividad principal
      photoId: currentPhoto?._id || null, // Opcional: Información sobre la foto seleccionada
      scoreObtained: finalScore,
      timeUsed: timer, 
      progress: 'mejorando',
      observations: 'El paciente completó la actividad de asociación de fotos.',
    };

    console.log('Guardando actividad con los siguientes datos:', activityData);

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación
      await recordActivity({ treatmentId, activityData }).unwrap();

      console.log('Actividad guardada correctamente');
      toast.success('Actividad guardada correctamente');
      setTimeout(() => {
        navigate('/api/treatments/activities'); // Redirige a la lista de actividades después de mostrar el toast
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
      {recordError && <p>Error: {recordError?.data?.message || recordError.message}</p>}

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
