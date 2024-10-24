import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 

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
      const activityData = {
        name: 'Asociación de Fotos',
        description: 'Actividad de asociación de fotos con 4 opciones.',
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