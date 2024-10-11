import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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

const ActivityScreen8 = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

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

  const saveActivity = async (finalScore, timeUsed) => {
    const activityData = {
      name: 'Responde Preguntas',
      description: 'Actividad de preguntas basada en el cuento El paseo de María.',
      type: 'preguntas',
      scoreObtained: finalScore,
      timeUsed: timeUsed,
      patientId: 'somePatientId', // Reemplaza con el ID real del paciente
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
          navigate('/'); // Regresar a la pantalla de inicio después de 5 segundos
        }, 5000);
      } else {
        toast.error('Error al guardar la actividad');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad');
    }
  };

  return (
    <div className="story-game-container">
      <div className="timer-container">
        <p>Tiempo: {timer} segundos</p>
      </div>
      <h1>El paseo de María</h1>
      <p className="story-text">
        María es una mujer alegre que vive en un pequeño pueblo. Un día soleado, decidió salir a pasear por el parque cercano. Primero, se puso su sombrero azul favorito y tomó su bolso. En el camino, se encontró con su amiga Ana, quien llevaba una bufanda roja. Juntas caminaron hasta la heladería donde compraron un helado de vainilla. Luego, se sentaron en un banco frente al lago y vieron a los patos nadando tranquilamente. Antes de regresar a casa, María compró flores amarillas para decorar su mesa del comedor. Al llegar a su casa, estaba feliz por haber tenido un día tan bonito.
      </p>

      <div className="questions-container">
        {questions.map((question) => (
          <div key={question.id} className="question">
            <p className="question-text">{question.question}</p>
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
        ))}
      </div>

      {!gameFinished ? (
        <button onClick={handleSubmit} className="submit-button">Enviar Respuestas</button>
      ) : (
        <div className="results">
          <h2>¡Juego Terminado!</h2>
          <p>Puntuación final: {score}</p>
          <p>Tiempo total: {timer} segundos</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreen8