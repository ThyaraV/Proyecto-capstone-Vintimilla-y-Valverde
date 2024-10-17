import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// Importa las imágenes
import Image1 from '../images/Encontrar7diferenciasp1.png'; 
import Image2 from '../images/Encontrar7diferenciasp2.png'; 

const differences = [
  { id: 1, name: 'Expresión del niño', isCorrect: true },
  { id: 2, name: 'Nube adicional', isCorrect: false },
  { id: 3, name: 'Luz de la lámpara', isCorrect: true },
  { id: 4, name: 'Color dentro del libro', isCorrect: true },
  { id: 5, name: 'Hora del reloj', isCorrect: false },
  { id: 6, name: 'Posición del lápiz', isCorrect: false },
  { id: 7, name: 'Círculo del libro', isCorrect: true },
  { id: 8, name: 'Triángulo en la pared', isCorrect: true },
  { id: 9, name: 'Círculo detrás de la lámpara', isCorrect: true },
  { id: 10, name: 'Color del tablero de la pared', isCorrect: true },
  { id: 11, name: 'Número de libros en la mesa', isCorrect: false },
  { id: 12, name: 'Posición de los patos', isCorrect: false },
  { id: 13, name: 'Luz del sol más brillante', isCorrect: false },
  { id: 14, name: 'Número de lápices en la mesa', isCorrect: false },
  { id: 15, name: 'Sombras en la pared', isCorrect: false }
];

const ActivityScreen4 = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  // Temporizador
  useEffect(() => {
    let interval;
    if (!gameFinished) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameFinished]);

  // Navegar a /activities después de 6 segundos
  useEffect(() => {
    if (gameFinished) {
      const timer = setTimeout(() => {
        navigate('/activities');
      }, 6000); // Redirige después de 6 segundos

      return () => clearTimeout(timer); // Limpiar el temporizador si se desmonta el componente
    }
  }, [gameFinished, navigate]);

  // Selección de opciones
  const handleOptionClick = (id) => {
    if (selectedOptions.length >= 7 && !selectedOptions.includes(id)) {
      toast.warning('Ya has seleccionado las 7 opciones');
      return;
    }

    setSelectedOptions((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((option) => option !== id)
        : [...prevSelected, id]
    );
  };

  // Enviar respuestas
  const handleSubmit = () => {
    if (selectedOptions.length !== 7) {
      toast.error('Debes seleccionar las 7 opciones antes de enviar');
      return;
    }

    let correct = 0;
    let incorrect = 0;

    selectedOptions.forEach((id) => {
      const option = differences.find((diff) => diff.id === id);
      if (option && option.isCorrect) {
        correct += 1;
      } else {
        incorrect += 1;
      }
    });

    setCorrectAnswers(correct);
    setIncorrectAnswers(incorrect);
    setGameFinished(true);

    saveActivity(correct, incorrect);
  };

  // Guardar la actividad
  const saveActivity = async (correct, incorrect) => {
    const activityData = {
      name: 'Encuentra diferencias',
      description: 'Actividad para encontrar las diferencias entre dos imágenes.',
      type: 'diferencias_imagenes',
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      timeUsed: timer,
      scoreObtained: correct, // Se guarda la cantidad de respuestas correctas como puntaje
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
    <div className="find-differences-game">
      <h1>Encuentra las 7 diferencias</h1>
      <p>Tiempo: {timer} segundos</p>

      <div className="images-container">
        <img src={Image1} alt="Imagen 1" />
        <img src={Image2} alt="Imagen 2" />
      </div>

      <div className="options-container">
        {differences.map((difference) => (
          <div
            key={difference.id}
            className={`option ${selectedOptions.includes(difference.id) ? 'selected' : ''}`}
            onClick={() => handleOptionClick(difference.id)}
          >
            {difference.name}
          </div>
        ))}
      </div>

      {!gameFinished && (
        <button onClick={handleSubmit} className="submit-button">Enviar Respuesta</button>
      )}

      {gameFinished && (
        <div className="results">
          <p>Correctas: {correctAnswers}</p>
          <p>Incorrectas: {incorrectAnswers}</p>
          <p>Tiempo total: {timer} segundos</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityScreen4;
