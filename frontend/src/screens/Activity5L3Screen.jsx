// src/screens/ActivityScreenLevel3.jsx

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';

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
  const { treatmentId, activityId } = useParams(); // Extrae treatmentId y activityId de la ruta
  const [currentProverbIndex, setCurrentProverbIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Obtener información del usuario autenticado desde el estado de Redux
  const userInfo = useSelector((state) => state.auth.userInfo);
  const patientId = userInfo?._id;

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  // Barajar opciones al cargar cada refrán
  useEffect(() => {
    const currentProverb = proverbsLevel3[currentProverbIndex];
    setShuffledOptions(shuffleOptions(currentProverb.options, currentProverb.correctOption));
  }, [currentProverbIndex]);

  // Iniciar el temporizador
  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  // Manejar el guardado de la actividad y la navegación después de finalizar
  useEffect(() => {
    if (gameFinished) {
      saveActivity();
      const timeout = setTimeout(() => {
        navigate('/api/treatments/activities');
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [gameFinished, navigate]);

  // Manejar errores de la mutación
  useEffect(() => {
    if (recordError) {
      toast.error(`Error al guardar la actividad: ${recordError.data?.message || recordError.message}`);
    }
  }, [recordError]);

  // Manejar la selección de una opción
  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  // Manejar el envío de la respuesta
  const handleSubmitAnswer = () => {
    const currentProverb = proverbsLevel3[currentProverbIndex];
    if (selectedOption === currentProverb.correctOption) {
      setCorrectAnswers((prev) => prev + 1);
      setScore((prevScore) => prevScore + 0.5);
      setMessage("¡Correcto! Has ganado 0.5 puntos.");
    } else {
      setIncorrectAnswers((prev) => prev + 1);
      setMessage(`Incorrecto. La respuesta correcta es: "${currentProverb.correctOption}".`);
    }

    setTimeout(() => {
      if (currentProverbIndex + 1 < proverbsLevel3.length) {
        setCurrentProverbIndex((prevIndex) => prevIndex + 1);
        setSelectedOption("");
        setMessage(""); // Limpia el mensaje para el próximo refrán
      } else {
        setGameFinished(true);
        // saveActivity() se llamará desde el useEffect
      }
    }, 2000);
  };

  // Función para guardar la actividad utilizando RTK Query
  const saveActivity = async () => {
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

    // Calcular las respuestas incorrectas
    const totalCorrectPoints = score; // Cada respuesta correcta vale 0.5 puntos
    const totalPossiblePoints = proverbsLevel3.length * 0.5; // Total posible es 5 puntos
    const calculatedIncorrectAnswers = (totalPossiblePoints - totalCorrectPoints) / 0.5; // Número de respuestas incorrectas

    // Construir el objeto de datos de la actividad
    const activityData = {
      activityId, // ID de la actividad principal desde los parámetros de la ruta
      correctAnswers: correctAnswers, // Número de respuestas correctas
      incorrectAnswers: calculatedIncorrectAnswers, // Número de respuestas incorrectas
      timeUsed: timer,
      scoreObtained: score, // Debe ser 3.5, por ejemplo
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: 'El paciente completó la actividad de completar refranes en nivel avanzado.',
      patientId, // ID del paciente desde el estado de Redux
      difficultyLevel: 3, // Nivel de dificultad
      image: '', // No hay imagen asociada en esta actividad
    };

    console.log('Guardando actividad con los siguientes datos:', activityData);

    try {
      // Registrar la actividad dentro del tratamiento usando la mutación
      await recordActivity({ treatmentId, activityData }).unwrap();

      console.log('Actividad guardada correctamente');
      toast.success('Actividad guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      // El error será manejado por el useEffect anterior
    }
  };

  return (
    <div className="phrase-game">
      <h1>Completa los Refranes - Nivel 3</h1>
      {!gameFinished ? (
        <>
          <p>Puntaje: {score}</p>
          <p>Respuestas correctas: {correctAnswers} de {proverbsLevel3.length}</p>
          <p>Respuestas incorrectas: {incorrectAnswers} de {proverbsLevel3.length}</p>
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
          <p>Respuestas correctas: {correctAnswers} de {proverbsLevel3.length}</p>
          <p>Respuestas incorrectas: {incorrectAnswers} de {proverbsLevel3.length}</p>
          <p>Tiempo total: {timer} segundos</p>
          <p>Puntaje final: {score}</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreenLevel3;
