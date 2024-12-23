// src/screens/ActivityScreen10.jsx

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useRecordActivityMutation } from '../slices/treatmentSlice'; // Importa el hook de mutación
import { useSelector } from 'react-redux';

// Lista de objetos con imágenes y sus usos
const objects = [
  {
    id: 1,
    image: require('../images/cepillodientes.jpg'),
    correctUse: 'Limpiar los dientes',
    options: ['Cortar frutas', 'Limpiar los dientes', 'Iluminar una habitación']
  },
  {
    id: 2,
    image: require('../images/taza.jpg'),
    correctUse: 'Beber líquidos',
    options: ['Beber líquidos', 'Guardar ropa', 'Cortar papel']
  },
  {
    id: 3,
    image: require('../images/tijeras.jpg'),
    correctUse: 'Cortar papel o tela',
    options: ['Cortar madera', 'Cortar papel o tela', 'Limpiar ventanas']
  },
  {
    id: 4,
    image: require('../images/llaves.jpg'),
    correctUse: 'Abrir una puerta',
    options: ['Encender la TV', 'Pintar una pared', 'Abrir una puerta']
  },
  {
    id: 5,
    image: require('../images/cucharas.jpg'),
    correctUse: 'Comer alimentos',
    options: ['Comer alimentos', 'Coser ropa', 'Limpiar zapatos']
  },
  {
    id: 6,
    image: require('../images/plato.jpg'),
    correctUse: 'Colocar alimentos',
    options: ['Poner libros', 'Vestirse', 'Colocar alimentos']
  },
  {
    id: 7,
    image: require('../images/cepillopelo.jpg'),
    correctUse: 'Peinar el cabello',
    options: ['Pintar paredes', 'Peinar el cabello', 'Jugar en el patio']
  },
  {
    id: 8,
    image: require('../images/toallas.jpg'),
    correctUse: 'Secarse el cuerpo',
    options: ['Secarse el cuerpo', 'Guardar libros', 'Cargar herramientas']
  },
  {
    id: 9,
    image: require('../images/jabon.jpg'),
    correctUse: 'Lavarse las manos',
    options: ['Cocinar', 'Pintar lienzo', 'Lavarse las manos']
  },
  {
    id: 10,
    image: require('../images/zapatos.jpg'),
    correctUse: 'Caminar',
    options: ['Comer', 'Caminar', 'Leer']
  }
];

const ActivityScreen10 = ({ activity, treatmentId }) => { // Recibe 'activity' y 'treatmentId' como props
  const [currentObjectIndex, setCurrentObjectIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const navigate = useNavigate();

  // Obtener información del usuario autenticado
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Hook de la mutación para registrar actividad
  const [recordActivity, { isLoading: isRecording, error: recordError }] = useRecordActivityMutation();

  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  // Desplazar al inicio de la página cuando el juego inicia
  useEffect(() => {
    window.scrollTo(0, 0); // Desplazar al tope cuando se carga el componente
  }, []);

  const handleOptionClick = (selectedOption) => {
    const currentObject = objects[currentObjectIndex];

    let newScore = score;
    if (selectedOption === currentObject.correctUse) {
      newScore += 0.5;
      setScore(newScore);
      toast.success('¡Correcto! +0.5 puntos');
    } else {
      toast.error(`Incorrecto. La respuesta correcta es: ${currentObject.correctUse}`);
    }

    // Desplazar al tope de la página cada vez que se selecciona una opción
    window.scrollTo(0, 0);

    // Avanzar al siguiente objeto después de mostrar el mensaje
    setTimeout(() => {
      if (currentObjectIndex + 1 < objects.length) {
        setCurrentObjectIndex(currentObjectIndex + 1);
      } else {
        setGameFinished(true);
        toast.success('¡Juego terminado!');
        saveActivity(newScore, timer.toFixed(2)); // Guardar la actividad con el puntaje actualizado
        setTimeout(() => navigate('/api/treatments/activities'), 6000); // Redirigir después de 6 segundos
      }
    }, 2000);
  };

  // Función para guardar la actividad en el backend dentro del tratamiento correspondiente
  const saveActivity = async (finalScore, timeUsed) => {
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
      timeUsed: parseFloat(timeUsed),
      progress: 'mejorando', // Puedes ajustar esto según la lógica de tu aplicación
      observations: 'El usuario completó la actividad de identificar objetos y sus usos.',
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

  const currentObject = objects[currentObjectIndex] || {}; // Asegúrate de que `currentObject` no sea undefined

  return (
    <div className="identify-objects-game-container">
      <h1>Juego de Identificar Objetos y Usos</h1>
      <p className="timer-text">Tiempo: {timer.toFixed(2)} segundos</p>

      {!gameFinished ? (
        <div className="object-card">
          {/* Verificar si `image` existe antes de intentar mostrarla */}
          {currentObject.image ? (
            <img src={currentObject.image} alt="Objeto" className="object-image" />
          ) : (
            <p>Cargando imagen...</p>
          )}
          <div className="options-group">
            {currentObject.options && currentObject.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="option-button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="results">
          <h2>¡Juego Terminado!</h2>
          <p>Puntuación final: {score.toFixed(2)} / 5</p>
          <p>Tiempo total: {timer.toFixed(2)} segundos</p>
        </div>
      )}

      {/* Mostrar estado de guardado de la actividad */}
      {isRecording && <p>Guardando actividad...</p>}
      {recordError && <p>Error: {recordError?.data?.message || recordError.message}</p>}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreen10;
