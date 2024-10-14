import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

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

const ActivityScreen10 = () => {
  const [currentObjectIndex, setCurrentObjectIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

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

    // Avanzar al siguiente objeto después de mostrar el mensaje
    setTimeout(() => {
      if (currentObjectIndex + 1 < objects.length) {
        setCurrentObjectIndex(currentObjectIndex + 1);
      } else {
        setGameFinished(true);
        toast.success('¡Juego terminado!');
        saveActivity(newScore, timer.toFixed(2)); // Guardar la actividad con el puntaje actualizado
        setTimeout(() => navigate('/activities'), 8000); // Redirigir después de 8 segundos
      }
    }, 2000);
  };

  const saveActivity = async (finalScore, timeUsed) => {
    const activityData = {
      name: 'Identificar Objetos y Usos',
      description: 'Juego de identificar el uso correcto de varios objetos.',
      type: 'identificar_objetos',
      scoreObtained: finalScore,
      timeUsed: parseFloat(timeUsed),
      difficultyLevel: 1,
      observations: 'El usuario completó la actividad satisfactoriamente.',
      progress: 'mejorando',
      patientId: 'somePatientId' // Reemplazar con el ID real del paciente
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

  const currentObject = objects[currentObjectIndex];

  return (
    <div className="identify-objects-game-container">
      <h1>Juego de Identificar Objetos y Usos</h1>
      <p className="timer-text">Tiempo: {timer.toFixed(2)} segundos</p>

      {!gameFinished ? (
        <div className="object-card">
          <img src={currentObject.image} alt="Objeto" className="object-image" />
          <div className="options-group">
            {currentObject.options.map((option, index) => (
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

      <ToastContainer />
    </div>
  );
};

export default ActivityScreen10;
