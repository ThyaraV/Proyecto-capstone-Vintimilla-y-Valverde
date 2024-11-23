// src/screens/ActivityScreenLevel1.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const ActivityScreenLevel1 = ({ activity, treatmentId }) => { // Recibe 'activity' y 'treatmentId' como props
  const [currentProverbIndex, setCurrentProverbIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const userInfo = useSelector((state) => state.auth.userInfo); // Obtener información del usuario autenticado

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  // Iniciar el temporizador al montar el componente
  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  // Navegar a la lista de actividades una vez que el juego haya terminado
  useEffect(() => {
    if (gameFinished) {
      const timeout = setTimeout(() => {
        navigate('/api/treatments/activities');
      }, 6000); // Esperar 6 segundos antes de navegar
      return () => clearTimeout(timeout);
    }
  }, [gameFinished, navigate]);

  // Barajar las opciones al cambiar de refrán
  useEffect(() => {
    const currentProverb = proverbsLevel1[currentProverbIndex];
    setShuffledOptions(shuffleOptions(currentProverb.options, currentProverb.correctOption));
  }, [currentProverbIndex]);

  // Manejar la selección de una opción
  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  // Manejar el envío de la respuesta del usuario
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

  // Función para guardar la actividad en el backend dentro del tratamiento correspondiente
  const saveActivity = async (finalScore) => {
    // Validar que el usuario está autenticado
    if (!userInfo) {
      toast.error('Usuario no autenticado');
      return;
    }

    // Validar que treatmentId está definido
    if (!treatmentId) {
      toast.error('Tratamiento no identificado. No se puede guardar la actividad.');
      return;
    }

    // Construir el objeto de datos de la actividad
    const activityData = {
      activityId: activity._id, // ID de la actividad principal
      scoreObtained: finalScore,
      timeUsed: timer,
      progress: 'mejorando',
      observations: `El paciente completó la actividad de completar refranes en Nivel 1.`,
      // Puedes agregar más campos si es necesario
    };

    console.log('Guardando actividad con los siguientes datos:', activityData);

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación
      await recordActivity({ treatmentId, activityData }).unwrap();

      console.log('Actividad guardada correctamente');
      toast.success('Actividad guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      const errorMessage = error?.data?.message || error.message || 'Error desconocido';
      toast.error(`Hubo un problema al guardar la actividad: ${errorMessage}`);
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

          {/* Mostrar estado de guardado de la actividad */}
          {isRecording && <p>Guardando actividad...</p>}
          {recordError && <p>Error: {recordError?.data?.message || recordError.message}</p>}
        </>
      ) : (
        <div className="results">
          <h2>¡Juego Terminado!</h2>
          <p>Respuestas correctas: {score} / 5</p>
          <p>Tiempo total: {timer} segundos</p>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ActivityScreenLevel1;
