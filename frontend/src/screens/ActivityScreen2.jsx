import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 

const photos = [
  { src: require('../images/photo1.jpg'), name: 'Pizza' },
  { src: require('../images/photo2.jpg'), name: 'Café' },
  { src: require('../images/photo3.jpg'), name: 'Mariposa' },
  { src: require('../images/photo4.jpg'), name: 'Oso' },
  { src: require('../images/photo5.jpg'), name: 'Ensalada' }
];

const shuffle = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const ActivityScreen2 = () => {
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
  const navigate = useNavigate();

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
    const wrongOptions = randomNames.sort(() => 0.5 - Math.random()).slice(0, 2);
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
    if (gameFinished && !activitySaved) {
      saveActivity(score);
      setActivitySaved(true);
    }
  }, [gameFinished, activitySaved, score]);

  const saveActivity = async (finalScore) => {
    const activityData = {
      name: 'Juego de Asociación de Fotos',
      description: 'Actividad de asociación de fotos con nombres.',
      type: 'asociacion_fotos',
      scoreObtained: finalScore,
      timeUsed: timer, 
      difficultyLevel: 1,
      observations: 'El paciente completó la actividad de asociación de fotos.',
      progress: 'mejorando',
      image: currentPhoto?.src || '',
      patientId: 'somePatientId' 
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
        setTimeout(() => {
            navigate('/activities'); // Redirige a la lista de actividades después de mostrar el toast
          }, 3000);
      } else {
        toast.error('Error al guardar la actividad');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad');
    }
  };

  return (
    <div className="photo-association-game">
      <h1>Juego de Asociación de Fotos</h1>
      <p>Puntaje: {score}</p>
      <p>Tiempo: {timer} segundos</p>

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

