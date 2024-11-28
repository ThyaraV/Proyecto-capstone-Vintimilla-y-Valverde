// src/screens/Activity2L2Screen.jsx

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom'; 
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';

// Lista de fotos y sus opciones
const photos = [
  { src: require('../images/esponja.png'), name: 'Esponja', options: ['Esponja', 'Almohadilla de fregar', 'Panal de abeja', 'Colchón de espuma'] },
  { src: require('../images/jean.png'), name: 'Jean', options: ['Jean', 'Camisa de mezclilla', 'Tela de tapicería', 'Pantalón de algodón'] },
  { src: require('../images/papas.png'), name: 'Papas', options: ['Papas', 'Tiras de plátano frito', 'Corteza de pan tostado', 'Tiras de yuca frita'] },
  { src: require('../images/alfombra.png'), name: 'Alfombra', options: ['Alfombra', 'Césped artificial', 'Tela de abrigo de lana', 'Manta tejida'] },
  { src: require('../images/cortezaArbol.png'), name: 'Corteza de árbol', options: ['Corteza de árbol', 'Madera tallada', 'Piel de un coco', 'Corteza de pino'] },
  { src: require('../images/teclado.png'), name: 'Teclado', options: ['Teclado', 'Botones de un control remoto', 'Teclas de una calculadora', 'Botones de un ascensor'] },
  { src: require('../images/arena.png'), name: 'Arena', options: ['Arena', 'Azúcar moreno', 'Sal gruesa', 'Polvo de canela'] },
  { src: require('../images/cuerdaGuitarra.png'), name: 'Cuerda de guitarra', options: ['Cuerda de guitarra', 'Hilo de pescar', 'Cuerda de violín', 'Cable de freno de bicicleta'] },
  { src: require('../images/sacoTejido.png'), name: 'Saco tejido', options: ['Saco tejido', 'Bufanda tejida', 'Manta de lana', 'Suéter de punto grueso'] },
  { src: require('../images/pedazoPastel.png'), name: 'Pedazo de pastel', options: ['Pedazo de pastel', 'Tarta de queso', 'Bizcocho', 'Panque de limón'] },
];

// Barajar las opciones de manera aleatoria
const shuffle = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const Activity2L2Screen = () => {
  const { treatmentId, activityId } = useParams(); // Extrae treatmentId y activityId de la ruta
  const [photoQueue, setPhotoQueue] = useState([]); // Lista barajada de fotos
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [answeredPhotos, setAnsweredPhotos] = useState(0);
  const [message, setMessage] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [activitySaved, setActivitySaved] = useState(false); // Para evitar el guardado doble
  const navigate = useNavigate();

  // Obtener información del usuario autenticado desde el estado de Redux
  const userInfo = useSelector((state) => state.auth.userInfo);
  const patientId = userInfo?._id;

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  useEffect(() => {
    // Barajar las imágenes al inicio
    setPhotoQueue(shuffle([...photos]));
  }, []);

  useEffect(() => {
    if (answeredPhotos < 10 && !gameFinished && photoQueue.length > 0) {
      const nextPhoto = photoQueue[answeredPhotos];
      setCurrentPhoto(nextPhoto);
      setOptions(shuffle(nextPhoto.options));  // Mostrar cuatro opciones aleatorias
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

  const handleOptionClick = (selectedName) => {
    if (answeredPhotos >= 10 || gameFinished) return;

    let newScore = score;
    if (selectedName === currentPhoto.name) {
      newScore += 0.5;  // Sumar 0.5 por cada respuesta correcta
      setMessage('¡Correcto! Has ganado 0.5 puntos.');
    } else {
      setMessage(`Incorrecto. La respuesta correcta es ${currentPhoto.name}.`);
    }

    setScore(newScore);
    setShowAnswer(true);

    setTimeout(() => {
      setShowAnswer(false);

      setAnsweredPhotos((prevAnswered) => {
        const newAnswered = prevAnswered + 1;

        if (newAnswered === 10 && !gameFinished) { // Verificar que el juego no haya terminado
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
      scoreObtained: finalScore,
      timeUsed: parseFloat(timer), 
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: 'El paciente completó la actividad de asociación de fotos.',
      patientId, // ID del paciente desde el estado de Redux
      difficultyLevel: 2, // Nivel de dificultad
      image: currentPhoto?.src || '', // Reemplazar con la URL real de la imagen si es necesario
    };

    console.log('Guardando actividad con los siguientes datos:', activityData);

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación
      await recordActivity({ treatmentId, activityData }).unwrap();

      console.log('Actividad guardada correctamente');
      toast.success('Actividad guardada correctamente');
      setTimeout(() => navigate('/api/treatments/activities'), 6000); // Redirigir después de 6 segundos
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      const errorMessage = error?.data?.message || error.message || 'Error desconocido';
      toast.error(`Hubo un problema al guardar la actividad: ${errorMessage}`);
    }
  };

  return (
    <div className="photo-association-game">
      <h1>Juego de Asociación de Fotos (Nivel 2)</h1>
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

export default Activity2L2Screen;
