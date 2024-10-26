import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const questionsLevel3 = [
  {
    id: 1,
    question: '¿Dónde comenzó el viaje de Laura?',
    options: ['En la estación de tren', 'En el parque', 'En el centro comercial', 'En la biblioteca', 'En la playa'],
    correctAnswer: 'En la estación de tren'
  },
  // (otras preguntas aquí)
];

const ActivityScreenLevel3 = () => {
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
    questionsLevel3.forEach((question) => {
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
      name: 'Responde Preguntas - Nivel 3',
      description: 'Actividad de preguntas basada en una historia larga y complicada.',
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

export default ActivityScreenLevel3;
