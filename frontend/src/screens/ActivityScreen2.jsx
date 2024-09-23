import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const generateEquation = (type) => {
  const num1 = Math.floor(Math.random() * 100);
  const num2 = Math.floor(Math.random() * 100);

  if (type === 'sum') {
    return { equation: `${num1} + ${num2}`, correctAnswer: num1 + num2 };
  } else {
    return { equation: `${num1} - ${num2}`, correctAnswer: num1 - num2 };
  }
};

const ActivityScreen3 = () => {
  const [equations, setEquations] = useState([]);
  const [currentEquationIndex, setCurrentEquationIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Bandera para bloquear el guardado duplicado
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

  const handleSubmitAnswer = () => {
    const currentEquation = equations[currentEquationIndex];
    const correctAnswer = currentEquation.correctAnswer;

    // Actualizar el puntaje según la respuesta
    if (parseInt(userAnswer) === correctAnswer) {
      setScore((prevScore) => {
        const newScore = prevScore + 5;
        processNextStep(newScore);
        return newScore;
      });
      toast.success('¡Correcto! Ganaste 5 puntos.');
    } else {
      setScore((prevScore) => {
        const newScore = prevScore - 2;
        processNextStep(newScore);
        return newScore;
      });
      toast.error(`Incorrecto. La respuesta correcta es ${correctAnswer}. Perdiste 2 puntos.`);
    }

    setUserAnswer('');
  };

  const processNextStep = (newScore) => {
    const nextEquationIndex = currentEquationIndex + 1;

    if (nextEquationIndex === equations.length) {
      // Si es la última ecuación, terminar el juego y guardar el puntaje
      setGameFinished(true);

      // Guardar la actividad solo si no se está guardando ya
      if (!isSaving) {
        setIsSaving(true); // Marca como guardando
        saveActivity(newScore);
      }
    } else {
      // Avanzar a la siguiente ecuación
      setCurrentEquationIndex(nextEquationIndex);
    }
  };

  const saveActivity = async (finalScore) => {
    const activityData = {
      name: 'Sumas y Restas',
      description: 'Actividad de sumas y restas con puntajes.',
      type: 'sumas_restas',
      scoreObtained: finalScore, // Usar el puntaje final actualizado
      timeUsed: timer, // Tiempo total en segundos
      difficultyLevel: 1, // Puedes ajustar esto
      observations: 'El paciente completó la actividad de sumas y restas.',
      progress: 'mejorando', // Puedes ajustar esto
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
        navigate('/activities'); // Redirige a otra página después de guardar
      } else {
        toast.error('Error al guardar la actividad');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad');
    }
  };

  return (
    <div className="game-screen">
      <h1>Juego de Sumas y Restas</h1>
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
          <div className="equation">
            <h3>{equations[currentEquationIndex]?.equation}</h3>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Escribe tu respuesta"
              disabled={isSaving} // Desactivar el input si ya se está guardando
            />
            <button onClick={handleSubmitAnswer} disabled={isSaving}>
              Responder
            </button>
          </div>
        </>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreen3;
