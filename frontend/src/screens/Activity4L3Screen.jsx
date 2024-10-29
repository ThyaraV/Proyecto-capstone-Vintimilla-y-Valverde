import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// Importa las imágenes
import Image1 from '../images/monalisa1.png'; 
import Image2 from '../images/monalisa2.png'; 

const differences = [
  { id: 1, name: 'dedo', x: 215, y: 390, width: 70, height: 60 },
  { id: 2, name: 'arboles', x: 68, y: 150, width: 85, height: 85 },
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
      const timeout = setTimeout(() => {
        navigate('/activities');
      }, 6000); // Redirige después de 6 segundos

      return () => clearTimeout(timeout); // Limpiar el temporizador si se desmonta el componente
    }
  }, [gameFinished, navigate]);

  // Selección de diferencias
  const handleOptionClick = (id) => {
    if (selectedOptions.length >= 10 && !selectedOptions.includes(id)) {
      toast.warning('Ya has seleccionado las 10 opciones');
      return;
    }

    if (!selectedOptions.includes(id)) {
      setSelectedOptions([...selectedOptions, id]); // Añadir diferencia seleccionada
      toast.success('Has seleccionado una diferencia');
    }
  };

  // Enviar respuestas
  const handleSubmit = () => {
    if (selectedOptions.length !== 10) {
      toast.error('Debes seleccionar las 10 opciones antes de enviar');
      return;
    }

    let correct = 0;
    let incorrect = 0;

    selectedOptions.forEach((id) => {
      const option = differences.find((diff) => diff.id === id);
      if (option) {
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
      <h1>Encuentra las 10 diferencias</h1>
      <p>Tiempo: {timer} segundos</p>

      <div className="images-container" style={{ position: 'relative' }}>
        <img src={Image1} alt="Imagen 1" style={{ width: '464px', height: '534px' }} />
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={Image2}
            alt="Imagen 2"
            style={{ width: '464px', height: '534px', cursor: 'pointer' }}
          />
          {/* Botones transparentes */}
          {differences.map((difference) => (
            <button
              key={difference.id}
              onClick={() => handleOptionClick(difference.id)}
              style={{
                position: 'absolute',
                top: `${difference.y}px`,
                left: `${difference.x}px`,
                width: `${difference.width}px`,
                height: `${difference.height}px`,
                backgroundColor: 'transparent',
                border: '2px solid rgba(255, 255, 255, 0.5)', // Líneas para ver la ubicación, puedes quitarlas
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
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
