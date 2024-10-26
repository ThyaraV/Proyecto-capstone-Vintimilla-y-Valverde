import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const validFruits = ['papaya', 'plátano', 'paraguayo', 'piña', 'pera'];
const validAnimals = ['tigre', 'tiburón', 'tapir', 'toro', 'tarántula'];
const validCitiesC = ['caracas', 'cali', 'cuenca', 'córdoba', 'cartagena'];

const instructionsLevel2 = [
  {
    id: 1,
    type: 'input',
    prompt: 'Escribe el nombre de una ciudad que comience con la letra C',
    validator: (response) => validCitiesC.includes(response.trim().toLowerCase())
  },
  {
    id: 2,
    type: 'input',
    prompt: 'Escribe una palabra que termine en "ción"',
    validator: (response) => response.trim().toLowerCase().endsWith('ción')
  },
  {
    id: 3,
    type: 'multiple',
    prompt: '¿Cuál de estas opciones es un vegetal?',
    options: ['Tomate', 'Cuchara', 'Mesa', 'León'],
    correctAnswer: 'Tomate'
  },
  {
    id: 4,
    type: 'input',
    prompt: 'Escribe el nombre de un animal que comience con la letra T',
    validator: (response) => validAnimals.includes(response.trim().toLowerCase())
  },
  {
    id: 5,
    type: 'input',
    prompt: 'Escribe el nombre de una fruta que comience con la letra P',
    validator: (response) => validFruits.includes(response.trim().toLowerCase())
  },
  {
    id: 6,
    type: 'multiple',
    prompt: '¿Cuál de estas es una estación del año?',
    options: ['Verano', 'Abril', 'Casa', 'Fruta'],
    correctAnswer: 'Verano'
  },
  {
    id: 7,
    type: 'input',
    prompt: 'Escribe una palabra que contenga la letra "z"',
    validator: (response) => response.trim().toLowerCase().includes('z')
  },
  {
    id: 8,
    type: 'multiple',
    prompt: '¿Cuál de estas es una bebida?',
    options: ['Agua', 'Tijeras', 'Celular', 'Gato'],
    correctAnswer: 'Agua'
  },
  {
    id: 9,
    type: 'input',
    prompt: 'Escribe un objeto que encuentres en una oficina',
    validator: (response) => ['computadora', 'escritorio', 'silla', 'teléfono'].includes(response.trim().toLowerCase())
  },
  {
    id: 10,
    type: 'multiple',
    prompt: '¿Cuál de estas es una prenda de vestir?',
    options: ['Camiseta', 'Pared', 'Avión', 'Pelota'],
    correctAnswer: 'Camiseta'
  }
];

const ActivityScreenLevel2 = () => {
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => setTimer((prevTimer) => prevTimer + 0.1), 100);
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

  const handleChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    let finalScore = 0;
    instructionsLevel2.forEach((instruction) => {
      const userResponse = responses[instruction.id] || '';
      if (instruction.type === 'input' && instruction.validator(userResponse)) {
        finalScore += 0.50;
      } else if (instruction.type === 'multiple' && userResponse === instruction.correctAnswer) {
        finalScore += 0.50;
      }
    });
    setScore(finalScore);
    setGameFinished(true);
    toast.success('Juego terminado. ¡Revisa tus resultados!');
    saveActivity(finalScore, timer.toFixed(2));
  };

  const saveActivity = async (finalScore, timeUsed) => {
    const activityData = {
      name: 'Seguir Instrucciones - Nivel 2',
      description: 'Juego de seguir instrucciones de mayor complejidad.',
      type: 'seguir_instrucciones',
      scoreObtained: finalScore,
      timeUsed: parseFloat(timeUsed),
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
        toast.success('Actividad guardada correctamente.');
      } else {
        toast.error('Error al guardar la actividad.');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad.');
    }
  };

  return (
    <div className="follow-instructions-container">
      <h1>Juego de Seguir Instrucciones - Nivel 2</h1>
      <p className="timer-text">Tiempo: {timer.toFixed(2)} segundos</p>
      <div className="instructions-container">
        {instructionsLevel2.map((instruction) => (
          <div key={instruction.id} className="instruction">
            <p>{instruction.prompt}</p>
            {instruction.type === 'input' ? (
              <input
                type="text"
                value={responses[instruction.id] || ''}
                onChange={(e) => handleChange(instruction.id, e.target.value)}
                disabled={gameFinished}
                className="instruction-input"
                placeholder="Escribe tu respuesta"
              />
            ) : (
              <div className="options-group">
                {instruction.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleChange(instruction.id, option)}
                    className={`option-button ${responses[instruction.id] === option ? 'selected' : ''}`}
                    disabled={gameFinished}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {!gameFinished ? (
        <button onClick={handleSubmit} className="submit-button">
          Enviar Respuestas
        </button>
      ) : (
        <div className="results">
          <h2>¡Juego Terminado!</h2>
          <p>Puntuación final: {score.toFixed(2)} / 5</p>
          <p>Tiempo total: {timer.toFixed(2)} segundos</p>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ActivityScreenLevel2;
