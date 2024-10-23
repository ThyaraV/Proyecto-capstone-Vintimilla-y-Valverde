import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const generateEquation = (type) => {
  const num1 = Math.floor(Math.random() * 100);
  const num2 = Math.floor(Math.random() * 100);

  if (type === 'sum') {
    return { equation: `${num1} + ${num2}`, correctAnswer: num1 + num2, num1, num2, operator: '+' };
  } else {
    return { equation: `${num1} - ${num2}`, correctAnswer: num1 - num2, num1, num2, operator: '-' };
  }
};

const ActivityScreen3 = () => {
  const [equations, setEquations] = useState([]);
  const [currentEquationIndex, setCurrentEquationIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [activitySaved, setActivitySaved] = useState(false);
  const [message, setMessage] = useState(''); // Cuadro de texto para el mensaje de respuesta
  const navigate = useNavigate();

  useEffect(() => {
    // Genera 2 sumas y 3 restas
    const generatedEquations = [
      generateEquation('sum'),
      generateEquation('sum'),
      generateEquation('sub'),
      generateEquation('sub'),
      generateEquation('sub'),
    ];
    setEquations(generatedEquations);
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
    if (gameFinished && !activitySaved) {
      saveActivity(score);
      setActivitySaved(true);
      
      // Redirigir a /activities después de 8 segundos
      setTimeout(() => {
        navigate('/activities');
      }, 6000); // 8000 milisegundos = 8 segundos
    }
  }, [gameFinished, activitySaved, score, navigate]);

  const handleSubmitAnswer = () => {
    const currentEquation = equations[currentEquationIndex];
    const correctAnswer = currentEquation.correctAnswer;

    // Actualizar el puntaje según la respuesta
    if (parseInt(userAnswer) === correctAnswer) {
      setScore((prevScore) => prevScore + 5);
      setMessage(`¡Correcto! Ganaste 5 puntos.`);
    } else {
      setScore((prevScore) => prevScore - 2);
      setMessage(`Incorrecto. La respuesta correcta es ${correctAnswer}. Perdiste 2 puntos.`);
    }

    setUserAnswer('');
    setTimeout(() => processNextStep(), 3000); // Retraso antes de limpiar el mensaje y avanzar
  };

  const processNextStep = () => {
    const nextEquationIndex = currentEquationIndex + 1;

    if (nextEquationIndex === equations.length) {
      setGameFinished(true);
    } else {
      setCurrentEquationIndex(nextEquationIndex);
      setMessage(''); // Limpiar el mensaje después de que se muestre durante 3 segundos
    }
  };

  const saveActivity = async (finalScore) => {
    const activityData = {
      name: 'Sumas y Restas',
      description: 'Actividad de sumas y restas con puntajes.',
      type: 'sumas_restas',
      scoreObtained: finalScore,
      timeUsed: timer,
      difficultyLevel: 1,
      observations: 'El paciente completó la actividad de sumas y restas.',
      progress: 'mejorando',
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

      if (!response.ok) {
        setMessage('Error al guardar la actividad');
      }
    } catch (error) {
      setMessage('Hubo un problema al guardar la actividad');
    }
  };

  return (
    <div className="game-screen">
      <h1>Juego de Sumas y Restas</h1>
      <p style={{ fontWeight: 'bold' }}>Puntaje: {score}</p>
      <p style={{ fontWeight: 'bold' }}>Tiempo: {timer} segundos</p>

      {gameFinished ? (
        <div className="game-finished">
          <h2 style={{ fontWeight: 'bold' }}>¡Juego terminado!</h2>
          <p>Tiempo total: {timer} segundos</p>
          <p>Puntaje final: {score}</p>
        </div>
      ) : (
        <>
          <div className="equation" style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold' }}>
            <div style={{ marginBottom: '10px' }}>
              <div>{equations[currentEquationIndex]?.num1}</div>
              <div>{equations[currentEquationIndex]?.operator} {equations[currentEquationIndex]?.num2}</div>
              <hr style={{ width: '50px', margin: '10px auto' }} />
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="?"
                style={{ fontSize: '32px', textAlign: 'center', width: '80px', height: '50px' }} // Más grande el cuadro de respuesta
                disabled={gameFinished}
              />
            </div>
            <button onClick={handleSubmitAnswer} disabled={gameFinished} style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Responder
            </button>
          </div>

          {message && (
            <div className="message-box" style={{ marginTop: '20px', fontSize: '22px', color: 'black', fontWeight: 'bold' }}>
              <p>{message}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityScreen3;
