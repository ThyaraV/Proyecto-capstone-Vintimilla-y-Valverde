// src/screens/ActivityScreen8.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';

const questions = [
  {
    id: 1,
    question: '¿De qué color era el sombrero que llevaba María?',
    options: ['Rojo', 'Azul', 'Verde'],
    correctAnswer: 'Azul'
  },
  {
    id: 2,
    question: '¿Con quién se encontró María en el camino?',
    options: ['Con su hermana', 'Con Ana', 'Con su madre'],
    correctAnswer: 'Con Ana'
  },
  {
    id: 3,
    question: '¿Qué sabor de helado compraron María y Ana?',
    options: ['Chocolate', 'Fresa', 'Vainilla'],
    correctAnswer: 'Vainilla'
  },
  {
    id: 4,
    question: '¿Qué animal vieron María y Ana en el lago?',
    options: ['Gatos', 'Patos', 'Perros'],
    correctAnswer: 'Patos'
  },
  {
    id: 5,
    question: '¿Qué compró María antes de regresar a casa?',
    options: ['Flores amarillas', 'Un sombrero nuevo', 'Una bufanda roja'],
    correctAnswer: 'Flores amarillas'
  }
];

const ActivityScreen8 = ({ activity, treatmentId }) => { // Recibe 'activity' y 'treatmentId' como props
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const sliderRef = React.useRef(null);

  const userInfo = useSelector((state) => state.auth.userInfo); // Obtener información del usuario autenticado

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  useEffect(() => {
    window.scrollTo(0, 0); // Se asegura de que la página esté en el tope al cargar
  }, []);

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
    if (gameFinished) {
      const timeout = setTimeout(() => {
        navigate('/api/treatments/activities'); // Navegar a /activities después de 6 segundos
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [gameFinished, navigate]);

  const handleOptionClick = (questionId, answer) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    let finalScore = 0;
    questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        finalScore += 1;
      }
    });
    setScore(finalScore);
    setGameFinished(true);
    toast.success('Juego terminado. ¡Revisa tus resultados!');
    saveActivity(finalScore, timer);
  };

  // Función para guardar la actividad en el backend dentro del tratamiento correspondiente
  const saveActivity = async (finalScore, timeUsed) => {
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
      activityId: activity._id, // ID de la actividad principal
      scoreObtained: finalScore,
      timeUsed: timeUsed,
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: `El paciente respondió correctamente ${finalScore} de ${questions.length} preguntas.`,
      // Puedes agregar más campos si es necesario
    };

    console.log('Guardando actividad con los siguientes datos:', activityData);

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación
      await recordActivity({ treatmentId, activityData }).unwrap();

      console.log('Actividad guardada correctamente');
      toast.success('Actividad guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      const errorMessage = error?.data?.message || error.message || 'Error desconocido';
      toast.error(`Hubo un problema al guardar la actividad: ${errorMessage}`);
    }
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    swipe: false, // Desactiva el swipe para obligar al uso de botones
    adaptiveHeight: true
  };

  return (
    <div className="story-game-container">
      {/* Fondo del cuadro */}
      <div className="background-box"></div>

      {/* Contenido principal */}
      <div className="content">
        <div className="timer-container">
          <p>Tiempo: {timer} segundos</p>
        </div>
        <h1>El paseo de María</h1>
        <p className="story-text">
          María es una mujer alegre que vive en un pequeño pueblo. Un día soleado, decidió salir a pasear por el parque cercano. Primero, se puso su sombrero azul favorito y tomó su bolso. En el camino, se encontró con su amiga Ana, quien llevaba una bufanda roja. Juntas caminaron hasta la heladería donde compraron un helado de vainilla. Luego, se sentaron en un banco frente al lago y vieron a los patos nadando tranquilamente. Antes de regresar a casa, María compró flores amarillas para decorar su mesa del comedor. Al llegar a su casa, estaba feliz por haber tenido un día tan bonito.
        </p>

        {!gameFinished ? (
          <>
            <div className="questions-container">
              <Slider ref={sliderRef} {...settings}>
                {questions.map((question) => (
                  <div key={question.id} className="question-slide">
                    <div className="question">
                      <p className="question-text">{question.question}</p>
                      <div className="options-container">
                        {question.options.map((option, index) => (
                          <button
                            key={index}
                            className="option-button"
                            onClick={() => handleOptionClick(question.id, option)}
                            disabled={gameFinished}
                            style={{
                              backgroundColor: selectedAnswers[question.id] === option ? '#4caf50' : '#f0f0f0',
                              color: selectedAnswers[question.id] === option ? 'white' : 'black'
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>

            <div className="navigation-buttons">
              <button onClick={() => sliderRef.current.slickPrev()} className="prev-button">Anterior</button>
              <button onClick={() => sliderRef.current.slickNext()} className="next-button">Siguiente</button>
            </div>

            <button onClick={handleSubmit} className="submit-button">Enviar Respuestas</button>
          </>
        ) : (
          <div className="results">
            <h2>¡Juego Terminado!</h2>
            <p>Puntuación final: {score} / {questions.length}</p>
            <p>Tiempo total: {timer} segundos</p>
          </div>
        )}

        {/* Mostrar estado de guardado de la actividad */}
        {isRecording && <p>Guardando actividad...</p>}
        {recordError && <p>Error: {recordError?.data?.message || recordError.message}</p>}
        
        <ToastContainer />
      </div>
    </div>
  );
};

export default ActivityScreen8;
