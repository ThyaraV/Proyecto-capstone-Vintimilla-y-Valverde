import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const instructions = [
  { id: 1, prompt: 'Escribe dos palabras que empiecen por la letra A', wordCount: 2 },
  { id: 2, prompt: 'Escribe tres colores', wordCount: 3 },
  { id: 3, prompt: 'Escribe dos nombres de animales que vivan en el agua', wordCount: 2 },
  { id: 4, prompt: 'Escribe una ciudad que empiece con la letra M', wordCount: 1 },
  { id: 5, prompt: 'Escribe tres frutas que sean de color rojo', wordCount: 3 }
];

const ActivityScreen9 = () => {
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  const handleChange = (instructionId, index, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [instructionId]: {
        ...prevResponses[instructionId],
        [index]: value
      }
    }));
  };

  const handleSubmit = () => {
    let finalScore = 0;
    instructions.forEach((instruction) => {
      const userResponses = responses[instruction.id] || {};
      const filteredResponses = Object.values(userResponses).filter(
        (response) => response && response.trim() !== ''
      );
  
      // Validar cada instrucción según sus criterios específicos
      let isCorrect = false;
      switch (instruction.id) {
        case 1: // Instrucción: Escribe dos palabras que empiecen por la letra A
          isCorrect = filteredResponses.length === 2 && filteredResponses.every(word => word.toLowerCase().startsWith('a'));
          break;
        case 2: // Instrucción: Escribe tres colores
          isCorrect = filteredResponses.length === 3;
          break;
        case 3: // Instrucción: Escribe dos nombres de animales que vivan en el agua
          isCorrect = filteredResponses.length === 2;
          break;
        case 4: // Instrucción: Escribe una ciudad que empiece con la letra M
          isCorrect = filteredResponses.length === 1 && filteredResponses[0].toLowerCase().startsWith('m');
          break;
        case 5: // Instrucción: Escribe tres frutas que sean de color rojo
          isCorrect = filteredResponses.length === 3;
          break;
        default:
          break;
      }
  
      // Calificar con 0.50 puntos si la respuesta es correcta
      if (isCorrect) {
        finalScore += 0.50;
      }
    });
  
    setScore(finalScore);
    setGameFinished(true);
    toast.success('Juego terminado. ¡Revisa tus resultados!');
  };
  
  
  return (
    <div className="follow-instructions-container">
      <h1>Juego de Seguir Instrucciones</h1>
      <p className="timer-text">Tiempo: {timer.toFixed(2)} segundos</p>
      <div className="instructions-container">
        {instructions.map((instruction) => (
          <div key={instruction.id} className="instruction">
            <p>{instruction.prompt}</p>
            <div className="input-group">
              {Array.from({ length: instruction.wordCount }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  value={(responses[instruction.id] && responses[instruction.id][index]) || ''}
                  onChange={(e) => handleChange(instruction.id, index, e.target.value)}
                  disabled={gameFinished}
                  className="instruction-input"
                  placeholder={`Respuesta ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {!gameFinished ? (
        <button onClick={handleSubmit} className="submit-button">Enviar Respuestas</button>
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

export default ActivityScreen9;
