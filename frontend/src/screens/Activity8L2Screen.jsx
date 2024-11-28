// src/screens/ActivityScreenLevel2.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';

// Definición de preguntas de nivel 2
const questionsLevel2 = [
  {
    id: 1,
    question: '¿Qué llevaba Marta en su bolso?',
    options: ['Un libro', 'Un teléfono', 'Una botella de agua', 'Un cuaderno'],
    correctAnswer: 'Un cuaderno'
  },
  {
    id: 2,
    question: '¿Con quién se encontró Marta en la biblioteca?',
    options: ['Su hermana Laura', 'Su amiga Laura', 'Su profesora Laura', 'Su prima Laura'],
    correctAnswer: 'Su amiga Laura'
  },
  {
    id: 3,
    question: '¿Qué observó Marta en el parque?',
    options: ['Una exhibición de arte urbano', 'Un desfile de moda', 'Un torneo de fútbol', 'Un espectáculo de teatro'],
    correctAnswer: 'Una exhibición de arte urbano'
  },
  {
    id: 4,
    question: '¿Qué compró Marta en la floristería?',
    options: ['Rosas', 'Lirios', 'Tulipanes', 'Girasoles'],
    correctAnswer: 'Tulipanes'
  },
  {
    id: 5,
    question: '¿Qué hizo Marta al llegar a casa?',
    options: ['Preparó la cena', 'Organizó sus libros nuevos', 'Hizo ejercicio', 'Vio una película'],
    correctAnswer: 'Organizó sus libros nuevos'
  }
];

const ActivityScreenLevel2 = () => {
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
    questionsLevel2.forEach((question) => {
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
    const correctAnswers = questionsLevel2.filter(
      (question) => selectedAnswers[question.id] === question.correctAnswer
    ).length;
    const incorrectAnswers = questionsLevel2.length - correctAnswers;

    // Construir el objeto de datos de la actividad
    const activityData = {
      activityId, // ID de la actividad principal desde los parámetros de la ruta
      correctAnswers, // Número de respuestas correctas
      incorrectAnswers, // Número de respuestas incorrectas
      timeUsed: timer,
      scoreObtained: parseFloat((score).toFixed(2)), // Asegurar que es un número decimal
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: 'El paciente completó la actividad de preguntas de nivel intermedio.',
      patientId, // ID del paciente desde el estado de Redux
      difficultyLevel: 2, // Nivel de dificultad
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
        <h1>Vida de Marta</h1>
        <p className="story-text">
          Marta es una mujer activa y curiosa que ama las bibliotecas y los espacios naturales. Un sábado,
          decidió emprender un día de exploración, comenzando con la biblioteca de su barrio, donde eligió una 
          novela misteriosa que había estado buscando. Allí se encontró con su amiga Laura, quien estaba leyendo
          sobre historia antigua. Pasaron un buen rato comentando sobre los libros, pero luego Marta decidió 
          explorar más. Fue al parque cercano y observó a la gente haciendo ejercicio, niños jugando, y una 
          exhibición de arte urbano. Visitó un pequeño estanque donde patos y peces convivían en tranquilidad.
          Después de una larga caminata, Marta se dirigió a su cafetería favorita y pidió su infaltable café.
          Para concluir su día, compró un ramo de tulipanes en la floristería, un gesto hacia la naturaleza
          que tanto apreciaba. Al llegar a casa, organizó sus libros nuevos, colocó las flores en el comedor
          y se sentó a leer, pensando en todo lo vivido ese día.
        </p>

        {!gameFinished ? (
          <>
            <div className="questions-container">
              <Slider ref={sliderRef} {...settings}>
                {questionsLevel2.map((question) => (
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
                disabled={currentSlide === 0} // Opcional: Deshabilitar 'Anterior' en la primera diapositiva
              >
                Anterior
              </button>
              <button
                onClick={() => sliderRef.current.slickNext()}
                className="next-button"
                disabled={currentSlide === questionsLevel2.length - 1} // Deshabilitar 'Siguiente' en la última diapositiva
              >
                Siguiente
              </button>
            </div>

            <button onClick={handleSubmit} className="submit-button">Enviar Respuestas</button>
          </>
        ) : (
          <div className="results">
            <h2>¡Juego Terminado!</h2>
            <p>Puntuación final: {score} de {questionsLevel2.length}</p>
            <p>Tiempo total: {timer} segundos</p>
          </div>
        )}

        <ToastContainer />
      </div>
    </div>
  );
};

export default ActivityScreenLevel2;
