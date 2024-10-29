import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const fuseOptions = { includeScore: true, threshold: 0.4 };
const validProfessions = ['científico', 'ingeniero', 'matemático', 'arquitecto', 'doctor'];
const validCountries = ['brasil', 'canadá', 'argentina', 'colombia', 'venezuela'];
const validColors = ['rojo', 'azul', 'verde', 'amarillo', 'morado'];
const validSeasons = ['primavera', 'verano', 'otoño', 'invierno'];

const professionFuse = new Fuse(validProfessions, fuseOptions);
const countryFuse = new Fuse(validCountries, fuseOptions);
const colorFuse = new Fuse(validColors, fuseOptions);
const seasonFuse = new Fuse(validSeasons, fuseOptions);

const instructionsLevel3 = [
  { 
    id: 1, 
    type: 'input', 
    prompt: 'Escribe el nombre de una ciudad con más de seis letras', 
    validator: (response) => response.trim().length > 6 && ['montevideo', 'buenos aires', 'guatemala'].includes(response.trim().toLowerCase()),
    correctAnswer: 'Ej: Montevideo'
  },
  { 
    id: 2, 
    type: 'input', 
    prompt: 'Escribe una profesión científica que contenga la letra "e"', 
    validator: (response) => professionFuse.search(response.trim().toLowerCase()).length > 0 && response.includes('e'),
    correctAnswer: 'Ej: Científico'
  },
  { 
    id: 3, 
    type: 'multiple', 
    prompt: '¿Cuál de estas es una fruta que contiene semillas?', 
    options: ['Manzana', 'Pera', 'Pan'], 
    correctAnswer: 'Manzana' 
  },
  { 
    id: 4, 
    type: 'multiple', 
    prompt: '¿Cuál de estas es un fenómeno natural?', 
    options: ['Huracán', 'Silla', 'Feliz'], 
    correctAnswer: 'Huracán' 
  },
  { 
    id: 5, 
    type: 'input', 
    prompt: 'Escribe un color que tenga exactamente cinco letras', 
    validator: (response) => colorFuse.search(response.trim().toLowerCase()).length > 0 && response.trim().length === 5,
    correctAnswer: 'Ej: Verde' 
  },
  { 
    id: 6, 
    type: 'input', 
    prompt: 'Escribe un país de América del Sur que contenga la letra "a"', 
    validator: (response) => countryFuse.search(response.trim().toLowerCase()).some(result => result.item.includes('a')),
    correctAnswer: 'Ej: Argentina'
  },
  { 
    id: 7, 
    type: 'multiple', 
    prompt: '¿Cuál de estos es un aparato que se usa para medir el tiempo?', 
    options: ['Reloj', 'Libro', 'Mesa'], 
    correctAnswer: 'Reloj' 
  },
  { 
    id: 8, 
    type: 'multiple', 
    prompt: '¿Cuál de estas es una estación del año?', 
    options: ['Primavera', 'Lunes', 'Vaso'], 
    correctAnswer: 'Primavera' 
  },
  { 
    id: 9, 
    type: 'input', 
    prompt: 'Escribe una estación del año que empiece con la letra "i"', 
    validator: (response) => seasonFuse.search(response.trim().toLowerCase()).some(result => result.item.startsWith('i')),
    correctAnswer: 'Invierno'
  },
  { 
    id: 10, 
    type: 'input', 
    prompt: 'Escribe un animal que tenga la letra "o" y que sea terrestre', 
    validator: (response) => ['toro', 'leopardo', 'jaguar', 'lobo'].includes(response.trim().toLowerCase()),
    correctAnswer: 'Ej: Toro'
  }
];

const ActivityScreenLevel3 = () => {
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const [feedback, setFeedback] = useState({});
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
    let newFeedback = {};

    instructionsLevel3.forEach((instruction) => {
      const userResponse = responses[instruction.id] || ''; 

      if (instruction.type === 'input' && instruction.validator(userResponse)) {
        finalScore += 0.50;
        newFeedback[instruction.id] = { correct: true };
      } else if (instruction.type === 'multiple' && userResponse.toLowerCase() === instruction.correctAnswer.toLowerCase()) {
        finalScore += 0.50;
        newFeedback[instruction.id] = { correct: true };
      } else {
        newFeedback[instruction.id] = { 
          correct: false, 
          correctAnswer: instruction.correctAnswer 
        };
      }
    });

    setScore(finalScore);
    setFeedback(newFeedback);
    setGameFinished(true);
    toast.success('Juego terminado. ¡Revisa tus resultados!');
    saveActivity(finalScore, timer.toFixed(2));
  };

  const saveActivity = async (finalScore, timeUsed) => {
    const activityData = {
      name: 'Seguir Instrucciones - Nivel 3',
      description: 'Juego de seguir instrucciones con respuestas mixtas - Nivel 3.',
      type: 'seguir_instrucciones',
      scoreObtained: finalScore,
      timeUsed: parseFloat(timeUsed),
      difficultyLevel: 3,
      observations: 'El usuario completó la actividad satisfactoriamente.',
      progress: 'mejorando',
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
      <h1>Juego de Seguir Instrucciones - Nivel 3</h1>
      <p className="timer-text">Tiempo: {timer.toFixed(2)} segundos</p>

      <div className="instructions-container">
        {instructionsLevel3.map((instruction) => (
          <div key={instruction.id} className="instruction">
            <p>{instruction.prompt}</p>
            {instruction.type === 'input' ? (
              <>
                <input
                  type="text"
                  value={responses[instruction.id] || ''}
                  onChange={(e) => handleChange(instruction.id, e.target.value)}
                  disabled={gameFinished}
                  className="instruction-input"
                  placeholder="Escribe tu respuesta"
                />
                {gameFinished && feedback[instruction.id] && !feedback[instruction.id].correct && (
                  <p className="feedback-text">Respuesta correcta: {feedback[instruction.id].correctAnswer}</p>
                )}
              </>
            ) : (
              <div className="options-group">
                {instruction.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleChange(instruction.id, option)}
                    className={`option-button ${responses[instruction.id] === option ? 'selected' : ''} 
                      ${gameFinished && feedback[instruction.id] && !feedback[instruction.id].correct && option === instruction.correctAnswer ? 'correct-answer' : ''}`}
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

export default ActivityScreenLevel3;


