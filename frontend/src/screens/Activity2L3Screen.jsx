// src/screens/Activity2L3Screen.jsx

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom'; 
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';

// Lista de fotos y sus opciones
const photos = [
  { src: require('../images/lentes.png'), name: 'Lentes', options: ['Lentes', 'Vidrio de una lupa', 'Reloj de bolsillo', 'Pantalla de un teléfono móvil', 'Visor de una cámara'] },
  { src: require('../images/silla.png'), name: 'Silla', options: ['Silla', 'Banco de madera', 'Taburete', 'Silla plegable', 'Sofá'] },
  { src: require('../images/ventana.png'), name: 'Ventana', options: ['Ventana', 'Espejo', 'Pantalla de una tablet', 'Cristal de automóvil', 'Marco de cuadro'] },
  { src: require('../images/plantas.png'), name: 'Plantas', options: ['Plantas', 'Musgo', 'Césped', 'Alga marina', 'Ramas secas'] },
  { src: require('../images/copa.png'), name: 'Copa', options: ['Copa', 'Jarra de vidrio', 'Botella de vino', 'Tazón de cerámica', 'Taza de té'] },
  { src: require('../images/persona.png'), name: 'Persona', options: ['Persona', 'Estatua de cera', 'Figura de acción', 'Maniquí', 'Escultura de algún animal'] },
  { src: require('../images/camaraFotos.png'), name: 'Cámara de fotos', options: ['Cámara de fotos', 'Mirilla de puerta', 'Lente de un telescopio', 'Cámara de seguridad', 'Foco de un proyector'] },
  { src: require('../images/corazon.png'), name: 'Corazón', options: ['Corazón', 'Pulmón', 'Riñón', 'Estómago', 'Cerebro'] },
  { src: require('../images/foco.png'), name: 'Foco', options: ['Foco', 'Linterna', 'Luz de emergencia', 'Lámpara de escritorio', 'Proyector'] },
  { src: require('../images/palmera.png'), name: 'Palmera', options: ['Palmera', 'Árbol de plátano', 'Bambú', 'Tronco de cocotero', 'Árbol de eucalipto'] },
];

// Barajar las opciones de manera aleatoria
const shuffle = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const Activity2L3Screen = () => {
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
      setOptions(shuffle(nextPhoto.options));  // Mostrar cinco opciones aleatorias
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
      difficultyLevel: 3, // Nivel de dificultad
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
      <h1>Juego de Asociación de Fotos (Nivel 3)</h1>
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

export default Activity2L3Screen;
