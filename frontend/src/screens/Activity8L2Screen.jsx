import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const questionsLevel2 = [
  {
    id: 1,
    question: '¿Qué llevaba Marta en su bolso?',
    options: ['Un libro', 'Un teléfono', 'Una botella de agua', 'Un cuaderno'],
    correctAnswer: 'Un cuaderno'
  },
  // (otras preguntas aquí)
];

const ActivityScreenLevel2 = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const sliderRef = React.useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
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
        navigate('/activities');
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
    questionsLevel2.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        finalScore += 1;
      }
    });
    setScore(finalScore);
    setGameFinished(true);
    toast.success('Juego terminado. ¡Revisa tus resultados!');
    saveActivity(finalScore, timer);
  };

  const saveActivity = async (finalScore, timeUsed) => {
    const activityData = {
      name: 'Responde Preguntas - Nivel 2',
      description: 'Actividad de preguntas basada en una historia más larga.',
      type: 'preguntas',
      scoreObtained: finalScore,
      timeUsed: timeUsed,
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
      } else {
        toast.error('Error al guardar la actividad');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad');
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
    adaptiveHeight: true
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
              <button onClick={() => sliderRef.current.slickPrev()} className="prev-button">Anterior</button>
              <button onClick={() => sliderRef.current.slickNext()} className="next-button">Siguiente</button>
            </div>

            <button onClick={handleSubmit} className="submit-button">Enviar Respuestas</button>
          </>
        ) : (
          <div className="results">
            <h2>¡Juego Terminado!</h2>
            <p>Puntuación final: {score}</p>
            <p>Tiempo total: {timer} segundos</p>
          </div>
        )}

        <ToastContainer />
      </div>
    </div>
  );
};

export default ActivityScreenLevel2;
