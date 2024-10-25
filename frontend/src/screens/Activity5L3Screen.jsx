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

const proverbsLevel3 = [
  { id: 1, phrase: "El que la sigue...", options: ["se cansa al final", "tarde o temprano falla", "no siempre gana", "se agota"], correctOption: "la consigue" },
  { id: 2, phrase: "Del árbol caído...", options: ["todos lo ven", "nadie lo recoge", "nadie lo corta", "todos huyen"], correctOption: "todos hacen leña" },
  { id: 3, phrase: "A buen hambre...", options: ["todo sabe bien", "todo se come", "no se discute nada", "lo que sea es bueno"], correctOption: "no hay mal pan" },
  { id: 4, phrase: "Más vale prevenir...", options: ["que curar", "que lamentar", "que correr riesgos", "que no hacer nada"], correctOption: "que lamentar" },
  { id: 5, phrase: "Quien mucho duerme...", options: ["poco sueña", "todo lo pierde", "nada consigue", "se cansa menos"], correctOption: "mucho pierde" },
  { id: 6, phrase: "En casa del herrero...", options: ["nadie trabaja", "todo es de hierro", "no hay herramientas", "el tiempo se pierde"], correctOption: "cuchillo de palo" },
  { id: 7, phrase: "Cría fama...", options: ["y échate a correr", "y ya no importa", "y vives tranquilo", "y el resto te sigue"], correctOption: "y échate a dormir" },
  { id: 8, phrase: "Dime con quién andas...", options: ["y te diré qué haces", "y sabrás lo que vales", "y te diré quién eres", "y serás lo que sigas"], correctOption: "y te diré quién eres" },
  { id: 9, phrase: "El que no corre...", options: ["se cansa", "nunca llega", "nunca termina", "se pierde"], correctOption: "vuela" },
  { id: 10, phrase: "A palabras necias...", options: ["nadie las escucha", "nunca responden", "no se contestan", "todos las evitan"], correctOption: "oídos sordos" }
];

const ActivityScreenLevel3 = () => {
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
    const currentProverb = proverbsLevel3[currentProverbIndex];
    setShuffledOptions(shuffleOptions(currentProverb.options, currentProverb.correctOption));
  }, [currentProverbIndex]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    const currentProverb = proverbsLevel3[currentProverbIndex];
    if (selectedOption === currentProverb.correctOption) {
      setScore((prevScore) => prevScore + 0.5);
      setMessage("¡Correcto! Has ganado 0.5 puntos.");
    } else {
      setMessage(`Incorrecto. La respuesta correcta es: "${currentProverb.correctOption}".`);
    }

    setTimeout(() => {
      if (currentProverbIndex + 1 < proverbsLevel3.length) {
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
      name: 'Forma las frases correctas - Nivel 3',
      description: 'Actividad para completar refranes seleccionando la opción correcta.',
      type: 'completa_refranes',
      scoreObtained: finalScore,
      timeUsed: timer,
      difficultyLevel: 3,
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
      <h1>Completa los Refranes - Nivel 3</h1>
      {!gameFinished ? (
        <>
          <p>Puntaje: {score}</p>
          <p>Tiempo: {timer} segundos</p>
          <div className="phrase-box">{proverbsLevel3[currentProverbIndex].phrase}...</div>
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
          <p>Respuestas correctas: {score} de {proverbsLevel3.length}</p>
          <p>Tiempo total: {timer} segundos</p>
        </div>
      )}
    </div>
  );
};

export default ActivityScreenLevel3;
