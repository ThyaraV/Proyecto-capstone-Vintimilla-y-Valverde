// src/screens/ActivityScreenLevel3.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';

// Definición de preguntas de nivel 3
const questionsLevel3 = [
  {
    id: 1,
    question: '¿Dónde comenzó el viaje de Laura?',
    options: ['En la estación de tren', 'En el parque', 'En el centro comercial', 'En la biblioteca', 'En la playa'],
    correctAnswer: 'En la estación de tren'
  },
  {
    id: 2,
    question: '¿Con quién partió Laura en su aventura?',
    options: ['Con su hermana Sofía', 'Con su amiga Sofía', 'Con su prima Sofía', 'Con su profesora Sofía', 'Con su compañera Sofía'],
    correctAnswer: 'Con su amiga Sofía'
  },
  {
    id: 3,
    question: '¿Qué olvidó Laura durante su viaje?',
    options: ['Su mochila', 'Su teléfono', 'Su billetera', 'Su cámara', 'Sus gafas'],
    correctAnswer: 'Su billetera'
  },
  {
    id: 4,
    question: '¿Dónde hicieron un picnic Laura y Sofía?',
    options: ['Junto al lago', 'En el parque', 'En la playa', 'En el bosque', 'En la biblioteca'],
    correctAnswer: 'Junto al lago'
  },
  {
    id: 5,
    question: '¿Qué usó Laura para orientarse en el bosque?',
    options: ['Su teléfono', 'Su mapa', 'Su brújula', 'Las estrellas', 'Las señales naturales'],
    correctAnswer: 'Su brújula'
  }
];

const ActivityScreenLevel3 = () => {
  const { treatmentId, activityId } = useParams(); // Extrae treatmentId y activityId de la ruta
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0); // Estado para rastrear la diapositiva actual
  const navigate = useNavigate();
  const sliderRef = React.useRef(null);

  // Obtener información del usuario autenticado desde el estado de Redux
  const userInfo = useSelector((state) => state.auth.userInfo);
  const patientId = userInfo?._id;

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  // Scroll al inicio al montar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  // Manejar errores de la mutación
  useEffect(() => {
    if (recordError) {
      toast.error(`Error al guardar la actividad: ${recordError.data?.message || recordError.message}`);
    }
  }, [recordError]);

  // Verificar si el juego ha finalizado y guardar la actividad
  useEffect(() => {
    if (gameFinished) {
      toast.success('Juego terminado. ¡Revisa tus resultados!');
      saveActivity();

      // Navegar de regreso después de 6 segundos
      const timeout = setTimeout(() => {
        navigate('/api/treatments/activities'); // Asegúrate de que esta ruta sea correcta
      }, 6000);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameFinished]);

  const handleOptionClick = (questionId, answer) => {
    if (gameFinished) return; // Evitar cambiar respuestas después de finalizar el juego

    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    let finalScore = 0;
    questionsLevel3.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        finalScore += 1;
      }
    });
    setScore(finalScore);
    setGameFinished(true);
  };

  // Función para guardar la actividad utilizando RTK Query
  const saveActivity = async () => {
    // Validar que el usuario está autenticado
    if (!userInfo) {
      toast.error('Usuario no autenticado');
      return;
    }

    // Validar que treatmentId y activityId están definidos
    if (!treatmentId || !activityId) {
      toast.error('Tratamiento o actividad no identificado. No se puede guardar la actividad.');
      return;
    }

    // Calcula respuestas correctas e incorrectas
    const correctAnswers = questionsLevel3.filter(
      (question) => selectedAnswers[question.id] === question.correctAnswer
    ).length;
    const incorrectAnswers = questionsLevel3.length - correctAnswers;

    // Construir el objeto de datos de la actividad
    const activityData = {
      activityId, // ID de la actividad principal desde los parámetros de la ruta
      correctAnswers, // Número de respuestas correctas
      incorrectAnswers, // Número de respuestas incorrectas
      timeUsed: timer,
      scoreObtained: parseFloat(score.toFixed(2)), // Asegurar que es un número decimal
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: 'El paciente completó la actividad de preguntas de nivel avanzado.',
      patientId, // ID del paciente desde el estado de Redux
      difficultyLevel: 3, // Nivel de dificultad
      image: '', // No hay imagen asociada en esta actividad
    };

    console.log('Guardando actividad con los siguientes datos:', activityData);

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación
      await recordActivity({ treatmentId, activityData }).unwrap();

      console.log('Actividad guardada correctamente');
      toast.success('Actividad guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      // El error será manejado por el useEffect anterior
    }
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    swipe: false,
    adaptiveHeight: true,
    afterChange: (current) => setCurrentSlide(current) // Actualiza la diapositiva actual
  };

  return (
    <div className="story-game-container">
      <div className="background-box"></div>

      <div className="content">
        <div className="timer-container">
          <p>Tiempo: {timer} segundos</p>
        </div>
        <h1>El viaje aventurero</h1>
        <p className="story-text">
          Laura es una exploradora apasionada que decidió emprender un viaje al bosque para conectar con la naturaleza y explorar sus rincones. Comenzó su aventura en la estación de tren, desde donde partió con su amiga Sofía. A medio camino, Laura se dio cuenta de que había olvidado su billetera en casa, pero decidió continuar. Juntas recorrieron paisajes hermosos y se detuvieron a hacer un picnic junto al lago. Más tarde, al adentrarse en el bosque, tuvieron que enfrentar varios desafíos, como caminos bloqueados y la falta de señal en sus teléfonos. Laura sacó su brújula y lograron orientarse, encontrando un lugar seguro para acampar. Al final del día, Laura reflexionó sobre su viaje y decidió escribir sus experiencias para recordar su aventura.
        </p>

        {!gameFinished ? (
          <>
            <div className="questions-container">
              <Slider ref={sliderRef} {...settings}>
                {questionsLevel3.map((question) => (
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
              <button
                onClick={() => sliderRef.current.slickPrev()}
                className="prev-button"
                disabled={currentSlide === 0} // Deshabilitar 'Anterior' en la primera diapositiva
              >
                Anterior
              </button>
              <button
                onClick={() => sliderRef.current.slickNext()}
                className="next-button"
                disabled={currentSlide === questionsLevel3.length - 1} // Deshabilitar 'Siguiente' en la última diapositiva
              >
                Siguiente
              </button>
            </div>

            <button onClick={handleSubmit} className="submit-button">Enviar Respuestas</button>
          </>
        ) : (
          <div className="results">
            <h2>¡Juego Terminado!</h2>
            <p>Puntuación final: {score} de {questionsLevel3.length}</p>
            <p>Tiempo total: {timer} segundos</p>
          </div>
        )}

        <ToastContainer />
      </div>
    </div>
  );
};

export default ActivityScreenLevel3;
