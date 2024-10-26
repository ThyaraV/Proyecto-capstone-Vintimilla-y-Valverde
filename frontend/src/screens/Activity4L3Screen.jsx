import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// Importa las imágenes
import Image1 from '../images/imagen1.png'; 
import Image2 from '../images/imagen2.png'; 

const differences = [
  { id: 1, name: 'Ala gallo', x: 150, y: 290, width: 70, height: 70 },
  { id: 2, name: 'Gato', x: 67, y: 40, width: 50, height: 80 },
  { id: 3, name: 'Cola gallo', x: 103, y: 320, width: 50, height: 50 },
  { id: 4, name: 'Cerca', x: 120, y: 100, width: 50, height: 60 },
  { id: 5, name: 'Ramas de un árbol', x: 365, y: 34, width: 75, height: 75},
  { id: 6, name: 'Cuello ganzo', x: 265, y: 210, width: 65, height: 65 },
  { id: 7, name: 'Cesped', x: 95, y: 450, width: 60, height: 60 },
  { id: 8, name: 'Flores de arbusto', x: 400, y: 210, width: 80, height: 180 }, // Nueva diferencia
  { id: 9, name: 'Patas del ganzo', x: 250, y: 400, width: 150, height: 60 }, // Nueva diferencia
  { id: 10, name: 'flor', x: 210, y: 450, width: 60, height: 60 } // Nueva diferencia
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
