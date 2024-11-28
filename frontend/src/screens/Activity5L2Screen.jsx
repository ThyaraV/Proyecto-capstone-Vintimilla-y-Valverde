// src/screens/ActivityScreenLevel2.jsx

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';

// Función para mezclar las opciones de respuesta
const shuffleOptions = (options, correctOption) => {
  const shuffledOptions = [...options];
  if (!shuffledOptions.includes(correctOption)) {
    shuffledOptions.push(correctOption);
  }
  return shuffledOptions.sort(() => Math.random() - 0.5);
};

// Lista de refranes de nivel 2
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

  // Mezclar opciones al cargar cada refrán
  useEffect(() => {
    const currentProverb = proverbsLevel2[currentProverbIndex];
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
    const currentProverb = proverbsLevel2[currentProverbIndex];
    if (selectedOption === currentProverb.correctOption) {
      setCorrectAnswers((prev) => prev + 1);
      setScore((prevScore) => prevScore + 0.5);
      setMessage("¡Correcto! Has ganado 0.5 puntos.");
    } else {
      setIncorrectAnswers((prev) => prev + 1);
      setMessage(`Incorrecto. La respuesta correcta es: "${currentProverb.correctOption}".`);
    }

    setTimeout(() => {
      if (currentProverbIndex + 1 < proverbsLevel2.length) {
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
    const totalPossiblePoints = proverbsLevel2.length * 0.5; // Total posible es 5 puntos
    const calculatedIncorrectAnswers = (totalPossiblePoints - totalCorrectPoints) / 0.5; // Número de respuestas incorrectas

    // Construir el objeto de datos de la actividad
    const activityData = {
      activityId, // ID de la actividad principal desde los parámetros de la ruta
      correctAnswers: correctAnswers, // Número de respuestas correctas
      incorrectAnswers: calculatedIncorrectAnswers, // Número de respuestas incorrectas
      timeUsed: timer,
      scoreObtained: score, // Debe ser 3.5, por ejemplo
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: 'El paciente completó la actividad de completar refranes en nivel intermedio.',
      patientId, // ID del paciente desde el estado de Redux
      difficultyLevel: 2, // Nivel de dificultad
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
      <h1>Completa los Refranes - Nivel 2</h1>
      {!gameFinished ? (
        <>
          <p>Puntaje: {score}</p>
          <p>Respuestas correctas: {correctAnswers} de {proverbsLevel2.length}</p>
          <p>Respuestas incorrectas: {incorrectAnswers} de {proverbsLevel2.length}</p>
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
          <p>Respuestas correctas: {correctAnswers} de {proverbsLevel2.length}</p>
          <p>Respuestas incorrectas: {incorrectAnswers} de {proverbsLevel2.length}</p>
          <p>Tiempo total: {timer} segundos</p>
          <p>Puntaje final: {score}</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreenLevel2;
