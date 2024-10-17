import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const proverbs = [
  {
    id: 1,
    phrase: "A buen entendedor...",
    options: ["pocas palabras bastan", "el que mucho abarca poco aprieta", "no hay mal que por bien no venga", "más vale tarde que nunca"],
    correctOption: "pocas palabras bastan"
  },
  {
    id: 2,
    phrase: "Al mal tiempo...",
    options: ["buena cara", "no por mucho madrugar amanece más temprano", "quien mal anda mal acaba", "más vale prevenir que lamentar"],
    correctOption: "buena cara"
  },
  {
    id: 3,
    phrase: "Más vale pájaro en mano...",
    options: ["que cien volando", "que nada", "que mil sueños", "que promesas vacías"],
    correctOption: "que cien volando"
  },
  {
    id: 4,
    phrase: "No por mucho madrugar...",
    options: ["se llega primero", "se alcanza la meta", "amanece más temprano", "se consigue lo que se quiere"],
    correctOption: "amanece más temprano"
  },
  {
    id: 5,
    phrase: "El que mucho abarca...",
    options: ["poco aprieta", "mucho pierde", "todo lo pierde", "nada sostiene"],
    correctOption: "poco aprieta"
  }
];

const ActivityScreen5 = () => {
  const [currentProverbIndex, setCurrentProverbIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
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

  useEffect(() => {
    // Cuando el juego termina, después de 6 segundos redirige a /activities
    if (gameFinished) {
      const timeout = setTimeout(() => {
        navigate('/activities');
      }, 6000); // Espera de 6 segundos antes de redirigir

      return () => clearTimeout(timeout); // Limpia el timeout si el componente se desmonta
    }
  }, [gameFinished, navigate]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    const currentProverb = proverbs[currentProverbIndex];
    if (selectedOption === currentProverb.correctOption) {
      setCorrectAnswers((prevCorrect) => prevCorrect + 1);
      toast.success("¡Correcto!");
    } else {
      toast.error(`Incorrecto. La respuesta correcta es: "${currentProverb.correctOption}".`);
    }

    setTimeout(() => {
      if (currentProverbIndex + 1 < proverbs.length) {
        setCurrentProverbIndex((prevIndex) => prevIndex + 1);
        setSelectedOption(""); // Resetear la selección
      } else {
        setGameFinished(true);
        saveActivity(correctAnswers + 1); // Guardar actividad al terminar
      }
    }, 2000); // Espera de 2 segundos antes de pasar al siguiente refrán o terminar el juego
  };

  const saveActivity = async (finalScore) => {
    const activityData = {
      name: 'Forma las frases correctas',
      description: 'Actividad para completar refranes seleccionando la opción correcta.',
      type: 'completa_refranes',
      scoreObtained: finalScore, // Cantidad de respuestas correctas
      timeUsed: timer, // Tiempo total empleado
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
      } else {
        toast.error('Error al guardar la actividad');
      }
    } catch (error) {
      toast.error('Hubo un problema al guardar la actividad');
    }
  };

  return (
    <div className="phrase-game">
      <h1>Completa los Refranes</h1>
      {!gameFinished ? (
        <>
          <p>Tiempo: {timer} segundos</p>
          <p>{proverbs[currentProverbIndex].phrase}...</p>
          <div className="options-container">
            {proverbs[currentProverbIndex].options.map((option, index) => (
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
        </>
      ) : (
        <div className="results">
          <h2>¡Juego Terminado!</h2>
          <p>Respuestas correctas: {correctAnswers} de {proverbs.length}</p>
          <p>Tiempo total: {timer} segundos</p>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ActivityScreen5;
