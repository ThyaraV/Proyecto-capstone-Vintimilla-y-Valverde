import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Función para barajar opciones
const shuffleOptions = (options, correctOption) => {
  const shuffledOptions = [...options];
  if (!shuffledOptions.includes(correctOption)) {
    shuffledOptions.push(correctOption);
  }
  return shuffledOptions.sort(() => Math.random() - 0.5);
};

const proverbsLevel1 = [
  { id: 1, phrase: "A buen entendedor...", options: ["más vale tarde que nunca", "el que mucho abarca poco aprieta"], correctOption: "pocas palabras bastan" },
  { id: 2, phrase: "Al mal tiempo...", options: ["quien mal anda mal acaba", "más vale prevenir que lamentar"], correctOption: "buena cara" },
  { id: 3, phrase: "Más vale pájaro en mano...", options: ["que nada", "que mil sueños"], correctOption: "que cien volando" },
  { id: 4, phrase: "No por mucho madrugar...", options: ["se llega primero", "se consigue lo que se quiere"], correctOption: "amanece más temprano" },
  { id: 5, phrase: "El que mucho abarca...", options: ["todo lo pierde", "nada sostiene"], correctOption: "poco aprieta" },
  { id: 6, phrase: "Ojos que no ven...", options: ["no hay mal que por bien no venga", "al mal tiempo buena cara"], correctOption: "corazón que no siente" },
  { id: 7, phrase: "Perro que ladra...", options: ["poco aprieta", "corre más"], correctOption: "no muerde" },
  { id: 8, phrase: "No hay mal...", options: ["que dure cien años", "que sea eterno"], correctOption: "que por bien no venga" },
  { id: 9, phrase: "Más vale tarde...", options: ["que pronto", "que rápido"], correctOption: "que nunca" },
  { id: 10, phrase: "El que ríe último...", options: ["no ríe más", "pierde"], correctOption: "ríe mejor" }
];

const ActivityScreenLevel1 = () => {
  const [currentProverbIndex, setCurrentProverbIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState('');
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

  useEffect(() => {
    if (gameFinished) {
      const timeout = setTimeout(() => {
        navigate('/activities');
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [gameFinished, navigate]);

  useEffect(() => {
    const currentProverb = proverbsLevel1[currentProverbIndex];
    setShuffledOptions(shuffleOptions(currentProverb.options, currentProverb.correctOption));
  }, [currentProverbIndex]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    const currentProverb = proverbsLevel1[currentProverbIndex];
    if (selectedOption === currentProverb.correctOption) {
      setScore((prevScore) => prevScore + 0.5);
      setMessage("¡Correcto! Has ganado 0.5 puntos.");
    } else {
      setMessage(`Incorrecto. La respuesta correcta es: "${currentProverb.correctOption}".`);
    }

    setTimeout(() => {
      if (currentProverbIndex + 1 < proverbsLevel1.length) {
        setCurrentProverbIndex((prevIndex) => prevIndex + 1);
        setSelectedOption("");
        setMessage(""); // Limpia el mensaje para el próximo refrán
      } else {
        setGameFinished(true);
        saveActivity(score); // Guardar actividad al terminar
      }
    }, 2000);
  };

  const saveActivity = async (finalScore) => {
    const activityData = {
      name: 'Forma las frases correctas - Nivel 1',
      description: 'Actividad para completar refranes seleccionando la opción correcta.',
      type: 'completa_refranes',
      scoreObtained: finalScore,
      timeUsed: timer,
      difficultyLevel: 1,
      patientId: 'somePatientId',
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
        console.error('Error al guardar la actividad');
      }
    } catch (error) {
      console.error('Hubo un problema al guardar la actividad');
    }
  };

  return (
    <div className="phrase-game">
      <h1>Completa los Refranes - Nivel 1</h1>
      {!gameFinished ? (
        <>
          <p>Puntaje: {score}</p>
          <p>Tiempo: {timer} segundos</p>
          <div className="phrase-box">{proverbsLevel1[currentProverbIndex].phrase}...</div>
          <div className="options-container">
            {shuffledOptions.map((option, index) => (
              <button
                key={index}
                className={`option-button ${selectedOption === option ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <button onClick={handleSubmitAnswer} className="submit-button" disabled={!selectedOption}>
            Enviar Respuesta
          </button>
          {message && <p className="message-box">{message}</p>}
        </>
      ) : (
        <div className="results">
          <h2>¡Juego Terminado!</h2>
          <p>Respuestas correctas: {score} / 5</p>
          <p>Tiempo total: {timer} segundos</p>
        </div>
      )}
    </div>
  );
};

export default ActivityScreenLevel1;

