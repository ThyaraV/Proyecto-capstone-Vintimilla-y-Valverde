import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 

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
    const activityData = {
      name: 'Asociación de Fotos',
      description: 'Actividad de asociación de fotos con 5 opciones.',
      type: 'asociacion_fotos',
      scoreObtained: finalScore,
      timeUsed: timer, 
      difficultyLevel: 2, // Cambiar a nivel 2
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
          }, 6000);
      } else {
        toast.error('Error al guardar la actividad');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad');
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
