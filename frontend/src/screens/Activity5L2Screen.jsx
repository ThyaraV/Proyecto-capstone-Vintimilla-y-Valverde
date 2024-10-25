import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const shuffleOptions = (options, correctOption) => {
  const shuffledOptions = [...options];
  if (!shuffledOptions.includes(correctOption)) {
    shuffledOptions.push(correctOption);
  }
  return shuffledOptions.sort(() => Math.random() - 0.5);
};

const proverbsLevel2 = [
  { id: 1, phrase: "A quien madruga...", options: ["se le da bien", "consigue lo que quiere", "tiene todo"], correctOption: "Dios le ayuda" },
  { id: 2, phrase: "Ojos que no ven...", options: ["al mal tiempo buena cara", "no hay mal que por bien no venga", "el que mucho abarca poco aprieta"], correctOption: "corazón que no siente" },
  { id: 3, phrase: "Más vale tarde...", options: ["que nunca", "que pronto", "que rápido"], correctOption: "que nunca" },
  { id: 4, phrase: "Perro que ladra...", options: ["no corre más", "se cansa", "todo lo ve"], correctOption: "no muerde" },
  { id: 5, phrase: "A caballo regalado...", options: ["se le mira el diente", "se lo lleva la corriente", "se guarda"], correctOption: "no se le mira el diente" },
  { id: 6, phrase: "No por mucho madrugar...", options: ["se consigue todo", "se tiene éxito", "se llega primero"], correctOption: "amanece más temprano" },
  { id: 7, phrase: "Quien mucho abarca...", options: ["todo lo puede", "todo lo pierde", "se cansa"], correctOption: "poco aprieta" },
  { id: 8, phrase: "En boca cerrada...", options: ["se guarda todo", "entra el silencio", "no escucha nadie"], correctOption: "no entran moscas" },
  { id: 9, phrase: "Cría fama...", options: ["y todos te siguen", "y el resto te conoce", "y vives en paz"], correctOption: "y échate a dormir" },
  { id: 10, phrase: "Al mal tiempo...", options: ["no por mucho madrugar", "quien mucho abarca", "más vale tarde que nunca"], correctOption: "buena cara" }
];

const ActivityScreenLevel2 = () => {
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
    const currentProverb = proverbsLevel2[currentProverbIndex];
    setShuffledOptions(shuffleOptions(currentProverb.options, currentProverb.correctOption));
  }, [currentProverbIndex]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    const currentProverb = proverbsLevel2[currentProverbIndex];
    if (selectedOption === currentProverb.correctOption) {
      setScore((prevScore) => prevScore + 0.5);
      setMessage("¡Correcto! Has ganado 0.5 puntos.");
    } else {
      setMessage(`Incorrecto. La respuesta correcta es: "${currentProverb.correctOption}".`);
    }

    setTimeout(() => {
      if (currentProverbIndex + 1 < proverbsLevel2.length) {
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
      name: 'Forma las frases correctas - Nivel 2',
      description: 'Actividad para completar refranes seleccionando la opción correcta.',
      type: 'completa_refranes',
      scoreObtained: finalScore,
      timeUsed: timer,
      difficultyLevel: 2,
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
      <h1>Completa los Refranes - Nivel 2</h1>
      {!gameFinished ? (
        <>
          <p>Puntaje: {score}</p>
          <p>Tiempo: {timer} segundos</p>
          <div className="phrase-box">{proverbsLevel2[currentProverbIndex].phrase}...</div>
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
          <p>Respuestas correctas: {score} de {proverbsLevel2.length}</p>
          <p>Tiempo total: {timer} segundos</p>
        </div>
      )}
    </div>
  );
};

export default ActivityScreenLevel2;
